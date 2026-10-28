import { freeName, sameName, splitExtension, validateName } from "./names.ts"

/**
 * Virtual file system of the trainer. The state is a flat map of nodes; every operation
 * returns a new state and never changes the old one, so undo and "start again" are trivial.
 */

export type NodeId = string
export type NodeKind = "folder" | "file"

export interface FsNode {
  readonly id: NodeId
  readonly name: string
  readonly kind: NodeKind
  /** `null` only for the desktop and the recycle bin. */
  readonly parentId: NodeId | null
  /** For items in the recycle bin: the folder to restore them to. */
  readonly deletedFrom?: NodeId
}

export interface FsState {
  readonly nodes: Readonly<Record<NodeId, FsNode>>
  readonly nextId: number
}

export const DESKTOP_ID: NodeId = "desktop"
export const BIN_ID: NodeId = "bin"

export type FsResult = { readonly ok: true; readonly state: FsState; readonly id: NodeId } | { readonly ok: false; readonly error: string }

const fail = (error: string): FsResult => ({ ok: false, error })

export const emptyState = (): FsState => ({
  nodes: {
    [DESKTOP_ID]: { id: DESKTOP_ID, name: "Робочий стіл", kind: "folder", parentId: null },
    [BIN_ID]: { id: BIN_ID, name: "Кошик", kind: "folder", parentId: null }
  },
  nextId: 1
})

export const getNode = (state: FsState, id: NodeId): FsNode | undefined => state.nodes[id]

export const isSystem = (id: NodeId): boolean => id === DESKTOP_ID || id === BIN_ID

const byFolderThenName = (a: FsNode, b: FsNode): number =>
  a.kind === b.kind ? a.name.localeCompare(b.name, "uk") : a.kind === "folder" ? -1 : 1

export const childrenOf = (state: FsState, parentId: NodeId): ReadonlyArray<FsNode> =>
  Object.values(state.nodes)
    .filter((n) => n.parentId === parentId)
    .sort(byFolderThenName)

const findChild = (state: FsState, parentId: NodeId, name: string, exceptId?: NodeId): FsNode | undefined =>
  childrenOf(state, parentId).find((n) => n.id !== exceptId && sameName(n.name, name))

/** True when `id` is `ancestorId` itself or lies somewhere inside it. */
export const isInside = (state: FsState, id: NodeId, ancestorId: NodeId): boolean => {
  for (let cur: FsNode | undefined = getNode(state, id); cur; cur = cur.parentId === null ? undefined : getNode(state, cur.parentId)) {
    if (cur.id === ancestorId) return true
  }
  return false
}

export const isInBin = (state: FsState, id: NodeId): boolean => id !== BIN_ID && isInside(state, id, BIN_ID)

/** Names from the desktop down: `["Мої фото", "ліс.jpg"]`. Empty for the desktop itself. */
export const pathOf = (state: FsState, id: NodeId): ReadonlyArray<string> => {
  const node = getNode(state, id)
  if (!node || node.parentId === null) return []
  return [...pathOf(state, node.parentId), node.name]
}

/** Finds a node by a path relative to the desktop: `Мої фото/ліс.jpg`. Letter case is ignored. */
export const findByPath = (state: FsState, path: string): FsNode | undefined => {
  const parts = path.split("/").map((p) => p.trim()).filter((p) => p.length > 0)
  let cur = getNode(state, DESKTOP_ID)
  for (const part of parts) {
    if (!cur || cur.kind !== "folder") return undefined
    cur = findChild(state, cur.id, part)
  }
  return cur
}

const put = (state: FsState, node: FsNode): FsState => ({ ...state, nodes: { ...state.nodes, [node.id]: node } })

const withoutDeletedFrom = (node: FsNode): FsNode => {
  const { deletedFrom: _ignored, ...rest } = node
  return rest
}

const checkTarget = (state: FsState, targetId: NodeId): string | null => {
  const target = getNode(state, targetId)
  if (!target || target.kind !== "folder") return "Це не папка"
  if (targetId !== BIN_ID && isInBin(state, targetId)) return "Спершу віднови папку з кошика"
  return null
}

export const create = (state: FsState, parentId: NodeId, kind: NodeKind, wantedName: string): FsResult => {
  const targetError = checkTarget(state, parentId) ?? (parentId === BIN_ID ? "У кошику не можна створювати" : null)
  if (targetError) return fail(targetError)
  const nameError = validateName(wantedName)
  if (nameError) return fail(nameError)
  const name = freeName(wantedName.trim(), (n) => findChild(state, parentId, n) !== undefined)
  const id = `n${state.nextId}`
  return { ok: true, id, state: put({ ...state, nextId: state.nextId + 1 }, { id, name, kind, parentId }) }
}

export const rename = (state: FsState, id: NodeId, newName: string): FsResult => {
  const node = getNode(state, id)
  if (!node || isSystem(id)) return fail("Цей об'єкт не можна перейменувати")
  if (node.parentId === BIN_ID) return fail("Спершу віднови об'єкт з кошика")
  const nameError = validateName(newName)
  if (nameError) return fail(nameError)
  const name = newName.trim()
  if (node.parentId !== null && findChild(state, node.parentId, name, id)) return fail(`Тут уже є об'єкт з назвою «${name}»`)
  return { ok: true, id, state: put(state, { ...node, name }) }
}

/** Moves to another folder. Moving into the recycle bin is the same as deleting. */
export const move = (state: FsState, id: NodeId, targetId: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || isSystem(id)) return fail("Цей об'єкт не можна перемістити")
  if (targetId === BIN_ID) return remove(state, id)
  const targetError = checkTarget(state, targetId)
  if (targetError) return fail(targetError)
  if (node.parentId === targetId) return { ok: true, id, state }
  if (isInside(state, targetId, id)) return fail("Папку не можна перемістити саму в себе")
  const target = getNode(state, targetId)
  if (findChild(state, targetId, node.name)) return fail(`У папці «${target?.name}» вже є «${node.name}»`)
  return { ok: true, id, state: put(state, { ...withoutDeletedFrom(node), parentId: targetId }) }
}

const copyTree = (state: FsState, sourceId: NodeId, parentId: NodeId, name: string): { readonly state: FsState; readonly id: NodeId } => {
  const source = getNode(state, sourceId)
  if (!source) return { state, id: sourceId }
  const id = `n${state.nextId}`
  const withCopy = put({ ...state, nextId: state.nextId + 1 }, { id, name, kind: source.kind, parentId })
  const children = childrenOf(state, sourceId)
  const finalState = children.reduce((acc, child) => copyTree(acc, child.id, id, child.name).state, withCopy)
  return { state: finalState, id }
}

/** Copies a file or a whole folder. A copy into the same folder gets the name `море – копія.jpg`. */
export const copy = (state: FsState, id: NodeId, targetId: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || isSystem(id)) return fail("Цей об'єкт не можна скопіювати")
  if (targetId === BIN_ID) return fail("У кошик не копіюють, а видаляють")
  const targetError = checkTarget(state, targetId)
  if (targetError) return fail(targetError)
  if (node.kind === "folder" && isInside(state, targetId, id)) return fail("Папку не можна скопіювати саму в себе")
  const target = getNode(state, targetId)
  let name = node.name
  if (node.parentId === targetId) {
    const { base, ext } = splitExtension(node.name)
    name = freeName(`${base} – копія${ext}`, (n) => findChild(state, targetId, n) !== undefined)
  } else if (findChild(state, targetId, node.name)) {
    return fail(`У папці «${target?.name}» вже є «${node.name}»`)
  }
  const result = copyTree(state, id, targetId, name)
  return { ok: true, ...result }
}

/** Puts an item into the recycle bin and remembers where it came from. */
export const remove = (state: FsState, id: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || isSystem(id)) return fail("Цей об'єкт не можна видалити")
  if (node.parentId === BIN_ID) return fail("Об'єкт уже в кошику")
  if (node.parentId === null) return fail("Цей об'єкт не можна видалити")
  return { ok: true, id, state: put(state, { ...node, parentId: BIN_ID, deletedFrom: node.parentId }) }
}

export const restore = (state: FsState, id: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || node.parentId !== BIN_ID) return fail("Цього об'єкта немає в кошику")
  const home = node.deletedFrom !== undefined && getNode(state, node.deletedFrom) && !isInBin(state, node.deletedFrom) ? node.deletedFrom : DESKTOP_ID
  if (findChild(state, home, node.name)) return fail(`У папці «${getNode(state, home)?.name}» вже є «${node.name}»`)
  return { ok: true, id, state: put(state, { ...withoutDeletedFrom(node), parentId: home }) }
}

const dropTree = (state: FsState, id: NodeId): FsState => {
  const afterChildren = childrenOf(state, id).reduce((acc, child) => dropTree(acc, child.id), state)
  const { [id]: _dropped, ...rest } = afterChildren.nodes
  return { ...afterChildren, nodes: rest }
}

export const emptyBin = (state: FsState): FsState => childrenOf(state, BIN_ID).reduce((acc, n) => dropTree(acc, n.id), state)

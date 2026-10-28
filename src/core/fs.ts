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
  /** `null` only for the desktop, the recycle bin and «Цей ПК». */
  readonly parentId: NodeId | null
  /** For items in the recycle bin: the folder to restore them to. */
  readonly deletedFrom?: NodeId
  /** Taken back out of the recycle bin at least once; a goal can ask for it (5 клас, вправа 6). */
  readonly restored?: true
  /** A shortcut (ярлик) is a file that points at another object; deleting it leaves that object alone. */
  readonly target?: NodeId
  /** A compressed ZIP folder (8 клас): Windows opens it like a folder. */
  readonly zip?: true
  /** Opened in a program through «Файл → Відкрити»; a goal can ask for it (3 клас, с. 54). */
  readonly opened?: true
}

export interface FsState {
  readonly nodes: Readonly<Record<NodeId, FsNode>>
  readonly nextId: number
}

export const DESKTOP_ID: NodeId = "desktop"
export const BIN_ID: NodeId = "bin"
/** «Цей ПК»: holds the drives. Drives are folders named `C:` and `D:`. */
export const THIS_PC_ID: NodeId = "this-pc"
export const DRIVE_LETTERS = ["C", "D"] as const
export type DriveLetter = (typeof DRIVE_LETTERS)[number]
export const driveId = (letter: DriveLetter): NodeId => `drive-${letter}`

const DRIVE_PATTERN = /^[a-z]:$/i

export type FsResult = { readonly ok: true; readonly state: FsState; readonly id: NodeId } | { readonly ok: false; readonly error: string }

const fail = (error: string): FsResult => ({ ok: false, error })

export const emptyState = (): FsState => ({
  nodes: {
    [DESKTOP_ID]: { id: DESKTOP_ID, name: "Робочий стіл", kind: "folder", parentId: null },
    [BIN_ID]: { id: BIN_ID, name: "Кошик", kind: "folder", parentId: null },
    [THIS_PC_ID]: { id: THIS_PC_ID, name: "Цей ПК", kind: "folder", parentId: null },
    ...Object.fromEntries(
      DRIVE_LETTERS.map((letter) => [driveId(letter), { id: driveId(letter), name: `${letter}:`, kind: "folder", parentId: THIS_PC_ID }])
    )
  },
  nextId: 1
})

export const getNode = (state: FsState, id: NodeId): FsNode | undefined => state.nodes[id]

export const isDrive = (id: NodeId): boolean => DRIVE_LETTERS.some((letter) => driveId(letter) === id)

/** Desktop, bin, «Цей ПК» and drives cannot be renamed, moved or deleted. */
export const isSystem = (id: NodeId): boolean => id === DESKTOP_ID || id === BIN_ID || id === THIS_PC_ID || isDrive(id)

/** What the student sees: drive `D:` is shown as «Локальний диск (D:)», as in Windows. */
export const isShortcut = (node: FsNode): boolean => node.target !== undefined

export const displayName = (node: FsNode): string => (isDrive(node.id) ? `Локальний диск (${node.name})` : node.name)

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

/** Names from the desktop or a drive down: `["Мої фото", "ліс.jpg"]`, `["D:", "Мої уроки"]`. */
export const pathOf = (state: FsState, id: NodeId): ReadonlyArray<string> => {
  const node = getNode(state, id)
  if (!node || node.parentId === null) return []
  return [...pathOf(state, node.parentId), node.name]
}

/**
 * Full path in Windows style: `D:\\Мої уроки\\монітор.jpg`. Items on the desktop start with «Робочий стіл».
 */
export const windowsPath = (state: FsState, id: NodeId): string => {
  if (id === THIS_PC_ID) return "Цей ПК"
  if (isInBin(state, id) || id === BIN_ID) return "Кошик"
  const parts = pathOf(state, id)
  const onDrive = parts[0] !== undefined && DRIVE_PATTERN.test(parts[0])
  if (onDrive) return parts.length === 1 ? `${parts[0]}\\` : parts.join("\\")
  return ["Робочий стіл", ...parts].join("\\")
}

/**
 * Finds a node by a path relative to the desktop (`Мої фото/ліс.jpg`) or to a drive
 * (`D:/Мої уроки/монітор.jpg`). Both `/` and `\\` separate parts. Letter case is ignored.
 */
export const findByPath = (state: FsState, path: string): FsNode | undefined => {
  const parts = path.split(/[/\\]/).map((p) => p.trim()).filter((p) => p.length > 0)
  const first = parts[0]
  const onDrive = first !== undefined && DRIVE_PATTERN.test(first)
  let cur = onDrive ? findChild(state, THIS_PC_ID, first) : getNode(state, DESKTOP_ID)
  for (const part of onDrive ? parts.slice(1) : parts) {
    if (!cur || cur.kind !== "folder") return undefined
    cur = findChild(state, cur.id, part)
  }
  return cur
}

/** Folder typed into the address bar: `D:\\Мої уроки`, `Робочий стіл\\Мої фото`, `Цей ПК`. `null` if there is no such folder. */
export const resolveAddress = (state: FsState, text: string): NodeId | null => {
  const trimmed = text.trim()
  if (sameName(trimmed, "Цей ПК")) return THIS_PC_ID
  if (sameName(trimmed, "Кошик")) return BIN_ID
  const parts = trimmed.split(/[/\\]/).filter((p) => p.trim().length > 0)
  const relative = parts[0] !== undefined && sameName(parts[0], "Робочий стіл") ? parts.slice(1) : parts
  const node = findByPath(state, relative.join("/"))
  return node && node.kind === "folder" ? node.id : null
}

const put = (state: FsState, node: FsNode): FsState => ({ ...state, nodes: { ...state.nodes, [node.id]: node } })

const withoutDeletedFrom = (node: FsNode): FsNode => {
  const { deletedFrom: _ignored, ...rest } = node
  return rest
}

const checkTarget = (state: FsState, targetId: NodeId): string | null => {
  const target = getNode(state, targetId)
  if (!target || target.kind !== "folder") return "Це не папка"
  if (targetId === THIS_PC_ID) return "У «Цей ПК» лежать лише диски. Відкрий диск і працюй у ньому"
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

/**
 * «Зберегти як»: a new file `name` in `folderId`. The extension is added when the student did not type it.
 * Unlike «Створити», an existing name is an error, not «(2)»: the student chooses another name.
 */
export const saveFile = (state: FsState, folderId: NodeId, name: string, ext: string): FsResult => {
  const trimmed = name.trim()
  const fileName = trimmed.toLocaleLowerCase("uk").endsWith(ext.toLocaleLowerCase("uk")) ? trimmed : `${trimmed}${ext}`
  if (trimmed.length === 0) return fail("Введи ім'я файлу")
  if (folderId === BIN_ID) return fail("У кошик не можна зберігати файли")
  if (findChild(state, folderId, fileName)) return fail(`Файл «${fileName}» уже є в цій папці. Введи інше ім'я.`)
  return create(state, folderId, "file", fileName)
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
  const fromBin = node.parentId === BIN_ID ? { restored: true as const } : {}
  return { ok: true, id, state: put(state, { ...withoutDeletedFrom(node), ...fromBin, parentId: targetId }) }
}

const copyTree = (state: FsState, sourceId: NodeId, parentId: NodeId, name: string): { readonly state: FsState; readonly id: NodeId } => {
  const source = getNode(state, sourceId)
  if (!source) return { state, id: sourceId }
  const id = `n${state.nextId}`
  const target = source.target === undefined ? {} : { target: source.target }
  const zip = source.zip ? { zip: true as const } : {}
  const withCopy = put({ ...state, nextId: state.nextId + 1 }, { id, name, kind: source.kind, parentId, ...target, ...zip })
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

/**
 * Creates a shortcut to `id` in `parentId`, named `Моя папка – ярлик`. A shortcut to a shortcut
 * points at the same object, as in Windows.
 */
export const createShortcut = (state: FsState, id: NodeId, parentId: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || id === DESKTOP_ID || isInBin(state, id)) return fail("Для цього об'єкта не можна створити ярлик")
  const targetError = checkTarget(state, parentId) ?? (parentId === BIN_ID ? "У кошику не можна створювати" : null)
  if (targetError) return fail(targetError)
  const name = freeName(isShortcut(node) ? node.name : `${displayName(node)} – ярлик`, (n) => findChild(state, parentId, n) !== undefined)
  const newId = `n${state.nextId}`
  const shortcut: FsNode = { id: newId, name, kind: "file", parentId, target: node.target ?? id }
  return { ok: true, id: newId, state: put({ ...state, nextId: state.nextId + 1 }, shortcut) }
}

/**
 * «Надіслати → Стиснута ZIP-папка»: a `name.zip` next to the items with copies of them inside.
 * The originals stay where they were.
 */
export const compress = (state: FsState, ids: ReadonlyArray<NodeId>, name: string): FsResult => {
  const first = ids[0] === undefined ? undefined : getNode(state, ids[0])
  if (!first || first.parentId === null || ids.some(isSystem)) return fail("Ці об'єкти не можна стиснути")
  const parentId = first.parentId
  if (parentId === BIN_ID || isInBin(state, parentId)) return fail("Спершу віднови об'єкти з кошика")
  const made = create(state, parentId, "folder", `${name}.zip`)
  if (!made.ok) return made
  const zipped = put(made.state, { ...(getNode(made.state, made.id) ?? first), zip: true })
  const filled = ids.reduce((acc, id) => copyTree(acc, id, made.id, getNode(acc, id)?.name ?? "").state, zipped)
  return { ok: true, id: made.id, state: filled }
}

/** «Файл → Відкрити» in a program. */
export const markOpened = (state: FsState, id: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || node.kind !== "file" || isInBin(state, id)) return fail("Цей файл не можна відкрити")
  return { ok: true, id, state: put(state, { ...node, opened: true }) }
}

/** Turns a folder into a ZIP folder; scenario trees use it for `name.zip` entries. */
export const markZip = (state: FsState, id: NodeId): FsState => {
  const node = getNode(state, id)
  return node?.kind === "folder" ? put(state, { ...node, zip: true }) : state
}

/** «Видобути все…»: a folder named like the archive (without `.zip`) next to it, with everything from it. */
export const extractAll = (state: FsState, zipId: NodeId): FsResult => {
  const zip = getNode(state, zipId)
  if (!zip?.zip || zip.parentId === null) return fail("Це не ZIP-папка")
  if (isInBin(state, zipId)) return fail("Спершу віднови архів з кошика")
  const made = create(state, zip.parentId, "folder", splitExtension(zip.name).base)
  if (!made.ok) return made
  const filled = childrenOf(state, zipId).reduce((acc, child) => copyTree(acc, child.id, made.id, child.name).state, made.state)
  return { ok: true, id: made.id, state: filled }
}

/** What a shortcut opens, or `undefined` when its object was deleted or lies in the bin. */
export const shortcutTarget = (state: FsState, node: FsNode): FsNode | undefined => {
  if (node.target === undefined) return undefined
  const target = getNode(state, node.target)
  return target && !isInBin(state, target.id) ? target : undefined
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
  return { ok: true, id, state: put(state, { ...withoutDeletedFrom(node), parentId: home, restored: true }) }
}

const dropTree = (state: FsState, id: NodeId): FsState => {
  const afterChildren = childrenOf(state, id).reduce((acc, child) => dropTree(acc, child.id), state)
  const { [id]: _dropped, ...rest } = afterChildren.nodes
  return { ...afterChildren, nodes: rest }
}

/** Deletes an item from the recycle bin for good. */
export const deleteForever = (state: FsState, id: NodeId): FsResult => {
  const node = getNode(state, id)
  if (!node || node.parentId !== BIN_ID) return fail("Назавжди можна видалити лише те, що лежить у кошику")
  return { ok: true, id, state: dropTree(state, id) }
}

export const emptyBin = (state: FsState): FsState => childrenOf(state, BIN_ID).reduce((acc, n) => dropTree(acc, n.id), state)

import { create, createShortcut, DESKTOP_ID, DRIVE_LETTERS, driveId, emptyState, findByPath, type FsResult, type FsState, type NodeId, rename } from "./fs.ts"

/**
 * Compact description of a starting desktop for scenario authors.
 * An object is a folder, `null` is a file, a string is a shortcut to that path:
 * `{ "Мої фото": { "ліс.jpg": null }, "вірш.txt": null, "Ігри – ярлик": "D:/Ігри" }`.
 */
export type TreeSpec = { readonly [name: string]: TreeSpec | null | string }

interface PendingShortcut {
  readonly parentId: NodeId
  readonly name: string
  readonly target: string
}

const orThrow = (name: string, result: FsResult): Extract<FsResult, { ok: true }> => {
  if (!result.ok) throw new Error(`Помилка в сценарії: «${name}»: ${result.error}`)
  return result
}

/** Builds folders and files; shortcuts wait until everything they may point at exists. */
const addSpec = (state: FsState, parentId: NodeId, spec: TreeSpec, pending: PendingShortcut[]): FsState =>
  Object.entries(spec).reduce((acc, [name, child]) => {
    if (typeof child === "string") {
      pending.push({ parentId, name, target: child })
      return acc
    }
    const result = orThrow(name, create(acc, parentId, child === null ? "file" : "folder", name))
    return child === null ? result.state : addSpec(result.state, result.id, child, pending)
  }, state)

const addShortcut = (state: FsState, { parentId, name, target }: PendingShortcut): FsState => {
  const node = findByPath(state, target)
  if (!node) throw new Error(`Помилка в сценарії: ярлик «${name}» указує на «${target}», а такого немає`)
  const made = orThrow(name, createShortcut(state, node.id, parentId))
  return orThrow(name, rename(made.state, made.id, name)).state
}

/** Contents of drives by letter: `{ "D:": { "Мої уроки": {} } }`. */
export type DrivesSpec = { readonly [drive: string]: TreeSpec }

export const buildState = (desktop: TreeSpec, drives: DrivesSpec = {}): FsState => {
  const pending: PendingShortcut[] = []
  const built = Object.entries(drives).reduce((acc, [drive, spec]) => {
    const letter = DRIVE_LETTERS.find((l) => `${l}:` === drive.toUpperCase())
    if (letter === undefined) throw new Error(`Помилка в сценарії: немає диска «${drive}», є лише C: і D:`)
    return addSpec(acc, driveId(letter), spec, pending)
  }, addSpec(emptyState(), DESKTOP_ID, desktop, pending))
  return pending.reduce(addShortcut, built)
}

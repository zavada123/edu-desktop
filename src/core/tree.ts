import { create, DESKTOP_ID, DRIVE_LETTERS, driveId, emptyState, type FsState, type NodeId } from "./fs.ts"

/**
 * Compact description of a starting desktop for scenario authors.
 * An object is a folder, `null` is a file:
 * `{ "Мої фото": { "ліс.jpg": null }, "вірш.txt": null }`.
 */
export type TreeSpec = { readonly [name: string]: TreeSpec | null }

const addSpec = (state: FsState, parentId: NodeId, spec: TreeSpec): FsState =>
  Object.entries(spec).reduce((acc, [name, child]) => {
    const result = create(acc, parentId, child === null ? "file" : "folder", name)
    if (!result.ok) throw new Error(`Помилка в сценарії: «${name}»: ${result.error}`)
    return child === null ? result.state : addSpec(result.state, result.id, child)
  }, state)

/** Contents of drives by letter: `{ "D:": { "Мої уроки": {} } }`. */
export type DrivesSpec = { readonly [drive: string]: TreeSpec }

export const buildState = (desktop: TreeSpec, drives: DrivesSpec = {}): FsState =>
  Object.entries(drives).reduce((acc, [drive, spec]) => {
    const letter = DRIVE_LETTERS.find((l) => `${l}:` === drive.toUpperCase())
    if (letter === undefined) throw new Error(`Помилка в сценарії: немає диска «${drive}», є лише C: і D:`)
    return addSpec(acc, driveId(letter), spec)
  }, addSpec(emptyState(), DESKTOP_ID, desktop))

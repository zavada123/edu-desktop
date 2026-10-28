import { create, DESKTOP_ID, emptyState, type FsState, type NodeId } from "./fs.ts"

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

export const buildState = (spec: TreeSpec): FsState => addSpec(emptyState(), DESKTOP_ID, spec)

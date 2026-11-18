import {
  childrenOf,
  create,
  createShortcut,
  DESKTOP_ID,
  DRIVE_LETTERS,
  driveId,
  emptyState,
  findByPath,
  type FsNode,
  type FsState,
  type NodeId,
  markZip,
  pathOf,
  rename,
  shortcutTarget
} from "./fs.ts"
import { defaultSize } from "./sizes.ts"

/**
 * Compact description of a starting desktop for scenario authors.
 * An object is a folder, `null` is a file, a number is a file of that many bytes, a string is a shortcut to that path:
 * `{ "Мої фото": { "ліс.jpg": null, "море.jpg": 3_512_000 }, "вірш.txt": null, "Ігри – ярлик": "D:/Ігри" }`.
 * A file given as `null` gets a believable size for its type, the same every time.
 * A folder whose name ends with `.zip` is a compressed ZIP folder: `{ "фото.zip": { "ліс.jpg": null } }`.
 */
export type TreeSpec = { readonly [name: string]: TreeSpec | null | number | string }

interface PendingShortcut {
  readonly parentId: NodeId
  readonly name: string
  readonly target: string
}

export type BuildResult = { readonly ok: true; readonly state: FsState } | { readonly ok: false; readonly error: string }

type Built = { readonly ok: true; readonly state: FsState; readonly pending: ReadonlyArray<PendingShortcut> } | { readonly ok: false; readonly error: string }

const inScenario = (name: string, error: string): string => `Помилка в сценарії: «${name}»: ${error}`

/** Builds folders and files; shortcuts wait until everything they may point at exists. */
const addSpec = (start: Built, parentId: NodeId, spec: TreeSpec): Built =>
  Object.entries(spec).reduce((acc: Built, [name, child]): Built => {
    if (!acc.ok) return acc
    if (typeof child === "string") return { ...acc, pending: [...acc.pending, { parentId, name, target: child }] }
    const isFile = child === null || typeof child === "number"
    const size = typeof child === "number" ? child : defaultSize(name)
    if (typeof child === "number" && !(Number.isFinite(child) && child >= 0)) return { ok: false, error: inScenario(name, "розмір файлу має бути числом байтів, не меншим за 0") }
    const result = create(acc.state, parentId, isFile ? "file" : "folder", name, size)
    if (!result.ok) return { ok: false, error: inScenario(name, result.error) }
    if (isFile) return { ...acc, state: result.state }
    const folder = name.toLocaleLowerCase("uk").endsWith(".zip") ? markZip(result.state, result.id) : result.state
    return addSpec({ ...acc, state: folder }, result.id, child)
  }, start)

const addShortcut = (built: BuildResult, { parentId, name, target }: PendingShortcut): BuildResult => {
  if (!built.ok) return built
  const node = findByPath(built.state, target)
  if (!node) return { ok: false, error: `Помилка в сценарії: ярлик «${name}» указує на «${target}», а такого немає` }
  const made = createShortcut(built.state, node.id, parentId)
  const named = made.ok ? rename(made.state, made.id, name) : made
  return named.ok ? { ok: true, state: named.state } : { ok: false, error: inScenario(name, named.error) }
}

/** Contents of drives by letter: `{ "D:": { "Мої уроки": {} } }`. */
export type DrivesSpec = { readonly [drive: string]: TreeSpec }

/** Builds the start tree, or names the first problem in it. A server uses it on data it did not write. */
export const tryBuildState = (desktop: TreeSpec, drives: DrivesSpec = {}): BuildResult => {
  const built = Object.entries(drives).reduce((acc: Built, [drive, spec]): Built => {
    if (!acc.ok) return acc
    const letter = DRIVE_LETTERS.find((l) => `${l}:` === drive.toUpperCase())
    if (letter === undefined) return { ok: false, error: `Помилка в сценарії: немає диска «${drive}», є лише C: і D:` }
    return addSpec(acc, driveId(letter), spec)
  }, addSpec({ ok: true, state: emptyState(), pending: [] }, DESKTOP_ID, desktop))
  if (!built.ok) return built
  return built.pending.reduce(addShortcut, { ok: true, state: built.state })
}

/** Builds the start tree of a scenario from this package; a mistake in it is a programming error. */
export const buildState = (desktop: TreeSpec, drives: DrivesSpec = {}): FsState => {
  const built = tryBuildState(desktop, drives)
  if (!built.ok) throw new Error(built.error)
  return built.state
}

/** The start tree in the compact form: the desktop and the drives. */
export interface StartSpec {
  readonly desktop: TreeSpec
  readonly drives: DrivesSpec
}

/** One item in the compact form, or `undefined` for a shortcut whose object is gone or in the bin. */
const specOf = (state: FsState, node: FsNode): TreeSpec | null | string | undefined => {
  if (node.target !== undefined) {
    const target = shortcutTarget(state, node)
    return target === undefined ? undefined : pathOf(state, target.id).join("/")
  }
  // Sizes are not kept yet: task editors that read this form know only `null` for a file.
  return node.kind === "file" ? null : folderSpec(state, node.id)
}

const folderSpec = (state: FsState, folderId: NodeId): TreeSpec =>
  Object.fromEntries(childrenOf(state, folderId).flatMap((child) => {
    const spec = specOf(state, child)
    return spec === undefined ? [] : [[child.name, spec]]
  }))

/**
 * The desktop and the drives of `state` in the form `buildState` reads: an author arranges the start in the
 * trainer, and a task keeps it as data. The recycle bin and the marks «opened» and «restored» are not kept.
 */
export const toTreeSpec = (state: FsState): StartSpec => ({
  desktop: folderSpec(state, DESKTOP_ID),
  drives: Object.fromEntries(DRIVE_LETTERS.map((letter) => [`${letter}:`, folderSpec(state, driveId(letter))]))
})

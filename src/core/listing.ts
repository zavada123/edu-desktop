import { BIN_ID, childrenOf, type FsNode, type FsState, type NodeId } from "./fs.ts"
import { sameName, splitExtension } from "./names.ts"
import { sizeOf, startDates, typeOf } from "./props.ts"

/** What Explorer shows in a folder: the order, the hidden items and the search, as in Windows. */

export type SortKey = "name" | "modified" | "type" | "size"

export interface SortOrder {
  readonly key: SortKey
  readonly desc: boolean
}

/** When each item the student made appeared; items from the start tree have dates of their own. */
export type BornTimes = Readonly<Record<NodeId, number>>

export const datesOf = (state: FsState, node: FsNode, born: BornTimes): { readonly created: number; readonly modified: number } => {
  const time = born[node.id]
  return time === undefined ? startDates(state, node) : { created: time, modified: time }
}

/** «Тип» column: the type without the extension in brackets, `Текстовий документ`. */
export const typeName = (node: FsNode): string => typeOf(node).replace(/\s*\(\.[^)]*\)$/, "")

/** The name as Explorer shows it: without the extension when «Розширення імен файлів» is off. */
export const shownName = (node: FsNode, showExtensions: boolean): string =>
  showExtensions || node.kind === "folder" || node.target !== undefined ? node.name : splitExtension(node.name).base

const compareBy = (state: FsState, key: SortKey, born: BornTimes) => (a: FsNode, b: FsNode): number => {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name, "uk", { numeric: true })
    case "modified":
      return datesOf(state, a, born).modified - datesOf(state, b, born).modified
    case "type":
      return typeName(a).localeCompare(typeName(b), "uk")
    case "size":
      return (a.kind === "file" ? sizeOf(state, a) : 0) - (b.kind === "file" ? sizeOf(state, b) : 0)
  }
}

/**
 * Items in Explorer order: folders first, then files, each group sorted by `key`; equal ones by name.
 * «За спаданням» turns each group around, folders stay first, as in Windows.
 */
export const sortItems = (state: FsState, items: ReadonlyArray<FsNode>, order: SortOrder, born: BornTimes): ReadonlyArray<FsNode> => {
  const byKey = compareBy(state, order.key, born)
  const byName = compareBy(state, "name", born)
  const sign = order.desc ? -1 : 1
  return items.toSorted((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
    return sign * (byKey(a, b) || byName(a, b))
  })
}

/** `*.jpg`, `звіт*`, `фото?.png`: `*` is any text, `?` one character. Without them a part of the name is enough. */
export const matchesSearch = (name: string, query: string): boolean => {
  const q = query.trim()
  if (q === "") return true
  if (!/[*?]/.test(q)) return name.toLocaleLowerCase("uk").includes(q.toLocaleLowerCase("uk"))
  const pattern = q.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")
  return new RegExp(`^${pattern}$`, "iu").test(name) || sameName(name, q)
}

/** Everything inside `folderId` and its subfolders that matches; ZIP folders are not opened, as in Windows. */
export const searchIn = (state: FsState, folderId: NodeId, query: string): ReadonlyArray<FsNode> =>
  childrenOf(state, folderId).flatMap((child) => {
    const inner = child.kind === "folder" && !child.zip && child.id !== BIN_ID ? searchIn(state, child.id, query) : []
    return matchesSearch(child.name, query) ? [child, ...inner] : inner
  })

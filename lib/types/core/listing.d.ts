import { type FsNode, type FsState, type NodeId } from "./fs.ts";
/** What Explorer shows in a folder: the order, the hidden items and the search, as in Windows. */
export type SortKey = "name" | "modified" | "type" | "size";
export interface SortOrder {
    readonly key: SortKey;
    readonly desc: boolean;
}
/** When each item the student made appeared; items from the start tree have dates of their own. */
export type BornTimes = Readonly<Record<NodeId, number>>;
export declare const datesOf: (state: FsState, node: FsNode, born: BornTimes) => {
    readonly created: number;
    readonly modified: number;
};
/** «Тип» column: the type without the extension in brackets, `Текстовий документ`. */
export declare const typeName: (node: FsNode) => string;
/** The name as Explorer shows it: without the extension when «Розширення імен файлів» is off. */
export declare const shownName: (node: FsNode, showExtensions: boolean) => string;
/**
 * Items in Explorer order: folders first, then files, each group sorted by `key`; equal ones by name.
 * «За спаданням» turns each group around, folders stay first, as in Windows.
 */
export declare const sortItems: (state: FsState, items: ReadonlyArray<FsNode>, order: SortOrder, born: BornTimes) => ReadonlyArray<FsNode>;
/** `*.jpg`, `звіт*`, `фото?.png`: `*` is any text, `?` one character. Without them a part of the name is enough. */
export declare const matchesSearch: (name: string, query: string) => boolean;
/** Everything inside `folderId` and its subfolders that matches; ZIP folders are not opened, as in Windows. */
export declare const searchIn: (state: FsState, folderId: NodeId, query: string) => ReadonlyArray<FsNode>;

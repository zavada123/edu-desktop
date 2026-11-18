import { type FsNode, type FsState, type NodeId } from "./fs.ts";
/** «Тип файлу» as Windows writes it: `Текстовий документ (.txt)`, `Ярлик (.lnk)`, `Папка з файлами`. */
export declare const typeOf: (node: FsNode) => string;
/** «Програма»: what opens the file. `undefined` for folders and unknown types. */
export declare const programOf: (node: FsNode) => string | undefined;
/** Size in bytes; a folder adds up everything inside it. */
export declare const sizeOf: (state: FsState, node: FsNode) => number;
/** «На диску»: every file takes whole 4 KB clusters, an empty file takes none. */
export declare const sizeOnDiskOf: (state: FsState, node: FsNode) => number;
/** «Містить»: files and folders inside, at every depth. */
export declare const contentsOf: (state: FsState, id: NodeId) => {
    readonly files: number;
    readonly folders: number;
};
/** `2 465 792`: groups of three digits, as Windows shows bytes. */
export declare const groupDigits: (n: number) => string;
/**
 * Short size as Explorer writes it: `345 байт`, `12,5 КБ`, `2,35 МБ`. Three significant digits, cut, not rounded;
 * from 1000 of a unit Windows already takes the next one: `0,97 МБ`.
 */
export declare const shortSize: (bytes: number) => string;
/** `2,35 МБ (2 465 792 байт)`, as on the «Загальні» tab. */
export declare const fullSize: (bytes: number) => string;
/**
 * Windows path of the folder an item lies in («Розташування»). The desktop is a folder of the student's account:
 * `C:\Users\Учень\Desktop`. A drive root ends with a backslash: `D:\`.
 */
export declare const windowsPathOf: (state: FsState, id: NodeId) => string;
/** «Розташування»: the folder the item lies in. */
export declare const locationOf: (state: FsState, node: FsNode) => string;
/** «Об'єкт» of a shortcut: the full path of what it opens, or `undefined` when that is deleted. */
export declare const shortcutTargetPath: (state: FsState, node: FsNode) => string | undefined;
/** `18 листопада 2026 р., 22:50:23`, as in Ukrainian Windows. Local time. */
export declare const formatDate: (time: number) => string;
/**
 * When an item from the start tree was created and last changed: the same for the same name and place,
 * so every student sees the same dates. Items the student made carry their own time instead.
 */
export declare const startDates: (state: FsState, node: FsNode) => {
    readonly created: number;
    readonly modified: number;
};
/** «Ємність», «Зайнято» and «Вільно» of a drive; what the student puts on it counts too. */
export declare const driveSpace: (state: FsState, node: FsNode) => {
    readonly capacity: number;
    readonly used: number;
    readonly free: number;
};

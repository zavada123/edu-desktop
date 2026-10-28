/**
 * Virtual file system of the trainer. The state is a flat map of nodes; every operation
 * returns a new state and never changes the old one, so undo and "start again" are trivial.
 */
export type NodeId = string;
export type NodeKind = "folder" | "file";
export interface FsNode {
    readonly id: NodeId;
    readonly name: string;
    readonly kind: NodeKind;
    /** `null` only for the desktop, the recycle bin and «Цей ПК». */
    readonly parentId: NodeId | null;
    /** For items in the recycle bin: the folder to restore them to. */
    readonly deletedFrom?: NodeId;
    /** Taken back out of the recycle bin at least once; a goal can ask for it (5 клас, вправа 6). */
    readonly restored?: true;
    /** A shortcut (ярлик) is a file that points at another object; deleting it leaves that object alone. */
    readonly target?: NodeId;
    /** A compressed ZIP folder (8 клас): Windows opens it like a folder. */
    readonly zip?: true;
    /** Opened in a program through «Файл → Відкрити»; a goal can ask for it (3 клас, с. 54). */
    readonly opened?: true;
}
export interface FsState {
    readonly nodes: Readonly<Record<NodeId, FsNode>>;
    readonly nextId: number;
}
export declare const DESKTOP_ID: NodeId;
export declare const BIN_ID: NodeId;
/** «Цей ПК»: holds the drives. Drives are folders named `C:` and `D:`. */
export declare const THIS_PC_ID: NodeId;
export declare const DRIVE_LETTERS: readonly ["C", "D"];
export type DriveLetter = (typeof DRIVE_LETTERS)[number];
export declare const driveId: (letter: DriveLetter) => NodeId;
export type FsResult = {
    readonly ok: true;
    readonly state: FsState;
    readonly id: NodeId;
} | {
    readonly ok: false;
    readonly error: string;
};
export declare const emptyState: () => FsState;
export declare const getNode: (state: FsState, id: NodeId) => FsNode | undefined;
export declare const isDrive: (id: NodeId) => boolean;
/** Desktop, bin, «Цей ПК» and drives cannot be renamed, moved or deleted. */
export declare const isSystem: (id: NodeId) => boolean;
/** What the student sees: drive `D:` is shown as «Локальний диск (D:)», as in Windows. */
export declare const isShortcut: (node: FsNode) => boolean;
export declare const displayName: (node: FsNode) => string;
export declare const childrenOf: (state: FsState, parentId: NodeId) => ReadonlyArray<FsNode>;
/** True when `id` is `ancestorId` itself or lies somewhere inside it. */
export declare const isInside: (state: FsState, id: NodeId, ancestorId: NodeId) => boolean;
export declare const isInBin: (state: FsState, id: NodeId) => boolean;
/** Names from the desktop or a drive down: `["Мої фото", "ліс.jpg"]`, `["D:", "Мої уроки"]`. */
export declare const pathOf: (state: FsState, id: NodeId) => ReadonlyArray<string>;
/**
 * Full path in Windows style: `D:\\Мої уроки\\монітор.jpg`. Items on the desktop start with «Робочий стіл».
 */
export declare const windowsPath: (state: FsState, id: NodeId) => string;
/**
 * Finds a node by a path relative to the desktop (`Мої фото/ліс.jpg`) or to a drive
 * (`D:/Мої уроки/монітор.jpg`). Both `/` and `\\` separate parts. Letter case is ignored.
 */
export declare const findByPath: (state: FsState, path: string) => FsNode | undefined;
/** Folder typed into the address bar: `D:\\Мої уроки`, `Робочий стіл\\Мої фото`, `Цей ПК`. `null` if there is no such folder. */
export declare const resolveAddress: (state: FsState, text: string) => NodeId | null;
export declare const create: (state: FsState, parentId: NodeId, kind: NodeKind, wantedName: string) => FsResult;
/**
 * «Зберегти як»: a new file `name` in `folderId`. The extension is added when the student did not type it.
 * Unlike «Створити», an existing name is an error, not «(2)»: the student chooses another name.
 */
export declare const saveFile: (state: FsState, folderId: NodeId, name: string, ext: string) => FsResult;
export declare const rename: (state: FsState, id: NodeId, newName: string) => FsResult;
/** Moves to another folder. Moving into the recycle bin is the same as deleting. */
export declare const move: (state: FsState, id: NodeId, targetId: NodeId) => FsResult;
/** Copies a file or a whole folder. A copy into the same folder gets the name `море – копія.jpg`. */
export declare const copy: (state: FsState, id: NodeId, targetId: NodeId) => FsResult;
/**
 * Creates a shortcut to `id` in `parentId`, named `Моя папка – ярлик`. A shortcut to a shortcut
 * points at the same object, as in Windows.
 */
export declare const createShortcut: (state: FsState, id: NodeId, parentId: NodeId) => FsResult;
/**
 * «Надіслати → Стиснута ZIP-папка»: a `name.zip` next to the items with copies of them inside.
 * The originals stay where they were.
 */
export declare const compress: (state: FsState, ids: ReadonlyArray<NodeId>, name: string) => FsResult;
/** «Файл → Відкрити» in a program. */
export declare const markOpened: (state: FsState, id: NodeId) => FsResult;
/** Turns a folder into a ZIP folder; scenario trees use it for `name.zip` entries. */
export declare const markZip: (state: FsState, id: NodeId) => FsState;
/** «Видобути все…»: a folder named like the archive (without `.zip`) next to it, with everything from it. */
export declare const extractAll: (state: FsState, zipId: NodeId) => FsResult;
/** What a shortcut opens, or `undefined` when its object was deleted or lies in the bin. */
export declare const shortcutTarget: (state: FsState, node: FsNode) => FsNode | undefined;
/** Puts an item into the recycle bin and remembers where it came from. */
export declare const remove: (state: FsState, id: NodeId) => FsResult;
export declare const restore: (state: FsState, id: NodeId) => FsResult;
/** Deletes an item from the recycle bin for good. */
export declare const deleteForever: (state: FsState, id: NodeId) => FsResult;
export declare const emptyBin: (state: FsState) => FsState;

import * as fs from "../core/fs.ts";
import { type FsState, type NodeId } from "../core/fs.ts";
import { type Goal, type GoalResult } from "../core/goals.ts";
import { type Op } from "../core/ops.ts";
/** UI state of one desktop session. Pure reducer: every action returns a new object. */
export interface Win {
    readonly id: number;
    /** A folder shown in Explorer, or a file shown in the viewer. */
    readonly nodeId: NodeId;
    readonly x: number;
    readonly y: number;
    readonly maximized: boolean;
    /** Hidden on the taskbar («Згорнути»); its taskbar button brings it back. */
    readonly minimized: boolean;
    readonly history: ReadonlyArray<NodeId>;
}
export interface Clipboard {
    readonly mode: "cut" | "copy";
    readonly ids: ReadonlyArray<NodeId>;
}
export interface Menu {
    readonly x: number;
    readonly y: number;
    /** The folder the menu was opened in. */
    readonly containerId: NodeId;
    /** The clicked item, or `null` for the empty space of a folder. */
    readonly targetId: NodeId | null;
    /** Shown after a right-button drag: «Копіювати сюди», «Перемістити сюди», «Створити ярлики». */
    readonly drop?: {
        readonly ids: ReadonlyArray<NodeId>;
        readonly targetId: NodeId;
    };
}
/** Question shown before an action that is hard to undo, as Windows asks it. */
export type Confirm = {
    readonly kind: "delete";
    readonly ids: ReadonlyArray<NodeId>;
} | {
    readonly kind: "deleteForever";
    readonly ids: ReadonlyArray<NodeId>;
} | {
    readonly kind: "emptyBin";
};
export interface DesktopState {
    readonly fs: FsState;
    /** Last window is on top. */
    readonly windows: ReadonlyArray<Win>;
    readonly nextWinId: number;
    /** Selected items; all of them lie in the same folder. */
    readonly selected: ReadonlyArray<NodeId>;
    /** «Вибрати кілька»: on a phone every tap adds to the selection, like Ctrl+click. */
    readonly multi: boolean;
    readonly renaming: NodeId | null;
    readonly clipboard: Clipboard | null;
    readonly menu: Menu | null;
    readonly confirm: Confirm | null;
    readonly message: string | null;
    readonly results: ReadonlyArray<GoalResult> | null;
    /** The program's «Зберегти як» or «Відкрити» window. */
    readonly fileDialog: FileDialog | null;
    /** File the program saved its work to or opened; shown in its title. */
    readonly savedAs: NodeId | null;
    /** Every file-system change since the start, in order; `replay` builds the same tree from it. */
    readonly ops: ReadonlyArray<Op>;
}
export type FileDialog = "save" | "open";
/** Window id of the scenario's program (Paint, text editor, browser); it is not a file-system node. */
export declare const APP_ID: NodeId;
type Ids = ReadonlyArray<NodeId>;
export type Action = {
    readonly type: "reset";
    readonly fs: FsState;
    readonly withApp?: boolean;
} | {
    readonly type: "openApp";
} | {
    readonly type: "fileDialog";
    readonly dialog: FileDialog | null;
} | {
    readonly type: "openFile";
    readonly nodeId: NodeId;
} | {
    readonly type: "saveFile";
    readonly folderId: NodeId;
    readonly name: string;
    readonly ext: string;
} | {
    readonly type: "newFolder";
    readonly containerId: NodeId;
    readonly name: string;
} | {
    readonly type: "open";
    readonly nodeId: NodeId;
} | {
    readonly type: "navigate";
    readonly winId: number;
    readonly nodeId: NodeId;
} | {
    readonly type: "back";
    readonly winId: number;
} | {
    readonly type: "up";
    readonly winId: number;
} | {
    readonly type: "close";
    readonly winId: number;
} | {
    readonly type: "focus";
    readonly winId: number;
} | {
    readonly type: "moveWin";
    readonly winId: number;
    readonly x: number;
    readonly y: number;
} | {
    readonly type: "toggleMax";
    readonly winId: number;
} | {
    readonly type: "minimize";
    readonly winId: number;
}
/** Taskbar button: as in Windows, it minimises the active window and brings back any other. */
 | {
    readonly type: "taskbar";
    readonly winId: number;
}
/** `range`: Shift+click selects everything from the first selected item to this one. */
 | {
    readonly type: "select";
    readonly nodeId: NodeId | null;
    readonly additive: boolean;
    readonly range?: boolean;
} | {
    readonly type: "selectAll";
    readonly containerId: NodeId;
} | {
    readonly type: "toggleMulti";
} | {
    readonly type: "startRename";
    readonly nodeId: NodeId;
} | {
    readonly type: "commitRename";
    readonly nodeId: NodeId;
    readonly name: string;
} | {
    readonly type: "cancelRename";
} | {
    readonly type: "create";
    readonly containerId: NodeId;
    readonly kind: fs.NodeKind;
} | {
    readonly type: "askDelete";
    readonly ids: Ids;
} | {
    readonly type: "askEmptyBin";
} | {
    readonly type: "confirm";
} | {
    readonly type: "cancelConfirm";
} | {
    readonly type: "restore";
    readonly ids: Ids;
}
/** «Створити ярлик» (`targetId` null: next to each item) or «Надіслати → Робочий стіл» (`targetId` = desktop). */
 | {
    readonly type: "shortcut";
    readonly ids: Ids;
    readonly targetId: NodeId | null;
}
/** «Надіслати → Стиснута ZIP-папка»; then the student types the archive name. */
 | {
    readonly type: "compress";
    readonly ids: Ids;
} | {
    readonly type: "extract";
    readonly nodeId: NodeId;
} | {
    readonly type: "clip";
    readonly mode: Clipboard["mode"];
    readonly ids: Ids;
} | {
    readonly type: "paste";
    readonly targetId: NodeId;
} | {
    readonly type: "drop";
    readonly ids: Ids;
    readonly targetId: NodeId;
    readonly copy: boolean;
} | {
    readonly type: "menu";
    readonly menu: Menu | null;
} | {
    readonly type: "check";
    readonly goals: ReadonlyArray<Goal>;
} | {
    readonly type: "notify";
    readonly message: string;
} | {
    readonly type: "dismiss";
};
export declare const initialState: (fsState: FsState, withApp?: boolean) => DesktopState;
/** The window on top that is not minimised. */
export declare const activeWin: (state: DesktopState) => Win | undefined;
export declare const reducer: (state: DesktopState, action: Action) => DesktopState;
/** Title shown in a window and on the taskbar. */
export declare const titleOf: (state: DesktopState, nodeId: NodeId) => string;
export {};

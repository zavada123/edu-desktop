import { type NodeId } from "../core/fs.ts";
import type { Action, DesktopState } from "./store.ts";
/** A key press as the trainer sees it. `code` is the physical key, so Ctrl+C works on the Ukrainian layout too. */
export interface KeyPress {
    readonly key: string;
    readonly code: string;
    readonly ctrl: boolean;
}
/** What a key does: a store action, or opening an item (the component decides where it opens). */
export type KeyCommand = Action | {
    readonly type: "openItem";
    readonly nodeId: NodeId;
};
/**
 * Windows shortcuts for the folder the student works in (`folderId`): Ctrl+C/X/V/A, Delete, F2, Enter,
 * Backspace and Escape. Returns `null` for any other key, so the browser keeps it.
 */
export declare const commandForKey: (state: DesktopState, press: KeyPress, folderId: NodeId) => KeyCommand | null;
/** A key press with every modifier, to tell browser shortcuts apart. */
export interface FullKeyPress extends KeyPress {
    readonly shift: boolean;
    readonly alt: boolean;
}
/**
 * Browser shortcuts a child may hit by accident inside the trainer: F12 and the other F keys (F2 stays,
 * the trainer renames with it), developer tools, print, save, reload, history and similar. The trainer's
 * own keys (Ctrl+C/X/V/A, Delete, Enter…) are not in the list. Ctrl+W/T/N and Ctrl+Tab cannot be stopped by a page.
 */
export declare const isBrowserShortcut: (press: FullKeyPress) => boolean;

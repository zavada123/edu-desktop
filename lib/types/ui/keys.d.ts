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

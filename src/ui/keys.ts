import { BIN_ID, getNode, type NodeId } from "../core/fs.ts"
import type { Action, DesktopState } from "./store.ts"

/** A key press as the trainer sees it. `code` is the physical key, so Ctrl+C works on the Ukrainian layout too. */
export interface KeyPress {
  readonly key: string
  readonly code: string
  readonly ctrl: boolean
}

/** What a key does: a store action, or opening an item (the component decides where it opens). */
export type KeyCommand = Action | { readonly type: "openItem"; readonly nodeId: NodeId }

/**
 * Windows shortcuts for the folder the student works in (`folderId`): Ctrl+C/X/V/A, Delete, F2, Enter,
 * Backspace and Escape. Returns `null` for any other key, so the browser keeps it.
 */
export const commandForKey = (state: DesktopState, press: KeyPress, folderId: NodeId): KeyCommand | null => {
  const selected = state.selected
  const one = selected.length === 1 ? selected[0] : undefined
  if (press.ctrl) {
    switch (press.code) {
      case "KeyC":
        return selected.length > 0 ? { type: "clip", mode: "copy", ids: selected } : null
      case "KeyX":
        return selected.length > 0 ? { type: "clip", mode: "cut", ids: selected } : null
      case "KeyV":
        return state.clipboard ? { type: "paste", targetId: folderId } : null
      case "KeyA":
        return { type: "selectAll", containerId: folderId }
      default:
        return null
    }
  }
  switch (press.key) {
    case "Delete":
      return selected.length > 0 ? { type: "askDelete", ids: selected } : null
    case "F2":
      return one !== undefined && getNode(state.fs, one)?.parentId !== BIN_ID ? { type: "startRename", nodeId: one } : null
    case "Enter":
      return one !== undefined ? { type: "openItem", nodeId: one } : null
    case "Backspace": {
      const win = state.windows.findLast((w) => w.nodeId === folderId)
      return win ? { type: "back", winId: win.id } : null
    }
    case "Escape":
      return state.menu ? { type: "menu", menu: null } : selected.length > 0 ? { type: "select", nodeId: null, additive: false } : null
    default:
      return null
  }
}

/** A key press with every modifier, to tell browser shortcuts apart. */
export interface FullKeyPress extends KeyPress {
  readonly shift: boolean
  readonly alt: boolean
}

/** Ctrl+letter: print, save, find, history, downloads, view source, bookmarks, reload, open file, search. */
const BROWSER_CTRL_CODES = new Set(["KeyD", "KeyE", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyO", "KeyP", "KeyR", "KeyS", "KeyU"])
/** Ctrl+Shift+letter: developer tools (I, J, C), clear history (Delete), bookmarks bar (B), bookmark manager (O). */
const BROWSER_CTRL_SHIFT_CODES = new Set(["KeyI", "KeyJ", "KeyC", "KeyB", "KeyO", "Delete"])
/** Alt+arrow and Alt+Home: back, forward and the home page. */
const BROWSER_ALT_CODES = new Set(["ArrowLeft", "ArrowRight", "Home"])

/**
 * Browser shortcuts a child may hit by accident inside the trainer: F12 and the other F keys (F2 stays,
 * the trainer renames with it), developer tools, print, save, reload, history and similar. The trainer's
 * own keys (Ctrl+C/X/V/A, Delete, Enter…) are not in the list. Ctrl+W/T/N and Ctrl+Tab cannot be stopped by a page.
 */
export const isBrowserShortcut = (press: FullKeyPress): boolean => {
  if (/^F\d{1,2}$/.test(press.key)) return press.key !== "F2"
  if (press.ctrl && press.shift) return BROWSER_CTRL_SHIFT_CODES.has(press.code)
  if (press.ctrl && !press.alt) return BROWSER_CTRL_CODES.has(press.code)
  if (press.alt && !press.ctrl) return BROWSER_ALT_CODES.has(press.code)
  return false
}

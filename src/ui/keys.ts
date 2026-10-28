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

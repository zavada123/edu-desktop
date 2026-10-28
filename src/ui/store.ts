import * as fs from "../core/fs.ts"
import { BIN_ID, DESKTOP_ID, type FsResult, type FsState, type NodeId } from "../core/fs.ts"
import { checkGoals, type Goal, type GoalResult } from "../core/goals.ts"

/** UI state of one desktop session. Pure reducer: every action returns a new object. */

export interface Win {
  readonly id: number
  /** A folder shown in Explorer, or a file shown in the viewer. */
  readonly nodeId: NodeId
  readonly x: number
  readonly y: number
  readonly maximized: boolean
  readonly history: ReadonlyArray<NodeId>
}

export interface Clipboard {
  readonly mode: "cut" | "copy"
  readonly ids: ReadonlyArray<NodeId>
}

export interface Menu {
  readonly x: number
  readonly y: number
  /** The folder the menu was opened in. */
  readonly containerId: NodeId
  /** The clicked item, or `null` for the empty space of a folder. */
  readonly targetId: NodeId | null
}

export interface DesktopState {
  readonly fs: FsState
  /** Last window is on top. */
  readonly windows: ReadonlyArray<Win>
  readonly nextWinId: number
  readonly selected: NodeId | null
  readonly renaming: NodeId | null
  readonly clipboard: Clipboard | null
  readonly menu: Menu | null
  readonly message: string | null
  readonly results: ReadonlyArray<GoalResult> | null
}

export type Action =
  | { readonly type: "reset"; readonly fs: FsState }
  | { readonly type: "open"; readonly nodeId: NodeId }
  | { readonly type: "navigate"; readonly winId: number; readonly nodeId: NodeId }
  | { readonly type: "back"; readonly winId: number }
  | { readonly type: "up"; readonly winId: number }
  | { readonly type: "close"; readonly winId: number }
  | { readonly type: "focus"; readonly winId: number }
  | { readonly type: "moveWin"; readonly winId: number; readonly x: number; readonly y: number }
  | { readonly type: "toggleMax"; readonly winId: number }
  | { readonly type: "select"; readonly nodeId: NodeId | null }
  | { readonly type: "startRename"; readonly nodeId: NodeId }
  | { readonly type: "commitRename"; readonly nodeId: NodeId; readonly name: string }
  | { readonly type: "cancelRename" }
  | { readonly type: "create"; readonly containerId: NodeId; readonly kind: fs.NodeKind }
  | { readonly type: "delete"; readonly nodeId: NodeId }
  | { readonly type: "restore"; readonly nodeId: NodeId }
  | { readonly type: "emptyBin" }
  | { readonly type: "clip"; readonly mode: Clipboard["mode"]; readonly nodeId: NodeId }
  | { readonly type: "paste"; readonly targetId: NodeId }
  | { readonly type: "drop"; readonly nodeId: NodeId; readonly targetId: NodeId; readonly copy: boolean }
  | { readonly type: "menu"; readonly menu: Menu | null }
  | { readonly type: "check"; readonly goals: ReadonlyArray<Goal> }
  | { readonly type: "notify"; readonly message: string }
  | { readonly type: "dismiss" }

export const initialState = (fsState: FsState): DesktopState => ({
  fs: fsState,
  windows: [],
  nextWinId: 1,
  selected: null,
  renaming: null,
  clipboard: null,
  menu: null,
  message: null,
  results: null
})

const CASCADE_STEP = 28
const CASCADE_SIZE = 6

/** Applies a file-system result: on success keeps the new tree, on failure shows the error. */
const applyFs = (state: DesktopState, result: FsResult, after?: (s: DesktopState, id: NodeId) => DesktopState): DesktopState => {
  if (!result.ok) return { ...state, message: result.error, menu: null }
  const next = closeMissing({ ...state, fs: result.state, menu: null, message: null, results: null })
  return after ? after(next, result.id) : next
}

/** Windows whose folder or file no longer exists (bin emptied) are closed. */
const closeMissing = (state: DesktopState): DesktopState => ({
  ...state,
  windows: state.windows.filter((w) => fs.getNode(state.fs, w.nodeId) !== undefined)
})

const updateWin = (state: DesktopState, winId: number, change: (w: Win) => Win): DesktopState => ({
  ...state,
  windows: state.windows.map((w) => (w.id === winId ? change(w) : w))
})

const focusWin = (state: DesktopState, winId: number): DesktopState => {
  const win = state.windows.find((w) => w.id === winId)
  if (!win || state.windows.at(-1)?.id === winId) return state
  return { ...state, windows: [...state.windows.filter((w) => w.id !== winId), win] }
}

const openWin = (state: DesktopState, nodeId: NodeId): DesktopState => {
  const existing = state.windows.find((w) => w.nodeId === nodeId)
  if (existing) return focusWin({ ...state, menu: null }, existing.id)
  const offset = ((state.nextWinId - 1) % CASCADE_SIZE) * CASCADE_STEP
  const win: Win = { id: state.nextWinId, nodeId, x: 40 + offset, y: 30 + offset, maximized: false, history: [] }
  return { ...state, windows: [...state.windows, win], nextWinId: state.nextWinId + 1, menu: null, selected: null }
}

const navigate = (state: DesktopState, winId: number, nodeId: NodeId, remember: boolean): DesktopState =>
  updateWin({ ...state, selected: null, menu: null }, winId, (w) =>
    w.nodeId === nodeId ? w : { ...w, nodeId, history: remember ? [...w.history, w.nodeId] : w.history }
  )

const paste = (state: DesktopState, targetId: NodeId): DesktopState => {
  const clip = state.clipboard
  if (!clip) return { ...state, menu: null }
  const op = clip.mode === "cut" ? fs.move : fs.copy
  let current: FsState = state.fs
  for (const id of clip.ids) {
    const result = op(current, id, targetId)
    if (!result.ok) return { ...state, message: result.error, menu: null }
    current = result.state
  }
  return closeMissing({
    ...state,
    fs: current,
    clipboard: clip.mode === "cut" ? null : clip,
    menu: null,
    message: null,
    results: null
  })
}

export const reducer = (state: DesktopState, action: Action): DesktopState => {
  switch (action.type) {
    case "reset":
      return initialState(action.fs)
    case "open": {
      const node = fs.getNode(state.fs, action.nodeId)
      return node ? openWin(state, action.nodeId) : state
    }
    case "navigate":
      return navigate(state, action.winId, action.nodeId, true)
    case "back": {
      const win = state.windows.find((w) => w.id === action.winId)
      const previous = win?.history.at(-1)
      if (!win || previous === undefined) return state
      return updateWin(navigate(state, win.id, previous, false), win.id, (w) => ({ ...w, history: w.history.slice(0, -1) }))
    }
    case "up": {
      const win = state.windows.find((w) => w.id === action.winId)
      const parent = win ? fs.getNode(state.fs, win.nodeId)?.parentId : null
      return win && parent ? navigate(state, win.id, parent, true) : state
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== action.winId), menu: null }
    case "focus":
      return focusWin(state, action.winId)
    case "moveWin":
      return updateWin(state, action.winId, (w) => ({ ...w, x: Math.max(0, action.x), y: Math.max(0, action.y) }))
    case "toggleMax":
      return updateWin(state, action.winId, (w) => ({ ...w, maximized: !w.maximized }))
    case "select":
      return { ...state, selected: action.nodeId, menu: null, renaming: state.renaming === action.nodeId ? state.renaming : null }
    case "startRename":
      return fs.isSystem(action.nodeId) ? state : { ...state, renaming: action.nodeId, selected: action.nodeId, menu: null }
    case "commitRename": {
      const node = fs.getNode(state.fs, action.nodeId)
      if (!node || node.name === action.name.trim()) return { ...state, renaming: null }
      const result = fs.rename(state.fs, action.nodeId, action.name)
      return result.ok ? applyFs({ ...state, renaming: null }, result) : { ...state, message: result.error }
    }
    case "cancelRename":
      return { ...state, renaming: null }
    case "create": {
      const name = action.kind === "folder" ? "Нова папка" : "Новий текстовий документ.txt"
      return applyFs(state, fs.create(state.fs, action.containerId, action.kind, name), (s, id) => ({ ...s, selected: id, renaming: id }))
    }
    case "delete":
      return applyFs(state, fs.remove(state.fs, action.nodeId), (s) => ({ ...s, selected: null }))
    case "restore":
      return applyFs(state, fs.restore(state.fs, action.nodeId), (s) => ({ ...s, selected: null }))
    case "emptyBin":
      return closeMissing({ ...state, fs: fs.emptyBin(state.fs), menu: null, results: null })
    case "clip":
      return fs.isSystem(action.nodeId) ? state : { ...state, clipboard: { mode: action.mode, ids: [action.nodeId] }, menu: null }
    case "paste":
      return paste(state, action.targetId)
    case "drop": {
      if (action.nodeId === action.targetId) return state
      const result = action.copy && action.targetId !== BIN_ID ? fs.copy(state.fs, action.nodeId, action.targetId) : fs.move(state.fs, action.nodeId, action.targetId)
      return applyFs(state, result)
    }
    case "menu":
      return { ...state, menu: action.menu, renaming: null }
    case "check":
      return { ...state, results: checkGoals(state.fs, action.goals), menu: null }
    case "notify":
      return { ...state, message: action.message, menu: null }
    case "dismiss":
      return { ...state, message: null }
  }
}

/** Title shown in a window and on the taskbar. */
export const titleOf = (state: DesktopState, nodeId: NodeId): string =>
  nodeId === DESKTOP_ID ? "Робочий стіл" : (fs.getNode(state.fs, nodeId)?.name ?? "")

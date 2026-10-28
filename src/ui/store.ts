import * as fs from "../core/fs.ts"
import { BIN_ID, DESKTOP_ID, type FsResult, type FsState, type NodeId } from "../core/fs.ts"
import { checkGoals, type Goal, type GoalResult } from "../core/goals.ts"
import { splitExtension } from "../core/names.ts"

/** UI state of one desktop session. Pure reducer: every action returns a new object. */

export interface Win {
  readonly id: number
  /** A folder shown in Explorer, or a file shown in the viewer. */
  readonly nodeId: NodeId
  readonly x: number
  readonly y: number
  readonly maximized: boolean
  /** Hidden on the taskbar («Згорнути»); its taskbar button brings it back. */
  readonly minimized: boolean
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

/** Question shown before an action that is hard to undo, as Windows asks it. */
export type Confirm =
  | { readonly kind: "delete"; readonly ids: ReadonlyArray<NodeId> }
  | { readonly kind: "deleteForever"; readonly ids: ReadonlyArray<NodeId> }
  | { readonly kind: "emptyBin" }

export interface DesktopState {
  readonly fs: FsState
  /** Last window is on top. */
  readonly windows: ReadonlyArray<Win>
  readonly nextWinId: number
  /** Selected items; all of them lie in the same folder. */
  readonly selected: ReadonlyArray<NodeId>
  /** «Вибрати кілька»: on a phone every tap adds to the selection, like Ctrl+click. */
  readonly multi: boolean
  readonly renaming: NodeId | null
  readonly clipboard: Clipboard | null
  readonly menu: Menu | null
  readonly confirm: Confirm | null
  readonly message: string | null
  readonly results: ReadonlyArray<GoalResult> | null
  /** The «Зберегти як» window of the program is open. */
  readonly saving: boolean
  /** File the program saved its work to; shown in its title. */
  readonly savedAs: NodeId | null
}

/** Window id of the scenario's program (Paint, text editor, browser); it is not a file-system node. */
export const APP_ID: NodeId = "app"

type Ids = ReadonlyArray<NodeId>

export type Action =
  | { readonly type: "reset"; readonly fs: FsState; readonly withApp?: boolean }
  | { readonly type: "openApp" }
  | { readonly type: "openSave" }
  | { readonly type: "closeSave" }
  | { readonly type: "saveFile"; readonly folderId: NodeId; readonly name: string; readonly ext: string }
  | { readonly type: "newFolder"; readonly containerId: NodeId; readonly name: string }
  | { readonly type: "open"; readonly nodeId: NodeId }
  | { readonly type: "navigate"; readonly winId: number; readonly nodeId: NodeId }
  | { readonly type: "back"; readonly winId: number }
  | { readonly type: "up"; readonly winId: number }
  | { readonly type: "close"; readonly winId: number }
  | { readonly type: "focus"; readonly winId: number }
  | { readonly type: "moveWin"; readonly winId: number; readonly x: number; readonly y: number }
  | { readonly type: "toggleMax"; readonly winId: number }
  | { readonly type: "minimize"; readonly winId: number }
  /** Taskbar button: as in Windows, it minimises the active window and brings back any other. */
  | { readonly type: "taskbar"; readonly winId: number }
  /** `range`: Shift+click selects everything from the first selected item to this one. */
  | { readonly type: "select"; readonly nodeId: NodeId | null; readonly additive: boolean; readonly range?: boolean }
  | { readonly type: "selectAll"; readonly containerId: NodeId }
  | { readonly type: "toggleMulti" }
  | { readonly type: "startRename"; readonly nodeId: NodeId }
  | { readonly type: "commitRename"; readonly nodeId: NodeId; readonly name: string }
  | { readonly type: "cancelRename" }
  | { readonly type: "create"; readonly containerId: NodeId; readonly kind: fs.NodeKind }
  | { readonly type: "askDelete"; readonly ids: Ids }
  | { readonly type: "askEmptyBin" }
  | { readonly type: "confirm" }
  | { readonly type: "cancelConfirm" }
  | { readonly type: "restore"; readonly ids: Ids }
  /** «Створити ярлик» (`targetId` null: next to each item) or «Надіслати → Робочий стіл» (`targetId` = desktop). */
  | { readonly type: "shortcut"; readonly ids: Ids; readonly targetId: NodeId | null }
  /** «Надіслати → Стиснута ZIP-папка»; then the student types the archive name. */
  | { readonly type: "compress"; readonly ids: Ids }
  | { readonly type: "extract"; readonly nodeId: NodeId }
  | { readonly type: "clip"; readonly mode: Clipboard["mode"]; readonly ids: Ids }
  | { readonly type: "paste"; readonly targetId: NodeId }
  | { readonly type: "drop"; readonly ids: Ids; readonly targetId: NodeId; readonly copy: boolean }
  | { readonly type: "menu"; readonly menu: Menu | null }
  | { readonly type: "check"; readonly goals: ReadonlyArray<Goal> }
  | { readonly type: "notify"; readonly message: string }
  | { readonly type: "dismiss" }

export const initialState = (fsState: FsState, withApp = false): DesktopState => {
  const empty = blankState(fsState)
  return withApp ? openWin(empty, APP_ID) : empty
}

const blankState = (fsState: FsState): DesktopState => ({
  fs: fsState,
  windows: [],
  nextWinId: 1,
  selected: [],
  multi: false,
  renaming: null,
  clipboard: null,
  menu: null,
  confirm: null,
  message: null,
  results: null,
  saving: false,
  savedAs: null
})

const CASCADE_STEP = 28
const CASCADE_SIZE = 6

/** Windows whose folder or file no longer exists (bin emptied) are closed. */
const closeMissing = (state: DesktopState): DesktopState => ({
  ...state,
  windows: state.windows.filter((w) => w.nodeId === APP_ID || fs.getNode(state.fs, w.nodeId) !== undefined),
  selected: state.selected.filter((id) => fs.getNode(state.fs, id) !== undefined)
})

const withFs = (state: DesktopState, fsState: FsState): DesktopState =>
  closeMissing({ ...state, fs: fsState, menu: null, message: null, results: null })

/** Applies a file-system result: on success keeps the new tree, on failure shows the error. */
const applyFs = (state: DesktopState, result: FsResult, after?: (s: DesktopState, id: NodeId) => DesktopState): DesktopState => {
  if (!result.ok) return { ...state, message: result.error, menu: null }
  const next = withFs(state, result.state)
  return after ? after(next, result.id) : next
}

/** Runs one operation for several items; stops at the first error and keeps nothing, like an atomic action. */
const applyEach = (state: DesktopState, ids: Ids, op: (s: FsState, id: NodeId) => FsResult): DesktopState => {
  let current: FsState = state.fs
  for (const id of ids) {
    const result = op(current, id)
    if (!result.ok) return { ...state, message: result.error, menu: null }
    current = result.state
  }
  return withFs(state, current)
}

const userIds = (ids: Ids): Ids => ids.filter((id) => !fs.isSystem(id))

const updateWin = (state: DesktopState, winId: number, change: (w: Win) => Win): DesktopState => ({
  ...state,
  windows: state.windows.map((w) => (w.id === winId ? change(w) : w))
})

const focusWin = (state: DesktopState, winId: number): DesktopState => {
  const win = state.windows.find((w) => w.id === winId)
  if (!win || (state.windows.at(-1)?.id === winId && !win.minimized)) return state
  return { ...state, windows: [...state.windows.filter((w) => w.id !== winId), { ...win, minimized: false }] }
}

/** The window on top that is not minimised. */
export const activeWin = (state: DesktopState): Win | undefined => state.windows.findLast((w) => !w.minimized)

const openWin = (state: DesktopState, nodeId: NodeId): DesktopState => {
  const existing = state.windows.find((w) => w.nodeId === nodeId)
  if (existing) return focusWin({ ...state, menu: null }, existing.id)
  const offset = ((state.nextWinId - 1) % CASCADE_SIZE) * CASCADE_STEP
  const win: Win = { id: state.nextWinId, nodeId, x: 40 + offset, y: 30 + offset, maximized: false, minimized: false, history: [] }
  return { ...state, windows: [...state.windows, win], nextWinId: state.nextWinId + 1, menu: null, selected: [] }
}

const navigate = (state: DesktopState, winId: number, nodeId: NodeId, remember: boolean): DesktopState =>
  updateWin({ ...state, selected: [], menu: null }, winId, (w) =>
    w.nodeId === nodeId ? w : { ...w, nodeId, history: remember ? [...w.history, w.nodeId] : w.history }
  )

/** Ctrl+click (or a tap in «Вибрати кілька») adds or removes an item; a plain click selects only it. */
const select = (state: DesktopState, nodeId: NodeId | null, additive: boolean): DesktopState => {
  const base = { ...state, menu: null, renaming: state.renaming !== null && state.renaming === nodeId ? state.renaming : null }
  if (nodeId === null) return additive ? base : { ...base, selected: [] }
  if (!additive) return { ...base, selected: [nodeId] }
  const parent = fs.getNode(state.fs, nodeId)?.parentId
  const sameFolder = state.selected.filter((id) => fs.getNode(state.fs, id)?.parentId === parent)
  const selected = sameFolder.includes(nodeId) ? sameFolder.filter((id) => id !== nodeId) : [...sameFolder, nodeId]
  return { ...base, selected }
}

/** Shift+click: the items between the first selected one and `nodeId`, in the order the folder shows them. */
const selectRange = (state: DesktopState, nodeId: NodeId): DesktopState => {
  const parent = fs.getNode(state.fs, nodeId)?.parentId
  const anchor = state.selected[0]
  const siblings = parent == null ? [] : fs.childrenOf(state.fs, parent).map((n) => n.id)
  const from = anchor === undefined ? -1 : siblings.indexOf(anchor)
  const to = siblings.indexOf(nodeId)
  if (from < 0 || to < 0) return select(state, nodeId, false)
  const [a, b] = from <= to ? [from, to] : [to, from]
  const range = siblings.slice(a, b + 1)
  return { ...state, menu: null, renaming: null, selected: [anchor ?? nodeId, ...range.filter((id) => id !== anchor)] }
}

const compress = (state: DesktopState, ids: Ids): DesktopState => {
  const items = userIds(ids)
  const first = items[0] === undefined ? undefined : fs.getNode(state.fs, items[0])
  if (!first) return { ...state, menu: null }
  const name = first.kind === "folder" ? first.name : splitExtension(first.name).base
  return applyFs(state, fs.compress(state.fs, items, name), (s, id) => ({ ...s, selected: [id], renaming: id }))
}

const askDelete = (state: DesktopState, ids: Ids): DesktopState => {
  const items = userIds(ids)
  if (items.length === 0) return { ...state, menu: null }
  const inBin = items.every((id) => fs.getNode(state.fs, id)?.parentId === BIN_ID)
  return { ...state, menu: null, renaming: null, confirm: { kind: inBin ? "deleteForever" : "delete", ids: items } }
}

const runConfirm = (state: DesktopState, confirm: Confirm): DesktopState => {
  const cleared = { ...state, confirm: null, selected: [] }
  switch (confirm.kind) {
    case "delete":
      return applyEach(cleared, confirm.ids, fs.remove)
    case "deleteForever":
      return applyEach(cleared, confirm.ids, fs.deleteForever)
    case "emptyBin":
      return withFs(cleared, fs.emptyBin(state.fs))
  }
}

const paste = (state: DesktopState, targetId: NodeId): DesktopState => {
  const clip = state.clipboard
  if (!clip) return { ...state, menu: null }
  const next = applyEach(state, clip.ids, (s, id) => (clip.mode === "cut" ? fs.move(s, id, targetId) : fs.copy(s, id, targetId)))
  if (next.message !== null) return next
  return { ...next, clipboard: clip.mode === "cut" ? null : clip }
}

export const reducer = (state: DesktopState, action: Action): DesktopState => {
  switch (action.type) {
    case "reset":
      return initialState(action.fs, action.withApp)
    case "openApp":
      return openWin(state, APP_ID)
    case "openSave":
      return { ...state, saving: true, menu: null }
    case "closeSave":
      return { ...state, saving: false }
    case "saveFile":
      return applyFs(state, fs.saveFile(state.fs, action.folderId, action.name, action.ext), (s, id) => ({ ...s, saving: false, savedAs: id }))
    case "newFolder":
      return applyFs(state, fs.create(state.fs, action.containerId, "folder", action.name))
    case "open":
      return fs.getNode(state.fs, action.nodeId) ? openWin(state, action.nodeId) : state
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
    case "minimize":
      return updateWin({ ...state, menu: null }, action.winId, (w) => ({ ...w, minimized: true }))
    case "taskbar":
      return activeWin(state)?.id === action.winId
        ? updateWin(state, action.winId, (w) => ({ ...w, minimized: true }))
        : focusWin(state, action.winId)
    case "shortcut":
      return applyEach(state, action.ids, (s, id) => {
        const parent = fs.getNode(s, id)?.parentId ?? DESKTOP_ID
        // In «Цей ПК» only drives live, so Windows offers the desktop instead.
        const home = action.targetId ?? (parent === fs.THIS_PC_ID ? DESKTOP_ID : parent)
        return fs.createShortcut(s, id, home)
      })
    case "select":
      return action.range && action.nodeId !== null ? selectRange(state, action.nodeId) : select(state, action.nodeId, action.additive || state.multi)
    case "compress":
      return compress(state, action.ids)
    case "extract":
      return applyFs(state, fs.extractAll(state.fs, action.nodeId), (s, id) => ({ ...s, selected: [id] }))
    case "selectAll":
      return { ...state, menu: null, renaming: null, selected: userIds(fs.childrenOf(state.fs, action.containerId).map((n) => n.id)) }
    case "toggleMulti":
      return { ...state, multi: !state.multi, menu: null }
    case "startRename":
      return fs.isSystem(action.nodeId) ? state : { ...state, renaming: action.nodeId, selected: [action.nodeId], menu: null }
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
      return applyFs(state, fs.create(state.fs, action.containerId, action.kind, name), (s, id) => ({ ...s, selected: [id], renaming: id }))
    }
    case "askDelete":
      return askDelete(state, action.ids)
    case "askEmptyBin":
      return fs.childrenOf(state.fs, BIN_ID).length === 0 ? { ...state, menu: null } : { ...state, menu: null, confirm: { kind: "emptyBin" } }
    case "confirm":
      return state.confirm ? runConfirm(state, state.confirm) : state
    case "cancelConfirm":
      return { ...state, confirm: null }
    case "restore":
      return { ...applyEach(state, action.ids, fs.restore), selected: [] }
    case "clip": {
      const ids = userIds(action.ids)
      return ids.length === 0 ? state : { ...state, clipboard: { mode: action.mode, ids }, menu: null }
    }
    case "paste":
      return paste(state, action.targetId)
    case "drop": {
      const ids = userIds(action.ids).filter((id) => id !== action.targetId)
      if (ids.length === 0) return state
      const useCopy = action.copy && action.targetId !== BIN_ID
      return applyEach(state, ids, (s, id) => (useCopy ? fs.copy(s, id, action.targetId) : fs.move(s, id, action.targetId)))
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
export const titleOf = (state: DesktopState, nodeId: NodeId): string => {
  if (nodeId === DESKTOP_ID) return "Робочий стіл"
  const node = fs.getNode(state.fs, nodeId)
  return node ? fs.displayName(node) : ""
}

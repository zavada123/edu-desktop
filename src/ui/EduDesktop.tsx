import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { BIN_ID, childrenOf, DESKTOP_ID, getNode, isInBin, type NodeId, shortcutTarget, THIS_PC_ID } from "../core/fs.ts"
import { allMet } from "../core/goals.ts"
import { type Op, replay } from "../core/ops.ts"
import { buildState } from "../core/tree.ts"
import type { AppKind, Scenario } from "../scenarios/types.ts"
import { ConfirmDialog } from "./ConfirmDialog.tsx"
import { ContextMenu } from "./ContextMenu.tsx"
import { Explorer } from "./Explorer.tsx"
import { iconKindOf, ItemIcon, NodeIcon } from "./icons.tsx"
import { ItemGrid } from "./ItemGrid.tsx"
import { commandForKey } from "./keys.ts"
import { usePointer } from "./pointer.ts"
import { activeWin, APP_ID, initialState, reducer, titleOf } from "./store.ts"
import { AppContent, APPS, appTitle } from "./AppWindow.tsx"
import { SaveDialog } from "./SaveDialog.tsx"
import { TaskPanel } from "./TaskPanel.tsx"
import { Window } from "./Window.tsx"
import "./desktop.css"

const MESSAGE_MS = 4_000

const APP_ICONS: Record<AppKind, string> = { paint: "🎨", text: "📝", browser: "🌐" }

/** Typing in a name or address field keeps its own keys. */
const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

interface Props {
  /** To show another scenario, give the component a new `key`, for example the scenario id. */
  readonly scenario: Scenario
  /** Called after every check; `solved` is true when all conditions are met. */
  readonly onCheck?: (solved: boolean) => void
  /**
   * Called with the log of all file-system changes each time it changes. A page that checks answers
   * on its server sends this log and grades it there with `grade` from the core.
   */
  readonly onChange?: (ops: ReadonlyArray<Op>) => void
  /** A log saved earlier: the trainer starts with these changes made. An invalid log is ignored. */
  readonly initialOps?: ReadonlyArray<Op>
  /** `false` hides «Перевірити» when the page checks the answer itself. */
  readonly selfCheck?: boolean
}

const startState = (scenario: Scenario, ops: ReadonlyArray<Op>) => {
  const begin = buildState(scenario.start, scenario.drives)
  const replayed = replay(begin, ops)
  const state = initialState(replayed.ok ? replayed.state : begin, scenario.app !== undefined)
  return replayed.ok ? { ...state, ops } : state
}

/** The whole trainer for one scenario. Can be embedded into any React page. */
export const EduDesktop = ({ scenario, onCheck, onChange, initialOps = [], selfCheck = true }: Props) => {
  const [state, dispatch] = useReducer(reducer, null, () => startState(scenario, initialOps))
  const [taskOpen, setTaskOpen] = useState(true)

  const reset = useCallback(() => dispatch({ type: "reset", fs: buildState(scenario.start, scenario.drives), withApp: scenario.app !== undefined }), [scenario])

  // A ref, so a new callback on every render of the page does not report the same log again.
  const changed = useRef(onChange)
  useEffect(() => {
    changed.current = onChange
  })
  useEffect(() => {
    changed.current?.(state.ops)
  }, [state.ops])

  useEffect(() => {
    if (state.message === null) return
    const timer = window.setTimeout(() => dispatch({ type: "dismiss" }), MESSAGE_MS)
    return () => window.clearTimeout(timer)
  }, [state.message])

  useEffect(() => {
    if (state.results !== null) onCheck?.(allMet(state.results))
  }, [state.results, onCheck])

  /**
   * Double tap: a folder opens in the same window (or a new one from the desktop), a file opens a viewer,
   * a shortcut opens its object.
   */
  const open = useCallback(
    (nodeId: NodeId, fromWinId?: number): void => {
      const node = getNode(state.fs, nodeId)
      if (!node) return
      if (nodeId !== BIN_ID && isInBin(state.fs, nodeId)) {
        dispatch({ type: "notify", message: "Об'єкт у кошику. Щоб відкрити, спершу віднови його." })
        return
      }
      if (node.target !== undefined) {
        const target = shortcutTarget(state.fs, node)
        if (target) open(target.id, fromWinId)
        else dispatch({ type: "notify", message: "Ярлик не працює: об'єкт, на який він указує, видалено." })
        return
      }
      if (node.kind === "folder" && fromWinId !== undefined) dispatch({ type: "navigate", winId: fromWinId, nodeId })
      else dispatch({ type: "open", nodeId })
    },
    [state.fs]
  )

  /**
   * Where the student last clicked: a window id, the desktop, or `null` until they click inside the trainer,
   * so keys elsewhere on the page stay theirs.
   */
  const focus = useRef<number | "desktop" | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const onRootPointerDown = (e: { readonly target: EventTarget }) => {
    const win = (e.target as HTMLElement).closest("[data-win-id]")?.getAttribute("data-win-id")
    focus.current = win ? Number(win) : "desktop"
  }

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) focus.current = null
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (focus.current === null || state.confirm !== null || state.fileDialog !== null || isTextField(e.target)) return
      // A closed window hands the keys to the one on top, as in Windows.
      const focused = state.windows.find((w) => w.id === focus.current && !w.minimized)
      const win = focus.current === "desktop" ? undefined : (focused ?? activeWin(state))
      const folderId = win?.nodeId ?? DESKTOP_ID
      if (getNode(state.fs, folderId)?.kind !== "folder") return
      const command = commandForKey(state, { key: e.key, code: e.code, ctrl: e.ctrlKey || e.metaKey }, folderId)
      if (command === null) return
      e.preventDefault()
      if (command.type === "openItem") open(command.nodeId, win?.id)
      else dispatch(command)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [state, open])

  const { bind, drag } = usePointer({
    onSelect: (nodeId, additive, range) => dispatch({ type: "select", nodeId, additive, range }),
    onOpen: (nodeId) => {
      const parentId = getNode(state.fs, nodeId)?.parentId
      open(nodeId, state.windows.find((w) => w.nodeId === parentId)?.id)
    },
    onMenu: (x, y, containerId, targetId) => {
      // Right-click on a selected item keeps the whole selection, as in Windows.
      if (targetId !== null && !state.selected.includes(targetId)) dispatch({ type: "select", nodeId: targetId, additive: false })
      dispatch({ type: "menu", menu: { x, y, containerId, targetId } })
    },
    onDrop: (nodeId, targetId, copy) =>
      dispatch({ type: "drop", ids: state.selected.includes(nodeId) ? state.selected : [nodeId], targetId, copy }),
    onDropMenu: (x, y, nodeId, targetId) => {
      const ids = state.selected.includes(nodeId) ? state.selected : [nodeId]
      // Into the bin there is nothing to ask: it is always «Перемістити».
      if (targetId === BIN_ID) dispatch({ type: "drop", ids, targetId, copy: false })
      else dispatch({ type: "menu", menu: { x, y, containerId: targetId, targetId: null, drop: { ids, targetId } } })
    },
    isSoleSelected: (nodeId) => state.selected.length === 1 && state.selected[0] === nodeId,
    onRename: (nodeId) => dispatch({ type: "startRename", nodeId })
  })

  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const active = activeWin(state)
  const systemIcons = [getNode(state.fs, THIS_PC_ID), getNode(state.fs, BIN_ID)].filter((n) => n !== undefined)
  const desktopItems = [...systemIcons, ...childrenOf(state.fs, DESKTOP_ID)]
  const dragged = drag ? getNode(state.fs, drag.nodeId) : undefined
  const dragCount = drag && state.selected.includes(drag.nodeId) ? state.selected.length : 1

  return (
    <div ref={rootRef} className={`ed-root ${scenario.large ? "ed-large" : ""}`} onPointerDownCapture={onRootPointerDown}>
      <div className="ed-desktop">
        <ItemGrid state={state} containerId={DESKTOP_ID} items={desktopItems} bind={bind} dispatch={dispatch} variant="desktop" />
        {state.windows.map((win, i) => {
          if (win.nodeId === APP_ID && scenario.app) {
            // The program stays mounted while minimised, so the drawing is not lost.
            return (
              <div key={win.id} hidden={win.minimized}>
                <Window win={win} title={appTitle(state, scenario.app)} icon={<span aria-hidden="true">{APP_ICONS[scenario.app.kind]}</span>} active={win.id === active?.id} zIndex={10 + i} dispatch={dispatch}>
                  <AppContent app={scenario.app} state={state} dispatch={dispatch} />
                </Window>
              </div>
            )
          }
          const node = getNode(state.fs, win.nodeId)
          if (!node || win.minimized) return null
          return (
            <Window
              key={win.id}
              win={win}
              title={titleOf(state, win.nodeId)}
              icon={<NodeIcon kind={iconKindOf(node, binHasItems)} size={18} />}
              active={win.id === active?.id}
              zIndex={10 + i}
              dispatch={dispatch}
            >
              {node.kind === "folder" ? (
                <Explorer state={state} win={win} bind={bind} dispatch={dispatch} />
              ) : (
                <div className="ed-viewer">
                  <NodeIcon kind={iconKindOf(node, false)} size={96} />
                  <p>{node.name}</p>
                  <small>У тренажері файли не відкриваються, з ними можна лише працювати як з об'єктами.</small>
                </div>
              )}
            </Window>
          )
        })}
        {!taskOpen && (
          <button type="button" className="ed-task-show" onClick={() => setTaskOpen(true)}>
            📋 Завдання
          </button>
        )}
        <TaskPanel scenario={scenario} state={state} open={taskOpen} onToggle={() => setTaskOpen(false)} onReset={reset} dispatch={dispatch} selfCheck={selfCheck} />
      </div>
      <footer className="ed-taskbar">
        <button type="button" className="ed-start" onClick={() => setTaskOpen((v) => !v)} aria-label="Завдання">
          📋
        </button>
        <button
          type="button"
          className={`ed-multi ${state.multi ? "is-on" : ""}`}
          aria-pressed={state.multi}
          onClick={() => dispatch({ type: "toggleMulti" })}
          title="Кожне натискання додає об'єкт до виділених, як клацання з Ctrl"
        >
          ☑ Вибрати кілька
        </button>
        {state.windows.map((win) => (
          <button
            key={win.id}
            type="button"
            className={`ed-task-btn ${win.id === active?.id ? "is-active" : ""}`}
            onClick={() => dispatch({ type: "taskbar", winId: win.id })}
          >
            {win.nodeId === APP_ID && scenario.app ? appTitle(state, scenario.app) : titleOf(state, win.nodeId)}
          </button>
        ))}
        {scenario.app && !state.windows.some((w) => w.nodeId === APP_ID) && (
          <button type="button" className="ed-task-btn" onClick={() => dispatch({ type: "openApp" })}>
            {APP_ICONS[scenario.app.kind]} {APPS[scenario.app.kind].title}
          </button>
        )}
      </footer>
      {state.fileDialog && scenario.app && <SaveDialog key={state.fileDialog} mode={state.fileDialog} state={state} app={scenario.app} dispatch={dispatch} />}
      {state.confirm && <ConfirmDialog state={state} confirm={state.confirm} dispatch={dispatch} />}
      {state.menu && <ContextMenu state={state} menu={state.menu} dispatch={dispatch} onOpen={(id) => open(id)} />}
      {state.message && (
        <div className="ed-toast" role="alert" onClick={() => dispatch({ type: "dismiss" })}>
          {state.message}
        </div>
      )}
      {drag && dragged && (
        <div className="ed-ghost" style={{ left: drag.x, top: drag.y }}>
          <ItemIcon fs={state.fs} node={dragged} binHasItems={binHasItems} size={40} />
          <span>
            {drag.copy ? "＋ " : drag.right ? "? " : ""}
            {dragCount > 1 ? `${dragCount} об'єкти` : dragged.name}
          </span>
        </div>
      )}
    </div>
  )
}

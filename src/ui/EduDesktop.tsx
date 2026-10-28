import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { BIN_ID, childrenOf, DESKTOP_ID, getNode, isInBin, type NodeId, THIS_PC_ID } from "../core/fs.ts"
import { allMet } from "../core/goals.ts"
import { buildState } from "../core/tree.ts"
import type { Scenario } from "../scenarios/types.ts"
import { ConfirmDialog } from "./ConfirmDialog.tsx"
import { ContextMenu } from "./ContextMenu.tsx"
import { Explorer } from "./Explorer.tsx"
import { iconKindOf, NodeIcon } from "./icons.tsx"
import { ItemGrid } from "./ItemGrid.tsx"
import { commandForKey } from "./keys.ts"
import { usePointer } from "./pointer.ts"
import { initialState, reducer, titleOf } from "./store.ts"
import { TaskPanel } from "./TaskPanel.tsx"
import { Window } from "./Window.tsx"
import "./desktop.css"

const MESSAGE_MS = 4_000

/** Typing in a name or address field keeps its own keys. */
const isTextField = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

interface Props {
  readonly scenario: Scenario
  /** Called after every check; `solved` is true when all conditions are met. */
  readonly onCheck?: (solved: boolean) => void
}

/** The whole trainer for one scenario. Can be embedded into any React page. */
export const EduDesktop = ({ scenario, onCheck }: Props) => {
  const [state, dispatch] = useReducer(reducer, scenario, (s) => initialState(buildState(s.start, s.drives)))
  const [taskOpen, setTaskOpen] = useState(true)

  const reset = useCallback(() => dispatch({ type: "reset", fs: buildState(scenario.start, scenario.drives) }), [scenario])
  useEffect(reset, [reset])

  useEffect(() => {
    if (state.message === null) return
    const timer = window.setTimeout(() => dispatch({ type: "dismiss" }), MESSAGE_MS)
    return () => window.clearTimeout(timer)
  }, [state.message])

  useEffect(() => {
    if (state.results !== null) onCheck?.(allMet(state.results))
  }, [state.results, onCheck])

  /** Double tap: a folder opens in the same window (or a new one from the desktop), a file opens a viewer. */
  const open = useCallback(
    (nodeId: NodeId, fromWinId?: number) => {
      const node = getNode(state.fs, nodeId)
      if (!node) return
      if (nodeId !== BIN_ID && isInBin(state.fs, nodeId)) {
        dispatch({ type: "notify", message: "Об'єкт у кошику. Щоб відкрити, спершу віднови його." })
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
      if (focus.current === null || state.confirm !== null || isTextField(e.target)) return
      // A closed window hands the keys to the one on top, as in Windows.
      const win = focus.current === "desktop" ? undefined : (state.windows.find((w) => w.id === focus.current) ?? state.windows.at(-1))
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
    onSelect: (nodeId, additive) => dispatch({ type: "select", nodeId, additive }),
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
      dispatch({ type: "drop", ids: state.selected.includes(nodeId) ? state.selected : [nodeId], targetId, copy })
  })

  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const systemIcons = [getNode(state.fs, THIS_PC_ID), getNode(state.fs, BIN_ID)].filter((n) => n !== undefined)
  const desktopItems = [...systemIcons, ...childrenOf(state.fs, DESKTOP_ID)]
  const dragged = drag ? getNode(state.fs, drag.nodeId) : undefined
  const dragCount = drag && state.selected.includes(drag.nodeId) ? state.selected.length : 1

  return (
    <div ref={rootRef} className={`ed-root ${scenario.large ? "ed-large" : ""}`} onPointerDownCapture={onRootPointerDown}>
      <div className="ed-desktop">
        <ItemGrid state={state} containerId={DESKTOP_ID} items={desktopItems} bind={bind} dispatch={dispatch} variant="desktop" />
        {state.windows.map((win, i) => {
          const node = getNode(state.fs, win.nodeId)
          if (!node) return null
          return (
            <Window
              key={win.id}
              win={win}
              title={titleOf(state, win.nodeId)}
              icon={<NodeIcon kind={iconKindOf(node, binHasItems)} size={18} />}
              active={i === state.windows.length - 1}
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
        <TaskPanel scenario={scenario} state={state} open={taskOpen} onToggle={() => setTaskOpen(false)} onReset={reset} dispatch={dispatch} />
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
          <button key={win.id} type="button" className="ed-task-btn" onClick={() => dispatch({ type: "focus", winId: win.id })}>
            {titleOf(state, win.nodeId)}
          </button>
        ))}
      </footer>
      {state.confirm && <ConfirmDialog state={state} confirm={state.confirm} dispatch={dispatch} />}
      {state.menu && <ContextMenu state={state} menu={state.menu} dispatch={dispatch} onOpen={(id) => open(id)} />}
      {state.message && (
        <div className="ed-toast" role="alert" onClick={() => dispatch({ type: "dismiss" })}>
          {state.message}
        </div>
      )}
      {drag && dragged && (
        <div className="ed-ghost" style={{ left: drag.x, top: drag.y }}>
          <NodeIcon kind={iconKindOf(dragged, binHasItems)} size={40} />
          <span>
            {drag.copy ? "＋ " : ""}
            {dragCount > 1 ? `${dragCount} об'єкти` : dragged.name}
          </span>
        </div>
      )}
    </div>
  )
}

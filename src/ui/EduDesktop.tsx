import { useCallback, useEffect, useReducer, useState } from "react"
import { BIN_ID, childrenOf, DESKTOP_ID, getNode, isInBin, type NodeId } from "../core/fs.ts"
import { allMet } from "../core/goals.ts"
import { buildState } from "../core/tree.ts"
import type { Scenario } from "../scenarios/types.ts"
import { ContextMenu } from "./ContextMenu.tsx"
import { Explorer } from "./Explorer.tsx"
import { iconKindOf, NodeIcon } from "./icons.tsx"
import { ItemGrid } from "./ItemGrid.tsx"
import { usePointer } from "./pointer.ts"
import { initialState, reducer, titleOf } from "./store.ts"
import { TaskPanel } from "./TaskPanel.tsx"
import { Window } from "./Window.tsx"
import "./desktop.css"

const MESSAGE_MS = 4_000

interface Props {
  readonly scenario: Scenario
  /** Called after every check; `solved` is true when all conditions are met. */
  readonly onCheck?: (solved: boolean) => void
}

/** The whole trainer for one scenario. Can be embedded into any React page. */
export const EduDesktop = ({ scenario, onCheck }: Props) => {
  const [state, dispatch] = useReducer(reducer, scenario, (s) => initialState(buildState(s.start)))
  const [taskOpen, setTaskOpen] = useState(true)

  const reset = useCallback(() => dispatch({ type: "reset", fs: buildState(scenario.start) }), [scenario])
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

  const { bind, drag } = usePointer({
    onSelect: (nodeId) => dispatch({ type: "select", nodeId }),
    onOpen: (nodeId) => {
      const parentId = getNode(state.fs, nodeId)?.parentId
      open(nodeId, state.windows.find((w) => w.nodeId === parentId)?.id)
    },
    onMenu: (x, y, containerId, targetId) => {
      if (targetId !== null) dispatch({ type: "select", nodeId: targetId })
      dispatch({ type: "menu", menu: { x, y, containerId, targetId } })
    },
    onDrop: (nodeId, targetId, copy) => dispatch({ type: "drop", nodeId, targetId, copy })
  })

  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const desktopItems = [...childrenOf(state.fs, DESKTOP_ID), ...[getNode(state.fs, BIN_ID)].filter((n) => n !== undefined)]
  const dragged = drag ? getNode(state.fs, drag.nodeId) : undefined

  return (
    <div className={`ed-root ${scenario.large ? "ed-large" : ""}`}>
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
        {state.windows.map((win) => (
          <button key={win.id} type="button" className="ed-task-btn" onClick={() => dispatch({ type: "focus", winId: win.id })}>
            {titleOf(state, win.nodeId)}
          </button>
        ))}
      </footer>
      {state.menu && <ContextMenu state={state} menu={state.menu} dispatch={dispatch} onOpen={(id) => open(id)} />}
      {state.message && (
        <div className="ed-toast" role="alert" onClick={() => dispatch({ type: "dismiss" })}>
          {state.message}
        </div>
      )}
      {drag && dragged && (
        <div className="ed-ghost" style={{ left: drag.x, top: drag.y }}>
          <NodeIcon kind={iconKindOf(dragged, binHasItems)} size={40} />
          <span>{drag.copy ? "＋ " : ""}{dragged.name}</span>
        </div>
      )}
    </div>
  )
}

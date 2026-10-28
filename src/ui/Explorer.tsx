import { BIN_ID, childrenOf, DESKTOP_ID, getNode, isInBin, type NodeId, pathOf } from "../core/fs.ts"
import { plural } from "../core/names.ts"
import { ItemGrid } from "./ItemGrid.tsx"
import type { Action, DesktopState, Win } from "./store.ts"

type Bind = Parameters<typeof ItemGrid>[0]["bind"]

interface Props {
  readonly state: DesktopState
  readonly win: Win
  readonly bind: Bind
  readonly dispatch: (action: Action) => void
}

/** Address bar: every part of the path is a button, like the breadcrumbs in Windows Explorer. */
const Address = ({ state, win, dispatch }: Omit<Props, "bind">) => {
  const inBin = win.nodeId === BIN_ID || isInBin(state.fs, win.nodeId)
  const crumbs: ReadonlyArray<{ readonly id: NodeId; readonly name: string }> = inBin
    ? [{ id: BIN_ID, name: "Кошик" }]
    : [{ id: DESKTOP_ID, name: "Робочий стіл" }, ...pathOf(state.fs, win.nodeId).map((name, i, all) => ({ id: idAtDepth(state, win.nodeId, all.length - 1 - i), name }))]
  return (
    <nav className="ed-address" aria-label="Шлях">
      {crumbs.map((c, i) => (
        <span key={c.id} className="ed-crumb">
          {i > 0 && <span className="ed-crumb-sep">›</span>}
          <button type="button" onClick={() => dispatch({ type: "navigate", winId: win.id, nodeId: c.id })}>
            {c.name}
          </button>
        </span>
      ))}
    </nav>
  )
}

/** Walks `levels` steps up from `id`. */
const idAtDepth = (state: DesktopState, id: NodeId, levels: number): NodeId => {
  let cur = id
  for (let i = 0; i < levels; i++) cur = getNode(state.fs, cur)?.parentId ?? cur
  return cur
}

export const Explorer = ({ state, win, bind, dispatch }: Props) => {
  const folderId = win.nodeId
  const isBin = folderId === BIN_ID
  const readOnly = isBin || isInBin(state.fs, folderId)
  const selected = state.selected !== null && getNode(state.fs, state.selected)?.parentId === folderId ? state.selected : null
  const count = childrenOf(state.fs, folderId).length
  const canUp = getNode(state.fs, folderId)?.parentId != null

  return (
    <div className="ed-explorer">
      <div className="ed-toolbar" role="toolbar" aria-label="Дії з файлами">
        <button type="button" aria-label="Назад" disabled={win.history.length === 0} onClick={() => dispatch({ type: "back", winId: win.id })}>
          ←
        </button>
        <button type="button" aria-label="Вгору" disabled={!canUp} onClick={() => dispatch({ type: "up", winId: win.id })}>
          ↑
        </button>
        {!readOnly && (
          <>
            <button type="button" onClick={() => dispatch({ type: "create", containerId: folderId, kind: "folder" })}>
              ＋ Папка
            </button>
            <button type="button" disabled={selected === null} onClick={() => selected && dispatch({ type: "startRename", nodeId: selected })}>
              Перейменувати
            </button>
            <button type="button" disabled={selected === null} onClick={() => selected && dispatch({ type: "clip", mode: "copy", nodeId: selected })}>
              Копіювати
            </button>
            <button type="button" disabled={selected === null} onClick={() => selected && dispatch({ type: "clip", mode: "cut", nodeId: selected })}>
              Вирізати
            </button>
            <button type="button" disabled={state.clipboard === null} onClick={() => dispatch({ type: "paste", targetId: folderId })}>
              Вставити
            </button>
            <button type="button" disabled={selected === null} onClick={() => selected && dispatch({ type: "delete", nodeId: selected })}>
              Видалити
            </button>
          </>
        )}
        {isBin && (
          <>
            <button type="button" disabled={selected === null} onClick={() => selected && dispatch({ type: "restore", nodeId: selected })}>
              Відновити
            </button>
            <button type="button" disabled={childrenOf(state.fs, BIN_ID).length === 0} onClick={() => dispatch({ type: "emptyBin" })}>
              Очистити кошик
            </button>
          </>
        )}
      </div>
      <Address state={state} win={win} dispatch={dispatch} />
      <ItemGrid state={state} containerId={folderId} items={childrenOf(state.fs, folderId)} bind={bind} dispatch={dispatch} variant="explorer" />
      <div className="ed-status">{count} {plural(count, "об'єкт", "об'єкти", "об'єктів")}</div>
    </div>
  )
}

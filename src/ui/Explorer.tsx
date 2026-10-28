import { useEffect, useRef, useState } from "react"
import { BIN_ID, childrenOf, displayName, getNode, isInBin, type NodeId, resolveAddress, THIS_PC_ID, windowsPath } from "../core/fs.ts"
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

/** Folders from the top (desktop, «Цей ПК» or the bin) down to `id`. */
const chainOf = (state: DesktopState, id: NodeId): ReadonlyArray<NodeId> => {
  const parent = getNode(state.fs, id)?.parentId
  return parent === null || parent === undefined ? [id] : [...chainOf(state, parent), id]
}

/** Text field shown instead of the breadcrumbs: the full path, which can also be typed and opened with Enter. */
const AddressInput = ({ state, win, dispatch, onDone }: Omit<Props, "bind"> & { readonly onDone: () => void }) => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => ref.current?.select(), [])
  const go = (text: string) => {
    const target = resolveAddress(state.fs, text)
    if (target === null) dispatch({ type: "notify", message: `Не вдається знайти «${text.trim()}». Перевір, чи правильно записано шлях.` })
    else dispatch({ type: "navigate", winId: win.id, nodeId: target })
    onDone()
  }
  return (
    <input
      ref={ref}
      className="ed-path-input"
      aria-label="Адреса"
      defaultValue={windowsPath(state.fs, win.nodeId)}
      spellCheck={false}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") go(e.currentTarget.value)
        if (e.key === "Escape") onDone()
      }}
      onBlur={onDone}
    />
  )
}

/**
 * Address bar as in Windows: clickable folders, and a click on its empty part turns it into
 * the full path as the textbook writes it (`D:\\Мої уроки\\Інформатика`).
 */
const Address = ({ state, win, dispatch }: Omit<Props, "bind">) => {
  const [editing, setEditing] = useState(false)
  if (editing) return <div className="ed-address"><AddressInput state={state} win={win} dispatch={dispatch} onDone={() => setEditing(false)} /></div>
  return (
    <nav className="ed-address" aria-label="Шлях" title="Клацни тут, щоб побачити повний шлях" onClick={(e) => e.target === e.currentTarget && setEditing(true)}>
      {chainOf(state, win.nodeId).map((id, i) => {
        const node = getNode(state.fs, id)
        return (
          <span key={id} className="ed-crumb">
            {i > 0 && <span className="ed-crumb-sep">›</span>}
            <button type="button" onClick={() => dispatch({ type: "navigate", winId: win.id, nodeId: id })}>
              {node ? displayName(node) : ""}
            </button>
          </span>
        )
      })}
    </nav>
  )
}

const Toolbar = ({ state, win, dispatch }: Omit<Props, "bind">) => {
  const folderId = win.nodeId
  const isBin = folderId === BIN_ID
  const readOnly = isBin || folderId === THIS_PC_ID || isInBin(state.fs, folderId)
  const selected = state.selected.filter((id) => getNode(state.fs, id)?.parentId === folderId)
  const none = selected.length === 0
  const canUp = getNode(state.fs, folderId)?.parentId != null
  const button = (label: string, action: Action, disabled = false) => (
    <button type="button" disabled={disabled} onClick={() => dispatch(action)}>
      {label}
    </button>
  )
  return (
    <div className="ed-toolbar" role="toolbar" aria-label="Дії з файлами">
      <button type="button" aria-label="Назад" disabled={win.history.length === 0} onClick={() => dispatch({ type: "back", winId: win.id })}>
        ←
      </button>
      <button type="button" aria-label="Вгору" disabled={!canUp} onClick={() => dispatch({ type: "up", winId: win.id })}>
        ↑
      </button>
      {!readOnly && (
        <>
          {button("＋ Папка", { type: "create", containerId: folderId, kind: "folder" })}
          {button("Перейменувати", { type: "startRename", nodeId: selected[0] ?? "" }, selected.length !== 1)}
          {button("Копіювати", { type: "clip", mode: "copy", ids: selected }, none)}
          {button("Вирізати", { type: "clip", mode: "cut", ids: selected }, none)}
          {button("Вставити", { type: "paste", targetId: folderId }, state.clipboard === null)}
          {button("Видалити", { type: "askDelete", ids: selected }, none)}
        </>
      )}
      {isBin && (
        <>
          {button("Відновити", { type: "restore", ids: selected }, none)}
          {button("Видалити назавжди", { type: "askDelete", ids: selected }, none)}
          {button("Очистити кошик", { type: "askEmptyBin" }, childrenOf(state.fs, BIN_ID).length === 0)}
        </>
      )}
    </div>
  )
}

export const Explorer = ({ state, win, bind, dispatch }: Props) => {
  const folderId = win.nodeId
  const count = childrenOf(state.fs, folderId).length
  const selectedHere = state.selected.filter((id) => getNode(state.fs, id)?.parentId === folderId).length
  return (
    <div className="ed-explorer">
      <Toolbar state={state} win={win} dispatch={dispatch} />
      <Address state={state} win={win} dispatch={dispatch} />
      <ItemGrid state={state} containerId={folderId} items={childrenOf(state.fs, folderId)} bind={bind} dispatch={dispatch} variant="explorer" />
      <div className="ed-status">
        {count} {plural(count, "об'єкт", "об'єкти", "об'єктів")}
        {selectedHere > 0 && ` · виділено ${selectedHere}`}
      </div>
    </div>
  )
}

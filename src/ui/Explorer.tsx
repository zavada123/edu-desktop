import { Fragment, useEffect, useRef, useState } from "react"
import { BIN_ID, childrenOf, displayName, getNode, isInBin, type NodeId, resolveAddress, THIS_PC_ID, windowsPath } from "../core/fs.ts"
import { plural } from "../core/names.ts"
import type { SortKey } from "../core/listing.ts"
import { DetailsView } from "./DetailsView.tsx"
import { ItemGrid } from "./ItemGrid.tsx"
import { type Action, type DesktopState, listingOf, type ViewSettings, type Win } from "./store.ts"

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

const SORT_LABELS: ReadonlyArray<{ readonly key: SortKey; readonly label: string }> = [
  { key: "name", label: "Ім'я" },
  { key: "modified", label: "Дата змінення" },
  { key: "type", label: "Тип" },
  { key: "size", label: "Розмір" }
]

/** «Вигляд» menu of Explorer: icons or a table, the order, extensions and hidden items. */
const ViewMenu = ({ state, dispatch, onClose }: { readonly state: DesktopState; readonly dispatch: (a: Action) => void; readonly onClose: () => void }) => {
  const { view } = state
  const set = (change: Partial<ViewSettings>) => dispatch({ type: "view", change })
  const choice = (label: string, checked: boolean, onPick: () => void) => (
    <li role="none">
      <button type="button" role="menuitemradio" aria-checked={checked} onClick={onPick}>
        <span className="ed-mark" aria-hidden="true">{checked ? "●" : ""}</span>
        {label}
      </button>
    </li>
  )
  const toggle = (label: string, checked: boolean, onPick: () => void) => (
    <li role="none">
      <button type="button" role="menuitemcheckbox" aria-checked={checked} onClick={onPick}>
        <span className="ed-mark" aria-hidden="true">{checked ? "✓" : ""}</span>
        {label}
      </button>
    </li>
  )
  return (
    <>
      <div className="ed-menu-backdrop" onPointerDown={onClose} />
      <ul className="ed-viewmenu" role="menu" aria-label="Вигляд">
        <li className="ed-menu-title" role="presentation">Вигляд</li>
        {choice("Значки", view.mode === "icons", () => set({ mode: "icons" }))}
        {choice("Таблиця", view.mode === "details", () => set({ mode: "details" }))}
        <li className="ed-menu-title" role="presentation">Сортувати за</li>
        {SORT_LABELS.map((s) => (
          <Fragment key={s.key}>{choice(s.label, view.sort.key === s.key, () => set({ sort: { ...view.sort, key: s.key } }))}</Fragment>
        ))}
        {choice("За зростанням", !view.sort.desc, () => set({ sort: { ...view.sort, desc: false } }))}
        {choice("За спаданням", view.sort.desc, () => set({ sort: { ...view.sort, desc: true } }))}
        <li className="ed-menu-title" role="presentation">Показати</li>
        {toggle("Розширення імен файлів", view.showExtensions, () => set({ showExtensions: !view.showExtensions }))}
        {toggle("Приховані елементи", view.showHidden, () => set({ showHidden: !view.showHidden }))}
      </ul>
    </>
  )
}

const Toolbar = ({ state, win, dispatch, onView }: Omit<Props, "bind"> & { readonly onView: () => void }) => {
  const folderId = win.nodeId
  const isBin = folderId === BIN_ID
  const readOnly = isBin || folderId === THIS_PC_ID || isInBin(state.fs, folderId)
  const shown = new Set(listingOf(state, folderId, win.search).map((n) => n.id))
  const selected = state.selected.filter((id) => shown.has(id))
  const none = selected.length === 0
  const canUp = getNode(state.fs, folderId)?.parentId != null
  const button = (label: string, action: Action, disabled = false, keys?: string) => (
    <button type="button" disabled={disabled} title={keys === undefined ? undefined : `${label} (${keys})`} onClick={() => dispatch(action)}>
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
      <button type="button" title="Скасувати останню дію (Ctrl+Z)" disabled={state.marks.length === 0} onClick={() => dispatch({ type: "undo" })}>
        ↶ Скасувати
      </button>
      <button type="button" aria-haspopup="menu" onClick={onView}>
        Вигляд ▾
      </button>
      {!readOnly && (
        <>
          {button("＋ Папка", { type: "create", containerId: folderId, kind: "folder" })}
          {button("Перейменувати", { type: "startRename", nodeId: selected[0] ?? "" }, selected.length !== 1, "F2")}
          {button("Копіювати", { type: "clip", mode: "copy", ids: selected }, none, "Ctrl+C")}
          {button("Вирізати", { type: "clip", mode: "cut", ids: selected }, none, "Ctrl+X")}
          {button("Вставити", { type: "paste", targetId: folderId }, state.clipboard === null, "Ctrl+V")}
          {button("Видалити", { type: "askDelete", ids: selected }, none, "Delete")}
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

/** «Пошук»: what matches in this folder and its subfolders; `*.jpg` and `звіт*` work as in Windows. */
const SearchBox = ({ state, win, dispatch }: Omit<Props, "bind">) => {
  const node = getNode(state.fs, win.nodeId)
  if (win.nodeId === THIS_PC_ID || win.nodeId === BIN_ID) return null
  return (
    <div className="ed-search">
      <input
        type="search"
        aria-label="Пошук у папці"
        placeholder={`Пошук: ${node ? displayName(node) : ""}`}
        value={win.search}
        spellCheck={false}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => dispatch({ type: "search", winId: win.id, text: e.currentTarget.value })}
        onKeyDown={(e) => {
          if (e.key === "Escape") dispatch({ type: "search", winId: win.id, text: "" })
        }}
      />
    </div>
  )
}

export const Explorer = ({ state, win, bind, dispatch }: Props) => {
  const folderId = win.nodeId
  const [viewOpen, setViewOpen] = useState(false)
  const searching = win.search.trim() !== ""
  const items = listingOf(state, folderId, win.search)
  const count = items.length
  const shown = new Set(items.map((n) => n.id))
  const selectedHere = state.selected.filter((id) => shown.has(id)).length
  return (
    <div className="ed-explorer">
      <Toolbar state={state} win={win} dispatch={dispatch} onView={() => setViewOpen((v) => !v)} />
      {viewOpen && <ViewMenu state={state} dispatch={dispatch} onClose={() => setViewOpen(false)} />}
      <div className="ed-addressbar">
        <Address state={state} win={win} dispatch={dispatch} />
        <SearchBox state={state} win={win} dispatch={dispatch} />
      </div>
      {state.view.mode === "details" || searching ? (
        <DetailsView state={state} containerId={folderId} items={items} bind={bind} dispatch={dispatch} searching={searching} />
      ) : (
        <ItemGrid state={state} containerId={folderId} items={items} bind={bind} dispatch={dispatch} variant="explorer" />
      )}
      <div className="ed-status">
        {searching ? `Знайдено: ${count}` : `${count} ${plural(count, "об'єкт", "об'єкти", "об'єктів")}`}
        {selectedHere > 0 && ` · виділено ${selectedHere}`}
      </div>
    </div>
  )
}

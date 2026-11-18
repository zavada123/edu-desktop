import { childrenOf, type FsNode, isInBin, type NodeId, BIN_ID, THIS_PC_ID } from "../core/fs.ts"
import { datesOf, type SortKey, shownName, typeName } from "../core/listing.ts"
import { formatShortDate, locationOf, shortSize, sizeOf } from "../core/props.ts"
import { ItemIcon } from "./icons.tsx"
import { RenameInput } from "./ItemGrid.tsx"
import type { Action, DesktopState } from "./store.ts"

type Bind = (nodeId: NodeId | null, containerId: NodeId) => {
  readonly onPointerDown: (e: React.PointerEvent) => void
  readonly onContextMenu: (e: React.MouseEvent) => void
}

interface Props {
  readonly state: DesktopState
  readonly containerId: NodeId
  readonly items: ReadonlyArray<FsNode>
  readonly bind: Bind
  readonly dispatch: (action: Action) => void
  /** Search results: a «Папка» column shows where each item lies. */
  readonly searching: boolean
}

const COLUMNS: ReadonlyArray<{ readonly key: SortKey; readonly label: string }> = [
  { key: "name", label: "Ім'я" },
  { key: "modified", label: "Дата змінення" },
  { key: "type", label: "Тип" },
  { key: "size", label: "Розмір" }
]

/** «Таблиця» as in Windows Explorer: a click on a column heading sorts by it, a second click turns the order round. */
export const DetailsView = ({ state, containerId, items, bind, dispatch, searching }: Props) => {
  const { sort, showExtensions } = state.view
  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const cutIds = state.clipboard?.mode === "cut" ? state.clipboard.ids : []
  const sortBy = (key: SortKey) => dispatch({ type: "view", change: { sort: { key, desc: sort.key === key ? !sort.desc : false } } })
  return (
    <div className={`ed-details${searching ? " is-search" : ""}`}>
      <div className="ed-details-head" role="row">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            role="columnheader"
            className={`ed-col-${col.key}`}
            aria-sort={sort.key === col.key ? (sort.desc ? "descending" : "ascending") : "none"}
            onClick={() => sortBy(col.key)}
          >
            {col.label}
            {sort.key === col.key && <span aria-hidden="true">{sort.desc ? " ▼" : " ▲"}</span>}
          </button>
        ))}
        {searching && <span className="ed-col-where">Папка</span>}
      </div>
      <div className="ed-details-body" data-drop-id={containerId} {...bind(null, containerId)}>
        {items.map((node) => {
          const isFolderTarget = node.kind === "folder" && node.id !== THIS_PC_ID && !isInBin(state.fs, node.id)
          const classes = ["ed-row", state.selected.includes(node.id) ? "is-selected" : "", cutIds.includes(node.id) ? "is-cut" : "", node.hidden ? "is-hidden" : ""]
          const name = shownName(node, showExtensions)
          return (
            <div key={node.id} role="row" className={classes.join(" ")} data-drop-id={isFolderTarget ? node.id : undefined} title={name} {...bind(node.id, containerId)}>
              <span className="ed-col-name">
                <ItemIcon fs={state.fs} node={node} binHasItems={binHasItems} size={20} />
                {state.renaming === node.id ? <RenameInput node={node} showExtensions={showExtensions} dispatch={dispatch} /> : <span className="ed-label">{name}</span>}
              </span>
              <span className="ed-col-modified">{formatShortDate(datesOf(state.fs, node, state.born).modified)}</span>
              <span className="ed-col-type">{typeName(node)}</span>
              <span className="ed-col-size">{node.kind === "file" ? shortSize(sizeOf(state.fs, node)) : ""}</span>
              {searching && (
                <span className="ed-col-where" title={locationOf(state.fs, node)}>
                  {locationOf(state.fs, node)}
                </span>
              )}
            </div>
          )
        })}
        {items.length === 0 && <p className="ed-empty">{searching ? "Нічого не знайдено" : "Ця папка порожня"}</p>}
      </div>
    </div>
  )
}

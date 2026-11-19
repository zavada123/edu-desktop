import { useEffect, useRef } from "react"
import { BIN_ID, childrenOf, displayName, type FsNode, isInBin, type NodeId, THIS_PC_ID } from "../core/fs.ts"
import { shownName } from "../core/listing.ts"
import { splitExtension } from "../core/names.ts"
import { ItemIcon } from "./icons.tsx"
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
  readonly variant: "desktop" | "explorer"
}

/**
 * The name field of «Перейменувати». With «Розширення імен файлів» off it holds the name without the extension
 * and keeps the extension, as Windows does.
 */
export const RenameInput = ({ node, showExtensions, dispatch }: { readonly node: FsNode; readonly showExtensions: boolean; readonly dispatch: (a: Action) => void }) => {
  const ref = useRef<HTMLInputElement>(null)
  const shown = shownName(node, showExtensions)
  const kept = node.name.slice(shown.length)
  useEffect(() => {
    const input = ref.current
    if (!input) return
    input.focus()
    // Like Windows: select the name without the extension so typing keeps `.jpg`.
    const { base } = splitExtension(shown)
    input.setSelectionRange(0, (node.kind === "folder" && !node.zip) || node.target !== undefined || kept !== "" ? shown.length : base.length)
  }, [node.id, node.kind, node.zip, node.target, shown, kept])
  const commit = (value: string) => dispatch({ type: "commitRename", nodeId: node.id, name: `${value}${kept}` })
  return (
    <input
      ref={ref}
      className="ed-rename"
      defaultValue={shown}
      aria-label="Нова назва"
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(e.currentTarget.value)
        if (e.key === "Escape") dispatch({ type: "cancelRename" })
      }}
      onBlur={(e) => commit(e.currentTarget.value)}
    />
  )
}

export const ItemGrid = ({ state, containerId, items, bind, dispatch, variant }: Props) => {
  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const cutIds = state.clipboard?.mode === "cut" ? state.clipboard.ids : []
  const label = (node: FsNode) => (node.parentId === THIS_PC_ID || node.parentId === null ? displayName(node) : shownName(node, state.view.showExtensions))
  return (
    <div className={`ed-grid ed-grid--${variant}`} data-drop-id={containerId} {...bind(null, containerId)}>
      {items.map((node) => {
        const isFolderTarget = node.kind === "folder" && node.id !== THIS_PC_ID && (node.id === BIN_ID || !isInBin(state.fs, node.id))
        const classes = ["ed-item", state.selected.includes(node.id) ? "is-selected" : "", cutIds.includes(node.id) ? "is-cut" : "", node.hidden ? "is-hidden" : ""]
        return (
          <div
            key={node.id}
            className={classes.join(" ")}
            data-drop-id={isFolderTarget ? node.id : undefined}
            title={label(node)}
            {...bind(node.id, containerId)}
          >
            <ItemIcon fs={state.fs} node={node} binHasItems={binHasItems} size={variant === "desktop" ? 48 : 44} />
            {state.renaming === node.id ? (
              <RenameInput node={node} showExtensions={state.view.showExtensions} dispatch={dispatch} />
            ) : (
              <span className="ed-label">{label(node)}</span>
            )}
          </div>
        )
      })}
      {items.length === 0 && variant === "explorer" && <p className="ed-empty">Ця папка порожня</p>}
    </div>
  )
}

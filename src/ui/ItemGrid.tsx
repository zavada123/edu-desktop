import { useEffect, useRef } from "react"
import { BIN_ID, childrenOf, displayName, type FsNode, isInBin, type NodeId, THIS_PC_ID } from "../core/fs.ts"
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

const RenameInput = ({ node, dispatch }: { readonly node: FsNode; readonly dispatch: (a: Action) => void }) => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const input = ref.current
    if (!input) return
    input.focus()
    // Like Windows: select the name without the extension so typing keeps `.jpg`.
    const { base } = splitExtension(node.name)
    input.setSelectionRange(0, node.kind === "folder" || node.target !== undefined ? node.name.length : base.length)
  }, [node.id, node.kind, node.name])
  return (
    <input
      ref={ref}
      className="ed-rename"
      defaultValue={node.name}
      aria-label="Нова назва"
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") dispatch({ type: "commitRename", nodeId: node.id, name: e.currentTarget.value })
        if (e.key === "Escape") dispatch({ type: "cancelRename" })
      }}
      onBlur={(e) => dispatch({ type: "commitRename", nodeId: node.id, name: e.currentTarget.value })}
    />
  )
}

export const ItemGrid = ({ state, containerId, items, bind, dispatch, variant }: Props) => {
  const binHasItems = childrenOf(state.fs, BIN_ID).length > 0
  const cutIds = state.clipboard?.mode === "cut" ? state.clipboard.ids : []
  return (
    <div className={`ed-grid ed-grid--${variant}`} data-drop-id={containerId} {...bind(null, containerId)}>
      {items.map((node) => {
        const isFolderTarget = node.kind === "folder" && node.id !== THIS_PC_ID && (node.id === BIN_ID || !isInBin(state.fs, node.id))
        const classes = ["ed-item", state.selected.includes(node.id) ? "is-selected" : "", cutIds.includes(node.id) ? "is-cut" : ""]
        return (
          <div
            key={node.id}
            className={classes.join(" ")}
            data-drop-id={isFolderTarget ? node.id : undefined}
            title={displayName(node)}
            {...bind(node.id, containerId)}
          >
            <ItemIcon fs={state.fs} node={node} binHasItems={binHasItems} size={variant === "desktop" ? 48 : 44} />
            {state.renaming === node.id ? (
              <RenameInput node={node} dispatch={dispatch} />
            ) : (
              <span className="ed-label">{displayName(node)}</span>
            )}
          </div>
        )
      })}
      {items.length === 0 && variant === "explorer" && <p className="ed-empty">Ця папка порожня</p>}
    </div>
  )
}

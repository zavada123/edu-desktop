import { useLayoutEffect, useRef, useState } from "react"
import { BIN_ID, childrenOf, getNode, isInBin, isSystem } from "../core/fs.ts"
import type { Action, DesktopState, Menu } from "./store.ts"

interface MenuItem {
  readonly label: string
  readonly action: Action | "open"
  readonly disabled?: boolean
}

const itemsFor = (state: DesktopState, menu: Menu): ReadonlyArray<MenuItem> => {
  const { targetId, containerId } = menu
  if (targetId === BIN_ID) {
    return [
      { label: "Відкрити", action: "open" },
      { label: "Очистити кошик", action: { type: "emptyBin" }, disabled: childrenOf(state.fs, BIN_ID).length === 0 }
    ]
  }
  if (targetId !== null) {
    const node = getNode(state.fs, targetId)
    if (!node) return []
    if (node.parentId === BIN_ID) return [{ label: "Відновити", action: { type: "restore", nodeId: targetId } }]
    if (isInBin(state.fs, targetId) || isSystem(targetId)) return []
    return [
      { label: "Відкрити", action: "open" },
      { label: "Вирізати", action: { type: "clip", mode: "cut", nodeId: targetId } },
      { label: "Копіювати", action: { type: "clip", mode: "copy", nodeId: targetId } },
      ...(node.kind === "folder" ? [{ label: "Вставити сюди", action: { type: "paste", targetId } as const, disabled: state.clipboard === null }] : []),
      { label: "Перейменувати", action: { type: "startRename", nodeId: targetId } },
      { label: "Видалити", action: { type: "delete", nodeId: targetId } }
    ]
  }
  if (containerId === BIN_ID || isInBin(state.fs, containerId)) {
    return [{ label: "Очистити кошик", action: { type: "emptyBin" }, disabled: childrenOf(state.fs, BIN_ID).length === 0 }]
  }
  return [
    { label: "Створити папку", action: { type: "create", containerId, kind: "folder" } },
    { label: "Створити текстовий документ", action: { type: "create", containerId, kind: "file" } },
    { label: "Вставити", action: { type: "paste", targetId: containerId }, disabled: state.clipboard === null }
  ]
}

interface Props {
  readonly state: DesktopState
  readonly menu: Menu
  readonly dispatch: (action: Action) => void
  readonly onOpen: (nodeId: string) => void
}

/** Right-click (or long-press) menu. It is moved back inside the screen if it would stick out. */
export const ContextMenu = ({ state, menu, dispatch, onOpen }: Props) => {
  const ref = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState({ left: menu.x, top: menu.y })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setPos({ left: Math.max(4, Math.min(menu.x, window.innerWidth - width - 4)), top: Math.max(4, Math.min(menu.y, window.innerHeight - height - 4)) })
  }, [menu.x, menu.y])

  const items = itemsFor(state, menu)
  if (items.length === 0) return null
  return (
    <>
      <div className="ed-menu-backdrop" onPointerDown={() => dispatch({ type: "menu", menu: null })} onContextMenu={(e) => e.preventDefault()} />
      <ul ref={ref} className="ed-menu" role="menu" style={pos}>
        {items.map((item) => (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.action === "open") {
                  dispatch({ type: "menu", menu: null })
                  if (menu.targetId !== null) onOpen(menu.targetId)
                } else dispatch(item.action)
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

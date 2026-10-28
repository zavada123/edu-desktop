import { useLayoutEffect, useRef, useState } from "react"
import { BIN_ID, childrenOf, getNode, isInBin, isSystem, type NodeId, THIS_PC_ID } from "../core/fs.ts"
import type { Action, DesktopState, Menu } from "./store.ts"

type Command = Action | "open" | "create"

interface MenuItem {
  readonly label: string
  readonly command: Command
  readonly disabled?: boolean
}

/** The clicked item and, if it is selected, every other selected item too. */
const targetsOf = (state: DesktopState, targetId: NodeId): ReadonlyArray<NodeId> =>
  state.selected.includes(targetId) ? state.selected : [targetId]

const itemMenu = (state: DesktopState, targetId: NodeId): ReadonlyArray<MenuItem> => {
  const node = getNode(state.fs, targetId)
  if (!node) return []
  if (targetId === BIN_ID) {
    return [
      { label: "Відкрити", command: "open" },
      { label: "Очистити кошик", command: { type: "askEmptyBin" }, disabled: childrenOf(state.fs, BIN_ID).length === 0 }
    ]
  }
  if (isSystem(targetId)) return [{ label: "Відкрити", command: "open" }]
  const ids = targetsOf(state, targetId)
  if (node.parentId === BIN_ID) {
    return [
      { label: "Відновити", command: { type: "restore", ids } },
      { label: "Видалити назавжди", command: { type: "askDelete", ids } }
    ]
  }
  if (isInBin(state.fs, targetId)) return []
  const single = ids.length === 1
  return [
    ...(single ? [{ label: "Відкрити", command: "open" } as const] : []),
    { label: "Вирізати", command: { type: "clip", mode: "cut", ids } },
    { label: "Копіювати", command: { type: "clip", mode: "copy", ids } },
    ...(single && node.kind === "folder"
      ? [{ label: "Вставити сюди", command: { type: "paste", targetId } as const, disabled: state.clipboard === null }]
      : []),
    { label: "Видалити", command: { type: "askDelete", ids } },
    ...(single ? [{ label: "Перейменувати", command: { type: "startRename", nodeId: targetId } as const }] : [])
  ]
}

const spaceMenu = (state: DesktopState, containerId: NodeId): ReadonlyArray<MenuItem> => {
  if (containerId === BIN_ID || isInBin(state.fs, containerId)) {
    return [{ label: "Очистити кошик", command: { type: "askEmptyBin" }, disabled: childrenOf(state.fs, BIN_ID).length === 0 }]
  }
  if (containerId === THIS_PC_ID) return []
  return [
    { label: "Створити", command: "create" },
    { label: "Вставити", command: { type: "paste", targetId: containerId }, disabled: state.clipboard === null }
  ]
}

const createMenu = (containerId: NodeId): ReadonlyArray<MenuItem> => [
  { label: "Папку", command: { type: "create", containerId, kind: "folder" } },
  { label: "Текстовий документ", command: { type: "create", containerId, kind: "file" } }
]

interface Props {
  readonly state: DesktopState
  readonly menu: Menu
  readonly dispatch: (action: Action) => void
  readonly onOpen: (nodeId: NodeId) => void
}

/** Right-click (or long-press) menu with the «Створити ›» submenu, as in the textbook. Stays inside the screen. */
export const ContextMenu = ({ state, menu, dispatch, onOpen }: Props) => {
  const ref = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState({ left: menu.x, top: menu.y })
  const [creating, setCreating] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setPos({ left: Math.max(4, Math.min(menu.x, window.innerWidth - width - 4)), top: Math.max(4, Math.min(menu.y, window.innerHeight - height - 4)) })
  }, [menu.x, menu.y, creating])

  const items = creating ? createMenu(menu.containerId) : menu.targetId !== null ? itemMenu(state, menu.targetId) : spaceMenu(state, menu.containerId)
  if (items.length === 0) return null

  const run = (command: Command) => {
    if (command === "create") return setCreating(true)
    if (command !== "open") return dispatch(command)
    dispatch({ type: "menu", menu: null })
    if (menu.targetId !== null) onOpen(menu.targetId)
  }

  return (
    <>
      <div className="ed-menu-backdrop" onPointerDown={() => dispatch({ type: "menu", menu: null })} onContextMenu={(e) => e.preventDefault()} />
      <ul ref={ref} className="ed-menu" role="menu" style={pos}>
        {creating && (
          <li role="none">
            <button type="button" role="menuitem" className="ed-menu-back" onClick={() => setCreating(false)}>
              ‹ Створити
            </button>
          </li>
        )}
        {items.map((item) => (
          <li key={item.label} role="none">
            <button type="button" role="menuitem" disabled={item.disabled} onClick={() => run(item.command)}>
              {item.label}
              {item.command === "create" && <span className="ed-menu-arrow">›</span>}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

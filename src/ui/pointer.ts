import { useCallback, useEffect, useRef, useState } from "react"
import type { NodeId } from "../core/fs.ts"

/**
 * One pointer handler for mouse, pen and touch, so the trainer works the same on a phone:
 * tap selects, double tap opens, long press (or right click) opens the menu,
 * pressing and moving drags an item onto a folder or the bin.
 */

const LONG_PRESS_MS = 550
const DOUBLE_TAP_MS = 450
const DRAG_THRESHOLD_PX = 8

export interface Drag {
  readonly nodeId: NodeId
  readonly x: number
  readonly y: number
  /** Ctrl held: copy instead of move, as in Windows. */
  readonly copy: boolean
}

export interface PointerHandlers {
  /** Single tap or click on an item, or on empty space (`null`). `additive`: Ctrl, Shift or ⌘ was held. */
  readonly onSelect: (nodeId: NodeId | null, additive: boolean) => void
  readonly onOpen: (nodeId: NodeId) => void
  readonly onMenu: (x: number, y: number, containerId: NodeId, nodeId: NodeId | null) => void
  readonly onDrop: (nodeId: NodeId, targetId: NodeId, copy: boolean) => void
}

interface Press {
  readonly nodeId: NodeId | null
  readonly containerId: NodeId
  readonly startX: number
  readonly startY: number
  dragging: boolean
  consumed: boolean
  timer: number | undefined
}

/** Finds the folder under the finger: elements carry `data-drop-id`. */
const dropTargetAt = (x: number, y: number): NodeId | null => {
  const el = document.elementFromPoint(x, y)
  const target = el instanceof Element ? el.closest<HTMLElement>("[data-drop-id]") : null
  return target?.dataset["dropId"] ?? null
}

export const usePointer = (handlers: PointerHandlers) => {
  const [drag, setDrag] = useState<Drag | null>(null)
  const press = useRef<Press | null>(null)
  const lastTap = useRef<{ nodeId: NodeId; time: number } | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const p = press.current
      if (!p || p.consumed || p.nodeId === null) return
      if (!p.dragging && Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < DRAG_THRESHOLD_PX) return
      window.clearTimeout(p.timer)
      p.dragging = true
      setDrag({ nodeId: p.nodeId, x: e.clientX, y: e.clientY, copy: e.ctrlKey })
    }
    const onUp = (e: PointerEvent) => {
      const p = press.current
      press.current = null
      if (!p) return
      window.clearTimeout(p.timer)
      if (p.dragging && p.nodeId !== null) {
        setDrag(null)
        const target = dropTargetAt(e.clientX, e.clientY)
        if (target !== null && target !== p.containerId) handlersRef.current.onDrop(p.nodeId, target, e.ctrlKey)
        return
      }
      if (p.consumed) return
      handlersRef.current.onSelect(p.nodeId, e.ctrlKey || e.metaKey || e.shiftKey)
      if (p.nodeId === null) return
      const now = Date.now()
      const prev = lastTap.current
      if (prev && prev.nodeId === p.nodeId && now - prev.time < DOUBLE_TAP_MS) {
        lastTap.current = null
        handlersRef.current.onOpen(p.nodeId)
      } else {
        lastTap.current = { nodeId: p.nodeId, time: now }
      }
    }
    const onCancel = () => {
      if (press.current) window.clearTimeout(press.current.timer)
      press.current = null
      setDrag(null)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
    }
  }, [])

  /** Props for an item (`nodeId`) or for the empty space of a folder (`null`). */
  const bind = useCallback(
    (nodeId: NodeId | null, containerId: NodeId) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0) return
        e.stopPropagation()
        const p: Press = { nodeId, containerId, startX: e.clientX, startY: e.clientY, dragging: false, consumed: false, timer: undefined }
        if (e.pointerType !== "mouse") {
          const { clientX, clientY } = e
          p.timer = window.setTimeout(() => {
            p.consumed = true
            handlersRef.current.onMenu(clientX, clientY, containerId, nodeId)
          }, LONG_PRESS_MS)
        }
        press.current = p
      },
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Touch browsers also fire contextmenu on a long press: open the menu once and ignore the release.
        const p = press.current
        if (p?.consumed) return
        if (p) {
          window.clearTimeout(p.timer)
          p.consumed = true
        }
        handlersRef.current.onMenu(e.clientX, e.clientY, containerId, nodeId)
      }
    }),
    []
  )

  return { bind, drag }
}

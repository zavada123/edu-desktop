import { useRef } from "react"
import { type Rect, RESIZE_EDGES, type ResizeEdge, resizeRect } from "./resize.ts"
import type { Action, Win } from "./store.ts"

interface Props {
  readonly win: Win
  readonly title: string
  readonly icon: React.ReactNode
  readonly active: boolean
  readonly zIndex: number
  readonly dispatch: (action: Action) => void
  readonly children: React.ReactNode
}

interface ResizeStart {
  readonly edge: ResizeEdge
  readonly pointerX: number
  readonly pointerY: number
  readonly rect: Rect
  readonly bounds: { readonly width: number; readonly height: number }
}

/**
 * Window frame: title bar to drag, minimise, maximise and close buttons, and edges and corners to resize it
 * as in Windows. On phones it always fills the screen (CSS), so the edges are hidden there.
 */
export const Window = ({ win, title, icon, active, zIndex, dispatch, children }: Props) => {
  const frame = useRef<HTMLElement>(null)
  const dragStart = useRef<{ dx: number; dy: number } | null>(null)
  const resizeStart = useRef<ResizeStart | null>(null)

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.maximized || e.button !== 0 || e.target instanceof HTMLButtonElement) return
    dragStart.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onTitlePointerMove = (e: React.PointerEvent) => {
    const start = dragStart.current
    if (start) dispatch({ type: "moveWin", winId: win.id, x: e.clientX - start.dx, y: e.clientY - start.dy })
  }

  const onEdgePointerDown = (edge: ResizeEdge) => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frame.current
    const desk = el?.offsetParent
    if (!el || !desk || win.maximized || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    resizeStart.current = {
      edge,
      pointerX: e.clientX,
      pointerY: e.clientY,
      rect: { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight },
      bounds: { width: desk.clientWidth, height: desk.clientHeight }
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onEdgePointerMove = (e: React.PointerEvent) => {
    const start = resizeStart.current
    if (!start) return
    const next = resizeRect(start.rect, start.edge, e.clientX - start.pointerX, e.clientY - start.pointerY, start.bounds)
    dispatch({ type: "resizeWin", winId: win.id, ...next })
  }
  const endResize = () => (resizeStart.current = null)

  const toggleMax = () => dispatch({ type: "toggleMax", winId: win.id })

  return (
    <section
      ref={frame}
      data-win-id={win.id}
      className={`ed-win ${win.maximized ? "is-max" : ""} ${active ? "is-active" : ""}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex }}
      aria-label={title}
      onPointerDownCapture={() => dispatch({ type: "focus", winId: win.id })}
    >
      <div className="ed-win-body">
        <div
          className="ed-titlebar"
          onPointerDown={onTitlePointerDown}
          onPointerMove={onTitlePointerMove}
          onPointerUp={() => (dragStart.current = null)}
          onDoubleClick={(e) => {
            if (!(e.target instanceof HTMLButtonElement)) toggleMax()
          }}
        >
          <span className="ed-title-icon">{icon}</span>
          <span className="ed-title">{title}</span>
          <button type="button" className="ed-tb-btn ed-min" aria-label="Згорнути" title="Згорнути" onClick={() => dispatch({ type: "minimize", winId: win.id })}>
            ─
          </button>
          <button
            type="button"
            className="ed-tb-btn ed-max"
            aria-label={win.maximized ? "Відновити" : "Розгорнути"}
            title={win.maximized ? "Відновити" : "Розгорнути"}
            onClick={toggleMax}
          >
            {win.maximized ? "❐" : "▢"}
          </button>
          <button type="button" className="ed-tb-btn ed-close" aria-label="Закрити" title="Закрити" onClick={() => dispatch({ type: "close", winId: win.id })}>
            ✕
          </button>
        </div>
        {children}
      </div>
      {!win.maximized &&
        RESIZE_EDGES.map((edge) => (
          <div
            key={edge}
            className={`ed-resize ed-resize-${edge}`}
            aria-hidden="true"
            onPointerDown={onEdgePointerDown(edge)}
            onPointerMove={onEdgePointerMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        ))}
    </section>
  )
}

import { useRef } from "react"
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

/** Window frame: title bar to drag, maximise and close buttons. On phones it always fills the screen (CSS). */
export const Window = ({ win, title, icon, active, zIndex, dispatch, children }: Props) => {
  const dragStart = useRef<{ dx: number; dy: number } | null>(null)

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (win.maximized || e.button !== 0 || e.target instanceof HTMLButtonElement) return
    dragStart.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onTitlePointerMove = (e: React.PointerEvent) => {
    const start = dragStart.current
    if (start) dispatch({ type: "moveWin", winId: win.id, x: e.clientX - start.dx, y: e.clientY - start.dy })
  }

  return (
    <section
      data-win-id={win.id}
      className={`ed-win ${win.maximized ? "is-max" : ""} ${active ? "is-active" : ""}`}
      style={{ left: win.x, top: win.y, zIndex }}
      aria-label={title}
      onPointerDownCapture={() => dispatch({ type: "focus", winId: win.id })}
    >
      <div
        className="ed-titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={() => (dragStart.current = null)}
        onDoubleClick={() => dispatch({ type: "toggleMax", winId: win.id })}
      >
        <span className="ed-title-icon">{icon}</span>
        <span className="ed-title">{title}</span>
        <button type="button" className="ed-tb-btn ed-max" aria-label="Розгорнути" onClick={() => dispatch({ type: "toggleMax", winId: win.id })}>
          ▢
        </button>
        <button type="button" className="ed-tb-btn ed-close" aria-label="Закрити" onClick={() => dispatch({ type: "close", winId: win.id })}>
          ✕
        </button>
      </div>
      {children}
    </section>
  )
}

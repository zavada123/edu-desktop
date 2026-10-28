import { useEffect, useRef, useState } from "react"
import type { AppKind, AppSpec } from "../scenarios/types.ts"
import type { Action, DesktopState } from "./store.ts"

/** What each program saves and how its window is called. */
export const APPS: Record<AppKind, { readonly title: string; readonly ext: string; readonly typeLabel: string; readonly fileName: string }> = {
  paint: { title: "Paint", ext: ".png", typeLabel: "PNG (*.png)", fileName: "Без назви" },
  text: { title: "Текстовий редактор", ext: ".docx", typeLabel: "Документ Word (*.docx)", fileName: "Документ" },
  browser: { title: "Браузер", ext: ".jpg", typeLabel: "Зображення JPEG (*.jpg)", fileName: "зображення" }
}

export const appTitle = (state: DesktopState, app: AppSpec): string => {
  const saved = state.savedAs === null ? undefined : state.fs.nodes[state.savedAs]
  const { title } = APPS[app.kind]
  if (app.kind === "browser") return title
  return `${saved ? saved.name : "Без назви"} – ${title}`
}

const COLORS = ["#1b2230", "#e11d48", "#f59e0b", "#16a34a", "#2563eb", "#facc15", "#ffffff"]
const CANVAS_W = 800
const CANVAS_H = 450

/** A small drawing area: enough to make a picture worth saving. */
const Paint = () => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(COLORS[1] ?? "#000")
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * CANVAS_W, y: ((e.clientY - rect.top) / rect.height) * CANVAS_H }
  }
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current?.getContext("2d")
    const from = last.current
    if (!ctx || !from) return
    const to = point(e)
    ctx.strokeStyle = color
    ctx.lineWidth = color === "#ffffff" ? 28 : 8
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    last.current = to
  }

  return (
    <div className="ed-paint">
      <div className="ed-paint-colors" role="toolbar" aria-label="Кольори">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={c === color ? "is-on" : ""}
            style={{ background: c }}
            aria-label={c === "#ffffff" ? "Гумка" : `Колір ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <canvas
        ref={canvas}
        width={CANVAS_W}
        height={CANVAS_H}
        aria-label="Полотно для малювання"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          last.current = point(e)
          draw(e)
        }}
        onPointerMove={draw}
        onPointerUp={() => (last.current = null)}
      />
    </div>
  )
}

const TextEditor = ({ text }: { readonly text: string }) => (
  <textarea key={text} className="ed-text-editor" aria-label="Текст документа" placeholder="Пиши тут…" defaultValue={text} />
)

/** Text shown after «Відкрити»: the trainer keeps no file contents, so a short stand-in names the file. */
const openedText = (state: DesktopState): string => {
  const node = state.savedAs === null ? undefined : state.fs.nodes[state.savedAs]
  return node?.opened ? `Це текст файлу «${node.name}». Тут можна його редагувати.` : ""
}

/** A search result page with one picture; its context menu has «Зберегти зображення як…» (4 клас, с. 20). */
const Browser = ({ query, onSave }: { readonly query: string; readonly onSave: () => void }) => {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  return (
    <div className="ed-browser" onPointerDown={() => setMenu(null)}>
      <div className="ed-browser-bar">🔎 {query}</div>
      <p className="ed-browser-hint">Клацни зображення правою кнопкою миші (на телефоні — натисни й потримай).</p>
      <figure
        className="ed-browser-picture"
        onContextMenu={(e) => {
          e.preventDefault()
          const box = e.currentTarget.getBoundingClientRect()
          setMenu({ x: e.clientX - box.left, y: e.clientY - box.top })
        }}
      >
        <svg viewBox="0 0 320 200" role="img" aria-label={query}>
          <rect width="320" height="200" fill="#bfe3ff" />
          <rect y="150" width="320" height="50" fill="#7cc36b" />
          <rect x="230" y="70" width="70" height="60" fill="#fff6e0" stroke="#8b5e34" strokeWidth="3" />
          <path d="M222 72l43-34 43 34z" fill="#c2410c" />
          {[50, 120, 180].map((x) => (
            <g key={x}>
              <rect x={x - 5} y="105" width="10" height="50" fill="#8b5e34" />
              <circle cx={x} cy="95" r="34" fill="#f8f4f6" />
              {[-16, 0, 14, -6, 10].map((dx, i) => (
                <circle key={dx} cx={x + dx} cy={84 + i * 6} r="4" fill="#be123c" />
              ))}
            </g>
          ))}
        </svg>
        {menu && (
          <ul className="ed-menu ed-browser-menu" role="menu" style={{ left: menu.x, top: menu.y }} onPointerDown={(e) => e.stopPropagation()}>
            <li role="none">
              <button type="button" role="menuitem" onClick={() => (setMenu(null), onSave())}>
                Зберегти зображення як…
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={() => setMenu(null)}>
                Копіювати зображення
              </button>
            </li>
          </ul>
        )}
      </figure>
    </div>
  )
}

/** The program window's content: the «Файл» menu (Зберегти, Зберегти як) and the program itself. */
export const AppContent = ({ app, state, dispatch }: { readonly app: AppSpec; readonly state: DesktopState; readonly dispatch: (a: Action) => void }) => {
  const [fileMenu, setFileMenu] = useState(false)
  const saveAs = () => {
    setFileMenu(false)
    dispatch({ type: "fileDialog", dialog: "save" })
  }
  const save = () => {
    setFileMenu(false)
    if (state.savedAs !== null && state.fs.nodes[state.savedAs]) dispatch({ type: "notify", message: "Збережено." })
    else dispatch({ type: "fileDialog", dialog: "save" })
  }
  const openFile = () => {
    setFileMenu(false)
    dispatch({ type: "fileDialog", dialog: "open" })
  }
  if (app.kind === "browser") return <Browser query={app.fileName ?? "зображення"} onSave={saveAs} />
  return (
    <div className="ed-app">
      <div className="ed-app-menubar">
        <button type="button" aria-expanded={fileMenu} onClick={() => setFileMenu((v) => !v)}>
          Файл
        </button>
        {fileMenu && (
          <ul className="ed-menu ed-app-filemenu" role="menu">
            <li role="none">
              <button type="button" role="menuitem" onClick={openFile}>
                📂 Відкрити…
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={save}>
                💾 Зберегти
              </button>
            </li>
            <li role="none">
              <button type="button" role="menuitem" onClick={saveAs}>
                Зберегти як…
              </button>
            </li>
          </ul>
        )}
      </div>
      {app.kind === "paint" ? <Paint /> : <TextEditor text={openedText(state)} />}
    </div>
  )
}

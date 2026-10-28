import { useEffect, useRef } from "react"
import { displayName, getNode } from "../core/fs.ts"
import { plural } from "../core/names.ts"
import { NodeIcon } from "./icons.tsx"
import type { Action, Confirm, DesktopState } from "./store.ts"

const questionOf = (state: DesktopState, confirm: Confirm): { readonly title: string; readonly text: string } => {
  if (confirm.kind === "emptyBin") return { title: "Очистити кошик", text: "Видалити всі об'єкти з кошика назавжди? Відновити їх буде неможливо." }
  const first = getNode(state.fs, confirm.ids[0] ?? "")
  const n = confirm.ids.length
  const what = n === 1 && first ? `«${displayName(first)}»` : `ці ${n} ${plural(n, "об'єкт", "об'єкти", "об'єктів")}`
  return confirm.kind === "delete"
    ? { title: "Видалення", text: `Перемістити ${what} у кошик?` }
    : { title: "Видалення назавжди", text: `Видалити ${what} назавжди? Відновити буде неможливо.` }
}

/** «Ви дійсно хочете…?» window, like the one the textbook asks to confirm (4 клас, с. 48). */
export const ConfirmDialog = ({ state, confirm, dispatch }: { readonly state: DesktopState; readonly confirm: Confirm; readonly dispatch: (a: Action) => void }) => {
  const yes = useRef<HTMLButtonElement>(null)
  useEffect(() => yes.current?.focus(), [])
  const { title, text } = questionOf(state, confirm)
  return (
    <div className="ed-modal-backdrop">
      <div
        className="ed-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ed-dialog-title"
        onKeyDown={(e) => e.key === "Escape" && dispatch({ type: "cancelConfirm" })}
      >
        <div className="ed-titlebar">
          <span id="ed-dialog-title" className="ed-title">
            {title}
          </span>
        </div>
        <div className="ed-dialog-body">
          <NodeIcon kind="bin" size={40} />
          <p>{text}</p>
        </div>
        <div className="ed-dialog-actions">
          <button ref={yes} type="button" className="ed-yes" onClick={() => dispatch({ type: "confirm" })}>
            Так
          </button>
          <button type="button" onClick={() => dispatch({ type: "cancelConfirm" })}>
            Ні
          </button>
        </div>
      </div>
    </div>
  )
}

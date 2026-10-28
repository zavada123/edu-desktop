import { allMet } from "../core/goals.ts"
import type { Scenario } from "../scenarios/types.ts"
import type { Action, DesktopState } from "./store.ts"

interface Props {
  readonly scenario: Scenario
  readonly state: DesktopState
  readonly open: boolean
  readonly onToggle: () => void
  readonly onReset: () => void
  readonly dispatch: (action: Action) => void
}

/** The task card: what to do, the "Перевірити" button and the result of each condition. */
export const TaskPanel = ({ scenario, state, open, onToggle, onReset, dispatch }: Props) => {
  const results = state.results
  const solved = results !== null && allMet(results)
  return (
    <aside className={`ed-task ${open ? "is-open" : ""}`} aria-label="Завдання">
      <header className="ed-task-head">
        <span className="ed-grade">{scenario.grade} клас</span>
        <h2>{scenario.title}</h2>
        <button type="button" className="ed-task-hide" aria-label="Сховати завдання" onClick={onToggle}>
          ✕
        </button>
      </header>
      <ol className="ed-task-steps">
        {scenario.task.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="ed-task-actions">
        <button type="button" className="ed-check" onClick={() => dispatch({ type: "check", goals: scenario.goals })}>
          Перевірити
        </button>
        <button type="button" className="ed-reset" onClick={onReset}>
          Почати спочатку
        </button>
      </div>
      {results !== null && (
        <div className={`ed-results ${solved ? "is-solved" : ""}`} role="status">
          <p className="ed-results-head">{solved ? "🎉 Молодець! Усе виконано." : `Виконано ${results.filter((r) => r.ok).length} з ${results.length}`}</p>
          <ul>
            {results.map((r) => (
              <li key={r.text} className={r.ok ? "is-ok" : "is-bad"}>
                <span aria-hidden="true">{r.ok ? "✅" : "❌"}</span> {r.text}
                {!r.ok && <small>{r.hint}</small>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}

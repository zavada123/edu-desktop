import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { scenarios } from "../scenarios/index.ts"
import { EduDesktop } from "../ui/EduDesktop.tsx"
import "./demo.css"

const firstScenario = scenarios[0]
if (!firstScenario) throw new Error("Немає жодного сценарію")

/** Demo page: pick a scenario and try the trainer. */
const Demo = () => {
  const [id, setId] = useState(firstScenario.id)
  const scenario = scenarios.find((s) => s.id === id) ?? firstScenario
  return (
    <div className="demo">
      <header className="demo-head">
        <strong>Тренажер «Робочий стіл»</strong>
        <label>
          <span className="demo-visually-hidden">Завдання</span>
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.grade} клас · {s.title}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="demo-main">
        <EduDesktop key={scenario.id} scenario={scenario} />
      </main>
    </div>
  )
}

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Немає #root")
createRoot(rootEl).render(
  <StrictMode>
    <Demo />
  </StrictMode>
)

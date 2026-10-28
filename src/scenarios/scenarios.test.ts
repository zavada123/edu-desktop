import { describe, expect, test } from "vitest"
import { copy, create, DESKTOP_ID, findByPath, type FsResult, type FsState, move, remove, rename } from "../core/fs.ts"
import { allMet, checkGoals } from "../core/goals.ts"
import { buildState } from "../core/tree.ts"
import { scenarios } from "./index.ts"

describe("scenarios", () => {
  test.each(scenarios.map((s) => [s.id, s] as const))("%s builds and is not solved at the start", (_id, scenario) => {
    const state = buildState(scenario.start)
    expect(allMet(checkGoals(state, scenario.goals))).toBe(false)
  })

  test("ids are unique", () => {
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length)
  })
})

describe("g4-context-menu", () => {
  test("can be solved with the textbook steps", () => {
    const scenario = scenarios.find((s) => s.id === "g4-context-menu")
    if (!scenario) throw new Error("немає сценарію")
    const step = (result: FsResult): FsState => {
      if (!result.ok) throw new Error(result.error)
      return result.state
    }
    const at = (state: FsState, path: string): string => {
      const node = findByPath(state, path)
      if (!node) throw new Error(`немає ${path}`)
      return node.id
    }
    let s = buildState(scenario.start)
    s = step(create(s, DESKTOP_ID, "folder", "Моя папка"))
    s = step(create(s, at(s, "Моя папка"), "folder", "Інформатика"))
    for (const name of ["Тексти", "Картинки", "Фото"]) s = step(create(s, at(s, "Моя папка/Інформатика"), "folder", name))
    s = step(remove(s, at(s, "Моя папка/Інформатика/Фото")))
    s = step(rename(s, at(s, "Моя папка/Інформатика/Картинки"), "Малюнки"))
    s = step(copy(s, at(s, "Документи/сонце.png"), at(s, "Моя папка/Інформатика/Малюнки")))
    s = step(copy(s, at(s, "Документи/казка.txt"), at(s, "Моя папка/Інформатика/Тексти")))
    s = step(copy(s, at(s, "Документи/вірш.txt"), at(s, "Моя папка/Інформатика/Тексти")))
    s = step(move(s, at(s, "Моя папка/Інформатика/Тексти/вірш.txt"), at(s, "Моя папка/Інформатика/Малюнки")))
    expect(checkGoals(s, scenario.goals).filter((r) => !r.ok)).toEqual([])
  })
})

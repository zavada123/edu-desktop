import { describe, expect, test } from "vitest"
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

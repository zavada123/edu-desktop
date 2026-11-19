import { describe, expect, test } from "vitest"
import { scenarios } from "../scenarios/index.ts"
import { BIN_ID, DESKTOP_ID, findByPath, type FsState } from "./fs.ts"
import { applyOp, type Op } from "./ops.ts"
import { buildState, toTreeSpec } from "./tree.ts"

const apply = (state: FsState, ...ops: ReadonlyArray<Op>): FsState =>
  ops.reduce((acc, op) => {
    const result = applyOp(acc, op)
    if (!result.ok) throw new Error(result.error)
    return result.state
  }, state)

const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}

describe("toTreeSpec", () => {
  test.each(scenarios.map((s) => [s.id, s] as const))("the start of %s comes back unchanged", (_, scenario) => {
    const spec = toTreeSpec(buildState(scenario.start, scenario.drives))
    expect(spec.desktop).toEqual(scenario.start)
    expect(spec.drives["D:"]).toEqual(scenario.drives?.["D:"] ?? {})
    expect(toTreeSpec(buildState(spec.desktop, spec.drives))).toEqual(spec)
  })

  test("keeps folders, files, ZIP folders and shortcuts the author made in the trainer", () => {
    const start = buildState({ "кіт.png": null }, { "D:": { Ігри: {} } })
    const state = apply(
      start,
      { op: "create", parentId: DESKTOP_ID, kind: "folder", name: "Тварини" },
      { op: "move", id: idOf(start, "кіт.png"), targetId: "n3" },
      { op: "shortcut", id: idOf(start, "D:/Ігри"), parentId: DESKTOP_ID },
      { op: "compress", ids: ["n3"], name: "Тварини" }
    )
    expect(toTreeSpec(state)).toEqual({
      desktop: { Тварини: { "кіт.png": null }, "Тварини.zip": { Тварини: { "кіт.png": null } }, "Ігри – ярлик": "D:/Ігри" },
      drives: { "C:": {}, "D:": { Ігри: {} } }
    })
  })

  test("leaves out the bin and shortcuts to deleted objects", () => {
    const start = buildState({ Чернетки: {}, "Чернетки – ярлик": "Чернетки", "a.txt": null })
    const state = apply(start, { op: "remove", id: idOf(start, "Чернетки") })
    expect(Object.keys(state.nodes).some((id) => state.nodes[id]?.parentId === BIN_ID)).toBe(true)
    expect(toTreeSpec(state).desktop).toEqual({ "a.txt": null })
  })
})

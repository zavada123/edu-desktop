import { describe, expect, test } from "vitest"
import { DESKTOP_ID, findByPath, type FsResult, type FsState, move, remove } from "./fs.ts"
import { allMet, checkGoals, describeGoal, type Goal } from "./goals.ts"
import { buildState } from "./tree.ts"

const ok = (result: FsResult): FsState => {
  if (!result.ok) throw new Error(result.error)
  return result.state
}
const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}

const start = buildState({ Тварини: {}, "кіт.jpg": null, "собака.jpg": null, "чернетка.txt": null })

const goals: ReadonlyArray<Goal> = [
  { type: "exists", path: "Тварини/кіт.jpg", kind: "file" },
  { type: "count", folder: "Тварини", ext: "jpg", equals: 2 },
  { type: "absent", path: "кіт.jpg" },
  { type: "inBin", name: "чернетка.txt" }
]

describe("checkGoals", () => {
  test("reports every unmet goal at the start", () => {
    const results = checkGoals(start, goals)
    expect(results.map((r) => r.ok)).toEqual([false, false, false, false])
    expect(allMet(results)).toBe(false)
  })

  test("passes when the student did everything", () => {
    const animals = idOf(start, "Тварини")
    const moved = ok(move(ok(move(start, idOf(start, "кіт.jpg"), animals)), idOf(start, "собака.jpg"), animals))
    const done = ok(remove(moved, idOf(moved, "чернетка.txt")))
    expect(allMet(checkGoals(done, goals))).toBe(true)
  })

  test("a folder does not satisfy a goal that expects a file", () => {
    const results = checkGoals(start, [{ type: "exists", path: "Тварини", kind: "file" }])
    expect(results[0]?.ok).toBe(false)
  })

  test("count of a missing folder is not met", () => {
    expect(checkGoals(start, [{ type: "count", folder: "Немає", equals: 0 }])[0]?.ok).toBe(false)
    expect(checkGoals(start, [{ type: "count", folder: "", kind: "folder", equals: 1 }])[0]?.ok).toBe(true)
  })

  test("count on the desktop uses an empty folder path", () => {
    const results = checkGoals(start, [{ type: "count", folder: "", ext: "jpg", equals: 2 }])
    expect(results[0]?.ok).toBe(true)
    expect(DESKTOP_ID).toBe("desktop")
  })
})

describe("describeGoal", () => {
  test("writes readable Ukrainian text", () => {
    expect(describeGoal({ type: "exists", path: "Мої фото/Ліс", kind: "folder" })).toBe("У папці «Мої фото» є папка «Ліс»")
    expect(describeGoal({ type: "exists", path: "Тварини", kind: "folder" })).toBe("На робочому столі є папка «Тварини»")
    expect(describeGoal({ type: "count", folder: "Тварини", ext: "jpg", equals: 2 })).toBe("У папці «Тварини» 2 файли .jpg")
    expect(describeGoal({ type: "absent", path: "x", text: "Свій текст" })).toBe("Свій текст")
  })
})

describe("goals on drives", () => {
  test("checks a path on drive D: and names it like the textbook", () => {
    const state = buildState({}, { "D:": { "Мої уроки": { "задачі.docx": null } } })
    expect(checkGoals(state, [{ type: "exists", path: "D:/Мої уроки/задачі.docx" }])[0]?.ok).toBe(true)
    expect(describeGoal({ type: "exists", path: "D:/Мої уроки/задачі.docx", kind: "file" })).toBe("У папці «D:\\Мої уроки» є файл «задачі.docx»")
    expect(describeGoal({ type: "exists", path: "D:/Мої уроки", kind: "folder" })).toBe("На диску D: є папка «Мої уроки»")
  })
})

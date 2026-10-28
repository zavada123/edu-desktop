import { describe, expect, test } from "vitest"
import { BIN_ID, childrenOf, DESKTOP_ID, driveId, findByPath, type FsState } from "../core/fs.ts"
import { buildState } from "../core/tree.ts"
import { type Action, type DesktopState, initialState, reducer } from "./store.ts"

const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}
const run = (state: DesktopState, ...actions: ReadonlyArray<Action>): DesktopState => actions.reduce(reducer, state)

const start = initialState(buildState({ Тварини: {}, "кіт.png": null, "собака.png": null, Документи: { "лист.txt": null } }))
const cat = idOf(start.fs, "кіт.png")
const dog = idOf(start.fs, "собака.png")
const letter = idOf(start.fs, "Документи/лист.txt")

describe("selection", () => {
  test("Ctrl+click adds and removes items, a plain click selects one", () => {
    const two = run(start, { type: "select", nodeId: cat, additive: false }, { type: "select", nodeId: dog, additive: true })
    expect(two.selected).toEqual([cat, dog])
    expect(run(two, { type: "select", nodeId: cat, additive: true }).selected).toEqual([dog])
    expect(run(two, { type: "select", nodeId: cat, additive: false }).selected).toEqual([cat])
  })

  test("«Вибрати кілька» makes every tap additive", () => {
    const state = run(start, { type: "toggleMulti" }, { type: "select", nodeId: cat, additive: false }, { type: "select", nodeId: dog, additive: false })
    expect(state.selected).toEqual([cat, dog])
  })

  test("items from another folder start a new selection", () => {
    const state = run(start, { type: "select", nodeId: cat, additive: false }, { type: "select", nodeId: letter, additive: true })
    expect(state.selected).toEqual([letter])
  })
})

describe("delete with confirmation", () => {
  test("asks first and deletes only after «Так»", () => {
    const asked = run(start, { type: "askDelete", ids: [cat, dog] })
    expect(asked.confirm).toEqual({ kind: "delete", ids: [cat, dog] })
    expect(findByPath(asked.fs, "кіт.png")).toBeDefined()
    const done = run(asked, { type: "confirm" })
    expect(childrenOf(done.fs, BIN_ID).map((n) => n.name)).toEqual(["кіт.png", "собака.png"])
    expect(done.confirm).toBeNull()
  })

  test("«Ні» keeps everything", () => {
    const state = run(start, { type: "askDelete", ids: [cat] }, { type: "cancelConfirm" })
    expect(findByPath(state.fs, "кіт.png")).toBeDefined()
    expect(state.confirm).toBeNull()
  })

  test("items in the bin are deleted forever after confirmation", () => {
    const inBin = run(start, { type: "askDelete", ids: [cat] }, { type: "confirm" })
    const asked = run(inBin, { type: "askDelete", ids: [cat] })
    expect(asked.confirm?.kind).toBe("deleteForever")
    expect(run(asked, { type: "confirm" }).fs.nodes[cat]).toBeUndefined()
  })
})

describe("drag several items", () => {
  test("moves every selected item into the folder", () => {
    const state = run(start, { type: "drop", ids: [cat, dog], targetId: idOf(start.fs, "Тварини"), copy: false })
    expect(findByPath(state.fs, "Тварини/кіт.png")).toBeDefined()
    expect(findByPath(state.fs, "Тварини/собака.png")).toBeDefined()
  })

  test("an error leaves the desktop unchanged", () => {
    const withCopy = run(start, { type: "drop", ids: [cat], targetId: idOf(start.fs, "Тварини"), copy: true })
    const state = run(withCopy, { type: "drop", ids: [dog, cat], targetId: idOf(start.fs, "Тварини"), copy: false })
    expect(state.message).not.toBeNull()
    expect(findByPath(state.fs, "собака.png")).toBeDefined()
  })
})

describe("windows on the taskbar", () => {
  test("«Згорнути» hides a window; its taskbar button brings it back, a second press hides it again", () => {
    const opened = run(start, { type: "open", nodeId: idOf(start.fs, "Документи") })
    const winId = opened.windows[0]?.id ?? 0
    const hidden = run(opened, { type: "minimize", winId })
    expect(hidden.windows[0]?.minimized).toBe(true)
    const back = run(hidden, { type: "taskbar", winId })
    expect(back.windows[0]?.minimized).toBe(false)
    expect(run(back, { type: "taskbar", winId }).windows[0]?.minimized).toBe(true)
  })
})

describe("shortcuts", () => {
  test("«Надіслати → Робочий стіл» puts a shortcut on the desktop, «Створити ярлик» next to the item", () => {
    const sent = run(start, { type: "shortcut", ids: [letter], targetId: DESKTOP_ID })
    expect(findByPath(sent.fs, "лист.txt – ярлик")?.target).toBe(letter)
    const beside = run(start, { type: "shortcut", ids: [letter], targetId: null })
    expect(findByPath(beside.fs, "Документи/лист.txt – ярлик")?.target).toBe(letter)
  })

  test("a shortcut to a drive goes to the desktop", () => {
    const state = run(start, { type: "shortcut", ids: [driveId("D")], targetId: null })
    expect(findByPath(state.fs, "Локальний диск (D:) – ярлик")?.target).toBe(driveId("D"))
  })
})

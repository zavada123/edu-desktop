import { describe, expect, test } from "vitest"
import { DESKTOP_ID, findByPath, type FsState } from "../core/fs.ts"
import { buildState } from "../core/tree.ts"
import { commandForKey, type KeyPress } from "./keys.ts"
import { type Action, type DesktopState, initialState, reducer } from "./store.ts"

const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}
const run = (state: DesktopState, ...actions: ReadonlyArray<Action>): DesktopState => actions.reduce(reducer, state)
const ctrl = (code: string): KeyPress => ({ key: code.slice(3).toLowerCase(), code, ctrl: true })
const plain = (key: string): KeyPress => ({ key, code: key, ctrl: false })

const start = initialState(buildState({ Тварини: {}, "кіт.png": null, "собака.png": null }))
const animals = idOf(start.fs, "Тварини")
const cat = idOf(start.fs, "кіт.png")
const dog = idOf(start.fs, "собака.png")
const withCat = run(start, { type: "select", nodeId: cat, additive: false })

describe("Windows shortcuts", () => {
  test("Ctrl+C and Ctrl+V copy the selection into the folder", () => {
    const copy = commandForKey(withCat, ctrl("KeyC"), DESKTOP_ID)
    expect(copy).toEqual({ type: "clip", mode: "copy", ids: [cat] })
    const copied = run(withCat, copy as Action)
    const paste = commandForKey(copied, ctrl("KeyV"), animals)
    expect(paste).toEqual({ type: "paste", targetId: animals })
    expect(findByPath(run(copied, paste as Action).fs, "Тварини/кіт.png")).toBeDefined()
  })

  test("Ctrl+C works on the Ukrainian layout, where the key gives «с»", () => {
    expect(commandForKey(withCat, { key: "с", code: "KeyC", ctrl: true }, DESKTOP_ID)).toEqual({ type: "clip", mode: "copy", ids: [cat] })
  })

  test("Ctrl+X cuts, Ctrl+V without a clipboard does nothing", () => {
    expect(commandForKey(withCat, ctrl("KeyX"), DESKTOP_ID)).toEqual({ type: "clip", mode: "cut", ids: [cat] })
    expect(commandForKey(withCat, ctrl("KeyV"), DESKTOP_ID)).toBeNull()
  })

  test("Ctrl+A selects every item of the folder", () => {
    const command = commandForKey(start, ctrl("KeyA"), DESKTOP_ID)
    expect(run(start, command as Action).selected).toEqual([animals, cat, dog])
  })

  test("Delete asks before moving to the bin", () => {
    const command = commandForKey(withCat, plain("Delete"), DESKTOP_ID)
    expect(run(withCat, command as Action).confirm).toEqual({ kind: "delete", ids: [cat] })
    expect(commandForKey(start, plain("Delete"), DESKTOP_ID)).toBeNull()
  })

  test("F2 renames one item, not several", () => {
    expect(commandForKey(withCat, plain("F2"), DESKTOP_ID)).toEqual({ type: "startRename", nodeId: cat })
    const two = run(withCat, { type: "select", nodeId: dog, additive: true })
    expect(commandForKey(two, plain("F2"), DESKTOP_ID)).toBeNull()
  })

  test("Enter opens the selected item, Backspace goes back in the window", () => {
    expect(commandForKey(withCat, plain("Enter"), DESKTOP_ID)).toEqual({ type: "openItem", nodeId: cat })
    const opened = run(start, { type: "open", nodeId: animals })
    const winId = opened.windows[0]?.id ?? 0
    expect(commandForKey(opened, plain("Backspace"), animals)).toEqual({ type: "back", winId })
    expect(commandForKey(start, plain("Backspace"), DESKTOP_ID)).toBeNull()
  })

  test("Escape closes the menu first, then clears the selection; other keys are left to the browser", () => {
    const withMenu = run(withCat, { type: "menu", menu: { x: 0, y: 0, containerId: DESKTOP_ID, targetId: cat } })
    expect(commandForKey(withMenu, plain("Escape"), DESKTOP_ID)).toEqual({ type: "menu", menu: null })
    expect(commandForKey(withCat, plain("Escape"), DESKTOP_ID)).toEqual({ type: "select", nodeId: null, additive: false })
    expect(commandForKey(withCat, plain("a"), DESKTOP_ID)).toBeNull()
  })
})

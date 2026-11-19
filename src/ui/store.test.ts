import { describe, expect, test } from "vitest"
import { BIN_ID, childrenOf, DESKTOP_ID, driveId, findByPath, type FsState } from "../core/fs.ts"
import { buildState } from "../core/tree.ts"
import { type Action, APP_ID, type DesktopState, initialState, listingOf, reducer } from "./store.ts"

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

describe("program and «Зберегти як»", () => {
  test("the program window opens at the start and survives file changes", () => {
    const state = initialState(start.fs, true)
    expect(state.windows.map((w) => w.nodeId)).toEqual([APP_ID])
    expect(run(state, { type: "create", containerId: DESKTOP_ID, kind: "folder" }).windows).toHaveLength(1)
  })

  test("saving closes the dialog and remembers the file; an existing name keeps it open", () => {
    const asked = run(initialState(start.fs, true), { type: "fileDialog", dialog: "save" })
    const saved = run(asked, { type: "saveFile", folderId: idOf(start.fs, "Тварини"), name: "Україна", ext: ".png" })
    expect(saved.fileDialog).toBeNull()
    expect(saved.savedAs).toBe(idOf(saved.fs, "Тварини/Україна.png"))
    const twice = run(saved, { type: "fileDialog", dialog: "save" }, { type: "saveFile", folderId: idOf(start.fs, "Тварини"), name: "Україна", ext: ".png" })
    expect(twice.fileDialog).toBe("save")
    expect(twice.message).toContain("уже є")
  })
})

describe("Shift+click and ZIP", () => {
  test("Shift+click selects the range in folder order", () => {
    // Desktop order: folders first (Документи, Тварини), then files (кіт.png, собака.png).
    const state = run(start, { type: "select", nodeId: idOf(start.fs, "Тварини"), additive: false }, { type: "select", nodeId: dog, additive: false, range: true })
    expect(state.selected).toEqual([idOf(start.fs, "Тварини"), cat, dog])
  })

  test("«Стиснута ZIP-папка» is named after the clicked item and starts renaming", () => {
    const state = run(start, { type: "compress", ids: [cat, dog] })
    const zip = findByPath(state.fs, "кіт.zip")
    expect(zip?.zip).toBe(true)
    expect(state.renaming).toBe(zip?.id)
  })
})

describe("«Відкрити» and the drop menu", () => {
  test("opening a file marks it and closes the dialog", () => {
    const state = run(initialState(start.fs, true), { type: "fileDialog", dialog: "open" }, { type: "openFile", nodeId: letter })
    expect(state.fileDialog).toBeNull()
    expect(state.savedAs).toBe(letter)
    expect(state.fs.nodes[letter]?.opened).toBe(true)
  })

  test("«Створити ярлики» from the drop menu puts shortcuts into the target folder", () => {
    const state = run(start, { type: "shortcut", ids: [cat, dog], targetId: idOf(start.fs, "Тварини") })
    expect(childrenOf(state.fs, idOf(start.fs, "Тварини")).map((n) => n.name)).toEqual(["кіт.png – ярлик", "собака.png – ярлик"])
  })
})

describe("«Властивості»", () => {
  test("opens for an item, applies the attributes once and logs the change", () => {
    const opened = run(start, { type: "properties", nodeId: cat })
    expect(opened.properties).toBe(cat)
    const applied = run(opened, { type: "attributes", nodeId: cat, readOnly: true, hidden: false }, { type: "attributes", nodeId: cat, readOnly: true, hidden: false })
    expect(applied.fs.nodes[cat]?.readOnly).toBe(true)
    expect(applied.ops).toEqual([{ op: "attributes", id: cat, readOnly: true, hidden: false }])
    expect(run(applied, { type: "properties", nodeId: null }).properties).toBeNull()
  })

  test("closes when its item is deleted for good", () => {
    const state = run(start, { type: "askDelete", ids: [cat] }, { type: "confirm" }, { type: "properties", nodeId: cat }, { type: "askEmptyBin" }, { type: "confirm" })
    expect(state.properties).toBeNull()
  })

  test("items the student makes get their own time", () => {
    const before = Date.now()
    const state = run(start, { type: "create", containerId: DESKTOP_ID, kind: "folder" })
    const made = idOf(state.fs, "Нова папка")
    expect(state.born[made]).toBeGreaterThanOrEqual(before)
    expect(state.born[cat]).toBeUndefined()
  })
})

describe("Ctrl+Z", () => {
  test("cancels the last action as a whole and drops it from the log", () => {
    const deleted = run(start, { type: "askDelete", ids: [cat, dog] }, { type: "confirm" })
    expect(deleted.ops).toHaveLength(2)
    const back = run(deleted, { type: "undo" })
    expect(back.ops).toEqual([])
    expect(back.fs).toEqual(start.fs)
  })

  test("goes back one action at a time and says when there is nothing left", () => {
    const state = run(start, { type: "create", containerId: DESKTOP_ID, kind: "folder" }, { type: "drop", ids: [cat], targetId: idOf(start.fs, "Тварини"), copy: false })
    const once = run(state, { type: "undo" })
    expect(idOf(once.fs, "кіт.png")).toBe(cat)
    expect(findByPath(once.fs, "Нова папка")).toBeDefined()
    const twice = run(once, { type: "undo" })
    expect(findByPath(twice.fs, "Нова папка")).toBeUndefined()
    expect(run(twice, { type: "undo" }).message).toBe("Немає дії, яку можна скасувати")
  })

  test("deleting for good cannot be undone", () => {
    const state = run(start, { type: "askDelete", ids: [cat] }, { type: "confirm" }, { type: "askEmptyBin" }, { type: "confirm" })
    expect(run(state, { type: "undo" }).message).toBe("Видалене назавжди повернути не можна")
  })
})

describe("«Вигляд» and search", () => {
  test("hidden items are left out until «Приховані елементи» is on", () => {
    const hidden = run(start, { type: "attributes", nodeId: cat, readOnly: false, hidden: true })
    expect(listingOf(hidden, DESKTOP_ID).map((n) => n.id)).not.toContain(cat)
    expect(listingOf(run(hidden, { type: "view", change: { showHidden: true } }), DESKTOP_ID).map((n) => n.id)).toContain(cat)
  })

  test("Ctrl+A in a window with search selects the results from every subfolder", () => {
    const opened = run(start, { type: "open", nodeId: DESKTOP_ID })
    const win = opened.windows[0]
    if (!win) throw new Error("немає вікна")
    const searched = run(opened, { type: "search", winId: win.id, text: "*.txt" }, { type: "selectAll", containerId: DESKTOP_ID })
    expect(searched.selected).toEqual([letter])
  })

  test("Ctrl+click keeps items from different folders when they are shown together", () => {
    const state = run(start, { type: "select", nodeId: cat, additive: false }, { type: "select", nodeId: letter, additive: true, scope: [cat, letter] })
    expect(state.selected).toEqual([cat, letter])
  })

  test("going to another folder clears the search", () => {
    const opened = run(start, { type: "open", nodeId: idOf(start.fs, "Документи") })
    const win = opened.windows[0]
    if (!win) throw new Error("немає вікна")
    const moved = run(opened, { type: "search", winId: win.id, text: "лист" }, { type: "up", winId: win.id })
    expect(moved.windows[0]?.search).toBe("")
  })
})

describe("window size", () => {
  const opened = run(start, { type: "open", nodeId: idOf(start.fs, "Документи") })
  const winId = opened.windows[0]?.id ?? -1

  test("dragging an edge stores the new position and size", () => {
    const win = run(opened, { type: "resizeWin", winId, x: 10, y: 20, width: 700, height: 500 }).windows[0]
    expect(win).toMatchObject({ x: 10, y: 20, width: 700, height: 500 })
  })

  test("the window keeps a minimum size", () => {
    const win = run(opened, { type: "resizeWin", winId, x: 0, y: 0, width: 10, height: 10 }).windows[0]
    expect(win).toMatchObject({ width: 320, height: 200 })
  })

  test("a maximised window is not resized, and restoring brings back its own size", () => {
    const sized = run(opened, { type: "resizeWin", winId, x: 10, y: 20, width: 700, height: 500 })
    const max = run(sized, { type: "toggleMax", winId }, { type: "resizeWin", winId, x: 0, y: 0, width: 400, height: 300 })
    expect(max.windows[0]).toMatchObject({ maximized: true, width: 700, height: 500 })
    expect(run(max, { type: "toggleMax", winId }).windows[0]).toMatchObject({ maximized: false, x: 10, y: 20, width: 700, height: 500 })
  })
})

import { describe, expect, test } from "vitest"
import { type Action, type DesktopState, initialState, reducer } from "../ui/store.ts"
import { BIN_ID, DESKTOP_ID, findByPath, type FsState } from "./fs.ts"
import { applyOp, grade, MAX_CREATED, MAX_NODES, MAX_OPS, type Op, replay } from "./ops.ts"
import { buildState } from "./tree.ts"

const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}

const task = {
  start: { "кіт.png": null, "собака.png": null, Документи: { "лист.txt": null } },
  goals: [
    { type: "exists", path: "Тварини/кіт.png", kind: "file" },
    { type: "exists", path: "Тварини/собака.png", kind: "file" },
    { type: "inBin", name: "лист.txt" }
  ]
} as const

const start = buildState(task.start)
const cat = idOf(start, "кіт.png")
const dog = idOf(start, "собака.png")
const letter = idOf(start, "Документи/лист.txt")

describe("replay", () => {
  test("an empty log gives the start tree", () => {
    expect(replay(start, [])).toEqual({ ok: true, state: start })
  })

  test("an impossible change makes the log invalid and names its place", () => {
    const ops: ReadonlyArray<Op> = [
      { op: "create", parentId: DESKTOP_ID, kind: "folder", name: "Тварини" },
      { op: "rename", id: "немає-такого", name: "x" }
    ]
    expect(replay(start, ops)).toMatchObject({ ok: false, index: 1 })
  })

  test("a log longer than the limit is refused", () => {
    const ops: ReadonlyArray<Op> = Array.from({ length: MAX_OPS + 1 }, () => ({ op: "emptyBin" }))
    expect(replay(start, ops)).toMatchObject({ ok: false, index: -1 })
  })

  test("copies that double the tree stop at the node limit", () => {
    // Copy the folder next to itself, then move the copy inside: every three changes double the tree.
    const box = buildState({ Коробка: { "a.txt": null } })
    const boxId = idOf(box, "Коробка")
    const ops: Op[] = []
    let state = box
    for (let i = 0; i < 10; i++) {
      const copied = applyOp(state, { op: "copy", id: boxId, targetId: DESKTOP_ID })
      if (!copied.ok) throw new Error(copied.error)
      const step: ReadonlyArray<Op> = [
        { op: "rename", id: copied.id, name: `Копія ${i}` },
        { op: "move", id: copied.id, targetId: boxId }
      ]
      ops.push({ op: "copy", id: boxId, targetId: DESKTOP_ID }, ...step)
      state = step.reduce((acc, op) => {
        const done = applyOp(acc, op)
        if (!done.ok) throw new Error(done.error)
        return done.state
      }, copied.state)
    }
    const result = replay(box, ops)
    expect(result.ok).toBe(false)
    expect(!result.ok && result.error).toContain(String(MAX_NODES))
  })

  test("copying and deleting in a loop stops at the limit of new items", () => {
    // Each round copies 31 items and deletes them for good, so the tree stays small.
    const files = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`${i}.txt`, null]))
    const box = buildState({ Коробка: files, Інша: {} })
    const from = idOf(box, "Коробка")
    const to = idOf(box, "Інша")
    const ops: Op[] = []
    for (let i = 0; i < 300; i++) {
      const copyId = `n${box.nextId + i * 31}`
      ops.push({ op: "copy", id: from, targetId: to }, { op: "remove", id: copyId }, { op: "deleteForever", id: copyId })
    }
    const result = replay(box, ops)
    expect(!result.ok && result.error).toContain(String(MAX_CREATED))
  })
})

describe("grade", () => {
  test("a correct log solves the task", () => {
    const ops: ReadonlyArray<Op> = [
      { op: "create", parentId: DESKTOP_ID, kind: "folder", name: "Тварини" },
      { op: "move", id: cat, targetId: "n5" },
      { op: "move", id: dog, targetId: "n5" },
      { op: "remove", id: letter }
    ]
    const result = grade(task, ops)
    expect(result.ok && result.solved).toBe(true)
  })

  test("a partial log reports each goal", () => {
    const result = grade(task, [{ op: "remove", id: letter }])
    expect(result.ok && result.results.map((r) => r.ok)).toEqual([false, false, true])
  })
})

describe("the trainer records what replay needs", () => {
  const act = (state: DesktopState, ...actions: ReadonlyArray<Action>): DesktopState => actions.reduce(reducer, state)

  test("after any mix of actions the log rebuilds the same tree", () => {
    const begin = initialState(start)
    const made = act(begin, { type: "create", containerId: DESKTOP_ID, kind: "folder" })
    const folder = made.renaming ?? ""
    const end = act(
      made,
      { type: "commitRename", nodeId: folder, name: "Тварини" },
      { type: "drop", ids: [cat, dog], targetId: folder, copy: false },
      { type: "clip", mode: "copy", ids: [letter] },
      { type: "paste", targetId: DESKTOP_ID },
      { type: "askDelete", ids: [letter] },
      { type: "confirm" },
      { type: "restore", ids: [letter] },
      { type: "shortcut", ids: [folder], targetId: null },
      { type: "compress", ids: [folder] },
      { type: "askDelete", ids: [idOf(start, "Документи")] },
      { type: "confirm" },
      { type: "askEmptyBin" },
      { type: "confirm" }
    )
    expect(childrenOfBin(end.fs)).toBe(0)
    expect(replay(start, end.ops)).toEqual({ ok: true, state: end.fs })
  })

  test("refused actions are not recorded", () => {
    const end = act(initialState(start), { type: "commitRename", nodeId: cat, name: "кіт?.png" })
    expect(end.message).not.toBeNull()
    expect(end.ops).toEqual([])
  })
})

const childrenOfBin = (state: FsState): number => Object.values(state.nodes).filter((n) => n.parentId === BIN_ID).length

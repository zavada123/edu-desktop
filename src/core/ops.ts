import * as fs from "./fs.ts"
import type { FsResult, FsState, NodeId, NodeKind } from "./fs.ts"
import { checkGoals, type Goal, type GoalResult, allMet } from "./goals.ts"
import { buildState, type DrivesSpec, type TreeSpec } from "./tree.ts"

/**
 * One change of the file system, as the student made it. The trainer records every successful change,
 * so a server can build the start tree again, replay the log and check the goals itself.
 * Node ids are stable: the same start tree and the same log always give the same ids.
 */
export type Op =
  | { readonly op: "create"; readonly parentId: NodeId; readonly kind: NodeKind; readonly name: string }
  | { readonly op: "saveFile"; readonly folderId: NodeId; readonly name: string; readonly ext: string }
  | { readonly op: "rename"; readonly id: NodeId; readonly name: string }
  | { readonly op: "move"; readonly id: NodeId; readonly targetId: NodeId }
  | { readonly op: "copy"; readonly id: NodeId; readonly targetId: NodeId }
  | { readonly op: "shortcut"; readonly id: NodeId; readonly parentId: NodeId }
  | { readonly op: "compress"; readonly ids: ReadonlyArray<NodeId>; readonly name: string }
  | { readonly op: "extract"; readonly id: NodeId }
  | { readonly op: "openFile"; readonly id: NodeId }
  | { readonly op: "remove"; readonly id: NodeId }
  | { readonly op: "restore"; readonly id: NodeId }
  | { readonly op: "deleteForever"; readonly id: NodeId }
  | { readonly op: "emptyBin" }

/**
 * A real task takes 10–60 changes and creates fewer than 100 items. The limits keep a forged log
 * from using much time or memory on the server: every change copies the node map once per new item.
 */
export const MAX_OPS = 1_000
export const MAX_NODES = 1_000
export const MAX_CREATED = 5_000

export const applyOp = (state: FsState, op: Op): FsResult => {
  switch (op.op) {
    case "create":
      return fs.create(state, op.parentId, op.kind, op.name)
    case "saveFile":
      return fs.saveFile(state, op.folderId, op.name, op.ext)
    case "rename":
      return fs.rename(state, op.id, op.name)
    case "move":
      return fs.move(state, op.id, op.targetId)
    case "copy":
      return fs.copy(state, op.id, op.targetId)
    case "shortcut":
      return fs.createShortcut(state, op.id, op.parentId)
    case "compress":
      return fs.compress(state, op.ids, op.name)
    case "extract":
      return fs.extractAll(state, op.id)
    case "openFile":
      return fs.markOpened(state, op.id)
    case "remove":
      return fs.remove(state, op.id)
    case "restore":
      return fs.restore(state, op.id)
    case "deleteForever":
      return fs.deleteForever(state, op.id)
    case "emptyBin":
      return { ok: true, id: fs.BIN_ID, state: fs.emptyBin(state) }
  }
}

export type ReplayResult =
  | { readonly ok: true; readonly state: FsState }
  /** `index` is the first change that could not be made; -1 when the log is too long. */
  | { readonly ok: false; readonly index: number; readonly error: string }

/** Applies the log in order. One impossible change makes the whole log invalid: the trainer never records one. */
export const replay = (start: FsState, ops: ReadonlyArray<Op>): ReplayResult => {
  if (ops.length > MAX_OPS) return { ok: false, index: -1, error: `Забагато дій: ${ops.length}, можна не більше ${MAX_OPS}` }
  let state = start
  for (const [index, op] of ops.entries()) {
    const result = applyOp(state, op)
    if (!result.ok) return { ok: false, index, error: result.error }
    if (Object.keys(result.state.nodes).length > MAX_NODES) return { ok: false, index, error: `Забагато файлів і папок, можна не більше ${MAX_NODES}` }
    // Ids only grow, so the id counter tells how many items the log created, deleted ones included.
    if (result.state.nextId - start.nextId > MAX_CREATED) return { ok: false, index, error: `Забагато нових об'єктів, можна не більше ${MAX_CREATED}` }
    state = result.state
  }
  return { ok: true, state }
}

/** What the server needs from a scenario to grade an answer. */
export interface GradedTask {
  readonly start: TreeSpec
  readonly drives?: DrivesSpec
  readonly goals: ReadonlyArray<Goal>
}

export type GradeResult =
  | { readonly ok: true; readonly solved: boolean; readonly results: ReadonlyArray<GoalResult>; readonly state: FsState }
  | { readonly ok: false; readonly index: number; readonly error: string }

/** Builds the start tree, replays the student's log and checks every goal. */
export const grade = (task: GradedTask, ops: ReadonlyArray<Op>): GradeResult => {
  const replayed = replay(buildState(task.start, task.drives), ops)
  if (!replayed.ok) return replayed
  const results = checkGoals(replayed.state, task.goals)
  return { ok: true, solved: allMet(results), results, state: replayed.state }
}

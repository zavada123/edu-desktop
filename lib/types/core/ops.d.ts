import type { FsResult, FsState, NodeId, NodeKind } from "./fs.ts";
import { type Goal, type GoalResult } from "./goals.ts";
import { type DrivesSpec, type TreeSpec } from "./tree.ts";
/**
 * One change of the file system, as the student made it. The trainer records every successful change,
 * so a server can build the start tree again, replay the log and check the goals itself.
 * Node ids are stable: the same start tree and the same log always give the same ids.
 */
export type Op = {
    readonly op: "create";
    readonly parentId: NodeId;
    readonly kind: NodeKind;
    readonly name: string;
} | {
    readonly op: "saveFile";
    readonly folderId: NodeId;
    readonly name: string;
    readonly ext: string;
} | {
    readonly op: "rename";
    readonly id: NodeId;
    readonly name: string;
} | {
    readonly op: "move";
    readonly id: NodeId;
    readonly targetId: NodeId;
} | {
    readonly op: "copy";
    readonly id: NodeId;
    readonly targetId: NodeId;
} | {
    readonly op: "shortcut";
    readonly id: NodeId;
    readonly parentId: NodeId;
} | {
    readonly op: "compress";
    readonly ids: ReadonlyArray<NodeId>;
    readonly name: string;
} | {
    readonly op: "extract";
    readonly id: NodeId;
} | {
    readonly op: "openFile";
    readonly id: NodeId;
} | {
    readonly op: "remove";
    readonly id: NodeId;
} | {
    readonly op: "restore";
    readonly id: NodeId;
} | {
    readonly op: "deleteForever";
    readonly id: NodeId;
} | {
    readonly op: "emptyBin";
};
/**
 * A real task takes 10–60 changes and creates fewer than 100 items. The limits keep a forged log
 * from using much time or memory on the server: every change copies the node map once per new item.
 */
export declare const MAX_OPS = 1000;
export declare const MAX_NODES = 1000;
export declare const MAX_CREATED = 5000;
export declare const applyOp: (state: FsState, op: Op) => FsResult;
export type ReplayResult = {
    readonly ok: true;
    readonly state: FsState;
}
/** `index` is the first change that could not be made; -1 when the log is too long or the start tree is broken. */
 | {
    readonly ok: false;
    readonly index: number;
    readonly error: string;
};
/** Applies the log in order. One impossible change makes the whole log invalid: the trainer never records one. */
export declare const replay: (start: FsState, ops: ReadonlyArray<Op>) => ReplayResult;
/** What the server needs from a scenario to grade an answer. */
export interface GradedTask {
    readonly start: TreeSpec;
    readonly drives?: DrivesSpec;
    readonly goals: ReadonlyArray<Goal>;
}
export type GradeResult = {
    readonly ok: true;
    readonly solved: boolean;
    readonly results: ReadonlyArray<GoalResult>;
    readonly state: FsState;
} | {
    readonly ok: false;
    readonly index: number;
    readonly error: string;
};
/**
 * Builds the start tree, replays the student's log and checks every goal. Never throws:
 * a broken start tree gives `index: -1` and the problem.
 */
export declare const grade: (task: GradedTask, ops: ReadonlyArray<Op>) => GradeResult;

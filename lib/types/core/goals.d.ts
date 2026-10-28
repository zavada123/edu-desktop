import { type FsState, type NodeKind } from "./fs.ts";
/**
 * Conditions a scenario checks on the final desktop. Authors pick them from this list,
 * no programming needed. Paths are relative to the desktop: `Мої фото/ліс.jpg`.
 */
export type Goal = 
/** `kind: "zip"` asks for a compressed ZIP folder, not a plain folder with `.zip` in its name. */
{
    readonly type: "exists";
    readonly path: string;
    readonly kind?: NodeKind | "zip";
    readonly text?: string;
    readonly hint?: string;
} | {
    readonly type: "absent";
    readonly path: string;
    readonly text?: string;
    readonly hint?: string;
} | {
    readonly type: "inBin";
    readonly name: string;
    readonly text?: string;
    readonly hint?: string;
}
/** The file at `path` was opened in the program with «Файл → Відкрити». */
 | {
    readonly type: "opened";
    readonly path: string;
    readonly text?: string;
    readonly hint?: string;
}
/** The item at `path` was deleted into the bin and then restored. */
/** In `folder` lies a shortcut (any name) that opens the object at `target`. */
 | {
    readonly type: "shortcut";
    readonly folder: string;
    readonly target: string;
    readonly text?: string;
    readonly hint?: string;
} | {
    readonly type: "restored";
    readonly path: string;
    readonly text?: string;
    readonly hint?: string;
} | {
    readonly type: "count";
    readonly folder: string;
    readonly equals: number;
    /** Count only files with this extension, without the dot: `jpg`. */
    readonly ext?: string;
    readonly kind?: NodeKind;
    readonly text?: string;
    readonly hint?: string;
};
export interface GoalResult {
    readonly goal: Goal;
    readonly ok: boolean;
    /** What the student sees in the task list. */
    readonly text: string;
    /** Shown only when the condition is not met. */
    readonly hint: string;
}
/** Default wording of a goal for the task list. */
export declare const describeGoal: (goal: Goal) => string;
export declare const checkGoals: (state: FsState, goals: ReadonlyArray<Goal>) => ReadonlyArray<GoalResult>;
export declare const allMet: (results: ReadonlyArray<GoalResult>) => boolean;

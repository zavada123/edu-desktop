import type { Goal } from "../core/goals.ts"
import type { TreeSpec } from "../core/tree.ts"

/** One exercise: what is on the desktop at the start, what to do, and how to check it. */
export interface Scenario {
  readonly id: string
  readonly grade: number
  readonly title: string
  /** The task as the student reads it. Short sentences, one action each. */
  readonly task: ReadonlyArray<string>
  readonly start: TreeSpec
  readonly goals: ReadonlyArray<Goal>
  /** Large icons and text for younger students (grades 3–4). */
  readonly large?: boolean
}

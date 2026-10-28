import type { Goal } from "../core/goals.ts"
import type { DrivesSpec, TreeSpec } from "../core/tree.ts"

/** One exercise: what is on the desktop at the start, what to do, and how to check it. */
export interface Scenario {
  readonly id: string
  readonly grade: number
  readonly title: string
  /** The task as the student reads it. Short sentences, one action each. */
  readonly task: ReadonlyArray<string>
  readonly start: TreeSpec
  /** Contents of drives C: and D: in «Цей ПК». Goals reach them as `D:/Мої уроки/...`. */
  readonly drives?: DrivesSpec
  readonly goals: ReadonlyArray<Goal>
  /** Large icons and text for younger students (grades 3–4). */
  readonly large?: boolean
}

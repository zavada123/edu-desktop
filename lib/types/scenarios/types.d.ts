import type { Goal } from "../core/goals.ts";
import type { DrivesSpec, TreeSpec } from "../core/tree.ts";
/** A program the scenario starts with; its work is saved through «Зберегти як». */
export type AppKind = "paint" | "text" | "browser";
export interface AppSpec {
    readonly kind: AppKind;
    /** Name offered in the «Ім'я файлу» field. */
    readonly fileName?: string;
}
/** One exercise: what is on the desktop at the start, what to do, and how to check it. */
export interface Scenario {
    readonly id: string;
    /** School grade shown on the task card; 0 hides it (a page that shows the grade itself). */
    readonly grade: number;
    readonly title: string;
    /** The task as the student reads it. Short sentences, one action each. */
    readonly task: ReadonlyArray<string>;
    readonly start: TreeSpec;
    /** Contents of drives C: and D: in «Цей ПК». Goals reach them as `D:/Мої уроки/...`. */
    readonly drives?: DrivesSpec;
    readonly goals: ReadonlyArray<Goal>;
    /** Large icons and text for younger students (grades 3–4). */
    readonly large?: boolean;
    /** Opens this program at the start (Paint, a text editor, a browser with a picture). */
    readonly app?: AppSpec;
}

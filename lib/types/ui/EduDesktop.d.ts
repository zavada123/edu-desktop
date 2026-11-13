import { type Op } from "../core/ops.ts";
import type { Scenario } from "../scenarios/types.ts";
import { type NextExercise } from "./TaskPanel.tsx";
import "./desktop.css";
interface Props {
    /** To show another scenario, give the component a new `key`, for example the scenario id. */
    readonly scenario: Scenario;
    /** Called after every check; `solved` is true when all conditions are met. */
    readonly onCheck?: (solved: boolean) => void;
    /**
     * Called with the log of all file-system changes each time it changes. A page that checks answers
     * on its server sends this log and grades it there with `grade` from the core.
     */
    readonly onChange?: (ops: ReadonlyArray<Op>) => void;
    /** A log saved earlier: the trainer starts with these changes made. An invalid log is ignored. */
    readonly initialOps?: ReadonlyArray<Op>;
    /** `false` hides «Перевірити» when the page checks the answer itself. */
    readonly selfCheck?: boolean;
    /**
     * The exercise after this one. After a passed check the task card shows «Наступне завдання»; the button calls
     * `go`, and the page then shows the next scenario (with a new `key`). A trainer in full screen stays in it.
     */
    readonly next?: NextExercise;
}
/** The whole trainer for one scenario. Can be embedded into any React page. */
export declare const EduDesktop: ({ scenario, onCheck, onChange, initialOps, selfCheck, next }: Props) => import("react").JSX.Element;
export {};

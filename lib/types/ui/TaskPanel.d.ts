import type { Scenario } from "../scenarios/types.ts";
import type { Action, DesktopState } from "./store.ts";
interface Props {
    readonly scenario: Scenario;
    readonly state: DesktopState;
    readonly open: boolean;
    readonly onToggle: () => void;
    readonly onReset: () => void;
    readonly dispatch: (action: Action) => void;
    readonly selfCheck: boolean;
}
/** The task card: what to do, the "Перевірити" button and the result of each condition. */
export declare const TaskPanel: ({ scenario, state, open, onToggle, onReset, dispatch, selfCheck }: Props) => import("react").JSX.Element;
export {};

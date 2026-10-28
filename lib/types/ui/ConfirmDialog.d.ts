import type { Action, Confirm, DesktopState } from "./store.ts";
/** «Ви дійсно хочете…?» window, like the one the textbook asks to confirm (4 клас, с. 48). */
export declare const ConfirmDialog: ({ state, confirm, dispatch }: {
    readonly state: DesktopState;
    readonly confirm: Confirm;
    readonly dispatch: (a: Action) => void;
}) => import("react").JSX.Element;

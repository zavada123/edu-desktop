import type { Action, Win } from "./store.ts";
interface Props {
    readonly win: Win;
    readonly title: string;
    readonly icon: React.ReactNode;
    readonly active: boolean;
    readonly zIndex: number;
    readonly dispatch: (action: Action) => void;
    readonly children: React.ReactNode;
}
/**
 * Window frame: title bar to drag, minimise, maximise and close buttons, and edges and corners to resize it
 * as in Windows. On phones it always fills the screen (CSS), so the edges are hidden there.
 */
export declare const Window: ({ win, title, icon, active, zIndex, dispatch, children }: Props) => import("react").JSX.Element;
export {};

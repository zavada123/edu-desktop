import type { AppKind, AppSpec } from "../scenarios/types.ts";
import type { Action, DesktopState } from "./store.ts";
/** What each program saves and how its window is called. */
export declare const APPS: Record<AppKind, {
    readonly title: string;
    readonly ext: string;
    readonly typeLabel: string;
    readonly fileName: string;
}>;
export declare const appTitle: (state: DesktopState, app: AppSpec) => string;
/** The program window's content: the «Файл» menu (Зберегти, Зберегти як) and the program itself. */
export declare const AppContent: ({ app, state, dispatch }: {
    readonly app: AppSpec;
    readonly state: DesktopState;
    readonly dispatch: (a: Action) => void;
}) => import("react").JSX.Element;

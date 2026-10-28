import type { Action, DesktopState, FileDialog } from "./store.ts";
import type { AppSpec } from "../scenarios/types.ts";
interface Props {
    readonly mode: FileDialog;
    readonly state: DesktopState;
    readonly app: AppSpec;
    readonly dispatch: (action: Action) => void;
}
/**
 * «Зберегти як» and «Відкрити» as the textbooks show them (3 клас, с. 54; 4 клас, с. 21): places on the left,
 * the current folder, «Ім'я файлу», «Тип файлу» and the buttons. A tap on a folder opens it.
 */
export declare const SaveDialog: ({ mode, state, app, dispatch }: Props) => import("react").JSX.Element;
export {};

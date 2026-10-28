import { ItemGrid } from "./ItemGrid.tsx";
import type { Action, DesktopState, Win } from "./store.ts";
type Bind = Parameters<typeof ItemGrid>[0]["bind"];
interface Props {
    readonly state: DesktopState;
    readonly win: Win;
    readonly bind: Bind;
    readonly dispatch: (action: Action) => void;
}
export declare const Explorer: ({ state, win, bind, dispatch }: Props) => import("react").JSX.Element;
export {};

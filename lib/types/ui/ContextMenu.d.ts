import { type NodeId } from "../core/fs.ts";
import type { Action, DesktopState, Menu } from "./store.ts";
interface Props {
    readonly state: DesktopState;
    readonly menu: Menu;
    readonly dispatch: (action: Action) => void;
    readonly onOpen: (nodeId: NodeId) => void;
}
/** Right-click (or long-press) menu with the «Створити ›» and «Надіслати ›» submenus, as in the textbooks. Stays inside the screen. */
export declare const ContextMenu: ({ state, menu, dispatch, onOpen }: Props) => import("react").JSX.Element | null;
export {};

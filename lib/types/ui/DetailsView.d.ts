import { type FsNode, type NodeId } from "../core/fs.ts";
import type { Action, DesktopState } from "./store.ts";
type Bind = (nodeId: NodeId | null, containerId: NodeId) => {
    readonly onPointerDown: (e: React.PointerEvent) => void;
    readonly onContextMenu: (e: React.MouseEvent) => void;
};
interface Props {
    readonly state: DesktopState;
    readonly containerId: NodeId;
    readonly items: ReadonlyArray<FsNode>;
    readonly bind: Bind;
    readonly dispatch: (action: Action) => void;
    /** Search results: a «Папка» column shows where each item lies. */
    readonly searching: boolean;
}
/** «Таблиця» as in Windows Explorer: a click on a column heading sorts by it, a second click turns the order round. */
export declare const DetailsView: ({ state, containerId, items, bind, dispatch, searching }: Props) => import("react").JSX.Element;
export {};

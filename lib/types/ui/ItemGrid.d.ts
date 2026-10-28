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
    readonly variant: "desktop" | "explorer";
}
export declare const ItemGrid: ({ state, containerId, items, bind, dispatch, variant }: Props) => import("react").JSX.Element;
export {};

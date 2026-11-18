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
/**
 * The name field of «Перейменувати». With «Розширення імен файлів» off it holds the name without the extension
 * and keeps the extension, as Windows does.
 */
export declare const RenameInput: ({ node, showExtensions, dispatch }: {
    readonly node: FsNode;
    readonly showExtensions: boolean;
    readonly dispatch: (a: Action) => void;
}) => import("react").JSX.Element;
export declare const ItemGrid: ({ state, containerId, items, bind, dispatch, variant }: Props) => import("react").JSX.Element;
export {};

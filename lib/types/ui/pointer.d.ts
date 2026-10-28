import type { NodeId } from "../core/fs.ts";
export interface Drag {
    readonly nodeId: NodeId;
    readonly x: number;
    readonly y: number;
    /** Ctrl held: copy instead of move, as in Windows. */
    readonly copy: boolean;
    /** Dragged with the right mouse button: a menu asks what to do on drop. */
    readonly right: boolean;
}
export interface PointerHandlers {
    /** Single tap or click on an item, or on empty space (`null`). `additive`: Ctrl or ⌘ was held; `range`: Shift. */
    readonly onSelect: (nodeId: NodeId | null, additive: boolean, range: boolean) => void;
    readonly onOpen: (nodeId: NodeId) => void;
    readonly onMenu: (x: number, y: number, containerId: NodeId, nodeId: NodeId | null) => void;
    readonly onDrop: (nodeId: NodeId, targetId: NodeId, copy: boolean) => void;
    /** Right-button drop: show «Копіювати сюди / Перемістити сюди / Створити ярлики». */
    readonly onDropMenu: (x: number, y: number, nodeId: NodeId, targetId: NodeId) => void;
    /** Whether `nodeId` is the only selected item: a slow click on its name renames it. */
    readonly isSoleSelected: (nodeId: NodeId) => boolean;
    readonly onRename: (nodeId: NodeId) => void;
}
export declare const usePointer: (handlers: PointerHandlers) => {
    bind: (nodeId: NodeId | null, containerId: NodeId) => {
        onPointerDown: (e: React.PointerEvent) => void;
        onContextMenu: (e: React.MouseEvent) => void;
    };
    drag: Drag | null;
};

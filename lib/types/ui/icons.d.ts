import type { FsNode, FsState } from "../core/fs.ts";
/** Own simple icons: no Microsoft artwork is used anywhere in the project. */
type IconKind = "zip" | "folder" | "bin" | "binFull" | "pc" | "drive" | "image" | "text" | "doc" | "audio" | "video" | "file";
export declare const iconKindOf: (node: FsNode, binHasItems: boolean) => IconKind;
export declare const NodeIcon: ({ kind, size, shortcut }: {
    readonly kind: IconKind;
    readonly size: number;
    readonly shortcut?: boolean;
}) => import("react").JSX.Element;
/** Icon of an item in a folder: a shortcut looks like its object plus the arrow; a broken one like a plain file. */
export declare const ItemIcon: ({ fs, node, binHasItems, size }: {
    readonly fs: FsState;
    readonly node: FsNode;
    readonly binHasItems: boolean;
    readonly size: number;
}) => import("react").JSX.Element;
export {};

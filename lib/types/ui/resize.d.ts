/** Resizing a window by its edges and corners, as in Windows. Pure geometry, so it can be tested without a browser. */
/** Which edge or corner the student grabbed: n = top, s = bottom, e = right, w = left. */
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export declare const RESIZE_EDGES: ReadonlyArray<ResizeEdge>;
/** Smallest window: the title bar buttons, the address bar and a couple of icons still fit. */
export declare const MIN_WIN_WIDTH = 320;
export declare const MIN_WIN_HEIGHT = 200;
export interface Rect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
/** The size of the desktop the window lives on. */
export interface Bounds {
    readonly width: number;
    readonly height: number;
}
/**
 * The window after the pointer moved by (dx, dy) from where the resize began. The opposite edge stays put,
 * the window never gets smaller than the minimum and never grows past the desktop.
 */
export declare const resizeRect: (start: Rect, edge: ResizeEdge, dx: number, dy: number, bounds: Bounds) => Rect;

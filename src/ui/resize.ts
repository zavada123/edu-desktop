/** Resizing a window by its edges and corners, as in Windows. Pure geometry, so it can be tested without a browser. */

/** Which edge or corner the student grabbed: n = top, s = bottom, e = right, w = left. */
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

export const RESIZE_EDGES: ReadonlyArray<ResizeEdge> = ["n", "s", "e", "w", "ne", "nw", "se", "sw"]

/** Smallest window: the title bar buttons, the address bar and a couple of icons still fit. */
export const MIN_WIN_WIDTH = 320
export const MIN_WIN_HEIGHT = 200

export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** The size of the desktop the window lives on. */
export interface Bounds {
  readonly width: number
  readonly height: number
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max))

/**
 * The window after the pointer moved by (dx, dy) from where the resize began. The opposite edge stays put,
 * the window never gets smaller than the minimum and never grows past the desktop.
 */
export const resizeRect = (start: Rect, edge: ResizeEdge, dx: number, dy: number, bounds: Bounds): Rect => {
  let { x, y, width, height } = start
  if (edge.includes("e")) width = clamp(start.width + dx, MIN_WIN_WIDTH, bounds.width - start.x)
  if (edge.includes("s")) height = clamp(start.height + dy, MIN_WIN_HEIGHT, bounds.height - start.y)
  if (edge.includes("w")) {
    const right = start.x + start.width
    width = clamp(start.width - dx, MIN_WIN_WIDTH, right)
    x = right - width
  }
  if (edge.includes("n")) {
    const bottom = start.y + start.height
    height = clamp(start.height - dy, MIN_WIN_HEIGHT, bottom)
    y = bottom - height
  }
  return { x, y, width, height }
}

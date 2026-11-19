import { describe, expect, test } from "vitest"
import { MIN_WIN_HEIGHT, MIN_WIN_WIDTH, resizeRect } from "./resize.ts"

const start = { x: 100, y: 80, width: 500, height: 300 }
const desk = { width: 1200, height: 700 }

describe("resizeRect", () => {
  test("the right and bottom edges grow the window, the top-left corner stays", () => {
    expect(resizeRect(start, "se", 50, 40, desk)).toEqual({ x: 100, y: 80, width: 550, height: 340 })
  })

  test("the left and top edges move the window so the opposite edges stay put", () => {
    expect(resizeRect(start, "nw", -30, 20, desk)).toEqual({ x: 70, y: 100, width: 530, height: 280 })
  })

  test("a side edge changes only its own direction", () => {
    expect(resizeRect(start, "e", 60, 999, desk)).toEqual({ ...start, width: 560 })
    expect(resizeRect(start, "n", 999, -50, desk)).toEqual({ ...start, y: 30, height: 350 })
  })

  test("the window never gets smaller than the minimum", () => {
    expect(resizeRect(start, "se", -1000, -1000, desk)).toEqual({ x: 100, y: 80, width: MIN_WIN_WIDTH, height: MIN_WIN_HEIGHT })
    const shrunk = resizeRect(start, "nw", 1000, 1000, desk)
    expect(shrunk).toEqual({ x: 600 - MIN_WIN_WIDTH, y: 380 - MIN_WIN_HEIGHT, width: MIN_WIN_WIDTH, height: MIN_WIN_HEIGHT })
  })

  test("the window never grows past the desktop", () => {
    expect(resizeRect(start, "se", 5000, 5000, desk)).toEqual({ x: 100, y: 80, width: 1100, height: 620 })
    expect(resizeRect(start, "nw", -5000, -5000, desk)).toEqual({ x: 0, y: 0, width: 600, height: 380 })
  })
})

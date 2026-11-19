import { describe, expect, test } from "vitest"
import { DESKTOP_ID, findByPath, type FsNode, type FsState } from "./fs.ts"
import { matchesSearch, searchIn, shownName, sortItems, typeName } from "./listing.ts"
import { buildState } from "./tree.ts"

const state = buildState({
  Документи: { Школа: { "реферат.docx": 40_000, "фото класу.jpg": 3_000_000 }, "кіт.jpg": 800_000, "лист.txt": 900, "фото.zip": { "zip.jpg": 10 } },
  Альбом: {},
  "Файл 10.txt": 5,
  "Файл 2.txt": 50
})
const at = (path: string): FsNode => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node
}
const names = (items: ReadonlyArray<FsNode>) => items.map((n) => n.name)
const docs = (s: FsState) => [at("Документи/Школа"), at("Документи/кіт.jpg"), at("Документи/лист.txt"), at("Документи/фото.zip")].map((n) => s.nodes[n.id] as FsNode)

describe("search", () => {
  test("a mask with * and ? matches the whole name, letter case aside", () => {
    expect(matchesSearch("Море.JPG", "*.jpg")).toBe(true)
    expect(matchesSearch("море.jpeg", "*.jpg")).toBe(false)
    expect(matchesSearch("звіт 2.docx", "звіт*")).toBe(true)
    expect(matchesSearch("фото1.png", "фото?.png")).toBe(true)
  })

  test("plain text is enough as a part of the name", () => {
    expect(matchesSearch("фото класу.jpg", "клас")).toBe(true)
    expect(matchesSearch("лист.txt", "клас")).toBe(false)
  })

  test("looks into subfolders but not into ZIP folders", () => {
    expect(names(searchIn(state, at("Документи").id, "*.jpg")).toSorted()).toEqual(["кіт.jpg", "фото класу.jpg"])
    expect(names(searchIn(state, at("Документи").id, "фото"))).toContain("фото.zip")
  })
})

describe("sort", () => {
  test("by name with numbers in their order, folders first", () => {
    expect(names(sortItems(state, [at("Файл 10.txt"), at("Альбом"), at("Файл 2.txt")], { key: "name", desc: false }, {}))).toEqual([
      "Альбом",
      "Файл 2.txt",
      "Файл 10.txt"
    ])
  })

  test("by size, both ways; folders stay first", () => {
    const items = docs(state)
    expect(names(sortItems(state, items, { key: "size", desc: false }, {}))).toEqual(["фото.zip", "Школа", "лист.txt", "кіт.jpg"])
    expect(names(sortItems(state, items, { key: "size", desc: true }, {})).slice(2)).toEqual(["кіт.jpg", "лист.txt"])
  })

  test("by date: an item the student just made is the newest", () => {
    const born = { [at("Документи/лист.txt").id]: Date.UTC(2030, 0, 1) }
    expect(names(sortItems(state, docs(state), { key: "modified", desc: true }, born)).at(2)).toBe("лист.txt")
  })

  test("type column and names without extensions", () => {
    expect(typeName(at("Документи/лист.txt"))).toBe("Текстовий документ")
    expect(shownName(at("Документи/кіт.jpg"), false)).toBe("кіт")
    expect(shownName(at("Документи/фото.zip"), false)).toBe("фото.zip")
    expect(shownName(at("Документи/кіт.jpg"), true)).toBe("кіт.jpg")
    expect(state.nodes[DESKTOP_ID]).toBeDefined()
  })
})

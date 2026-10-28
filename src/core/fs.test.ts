import { describe, expect, test } from "vitest"
import { BIN_ID, childrenOf, copy, create, deleteForever, DESKTOP_ID, driveId, emptyBin, findByPath, type FsResult, type FsState, move, pathOf, remove, rename, restore, THIS_PC_ID, windowsPath } from "./fs.ts"
import { freeName, validateName } from "./names.ts"
import { buildState } from "./tree.ts"

const ok = (result: FsResult): FsState => {
  if (!result.ok) throw new Error(result.error)
  return result.state
}
const idOf = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}
const names = (state: FsState, parentId: string): ReadonlyArray<string> => childrenOf(state, parentId).map((n) => n.name)

const start = buildState({ "Мої фото": { "ліс.jpg": null, "море.jpg": null }, Документи: {}, "вірш.txt": null })

describe("names", () => {
  test("rejects empty names and forbidden characters", () => {
    expect(validateName("  ")).not.toBeNull()
    expect(validateName("a/b")).not.toBeNull()
    expect(validateName("що?")).not.toBeNull()
    expect(validateName("Мої фото")).toBeNull()
  })

  test("rejects reserved device names like Windows (textbook 4th grade, p. 50)", () => {
    expect(validateName("NUL")).not.toBeNull()
    expect(validateName("prn.txt")).not.toBeNull()
    expect(validateName("Com1")).not.toBeNull()
    expect(validateName("Inna")).toBeNull()
    expect(validateName("Інна")).toBeNull()
  })

  test("adds a number before the extension when the name is taken", () => {
    const taken = new Set(["море.jpg", "море (2).jpg"])
    expect(freeName("море.jpg", (n) => taken.has(n))).toBe("море (3).jpg")
  })
})

describe("buildState", () => {
  test("builds folders and files from the spec", () => {
    expect(names(start, DESKTOP_ID)).toEqual(["Документи", "Мої фото", "вірш.txt"])
    expect(pathOf(start, idOf(start, "мої ФОТО/ліс.jpg"))).toEqual(["Мої фото", "ліс.jpg"])
  })
})

describe("create", () => {
  test("gives a new folder a free default name", () => {
    const once = ok(create(start, DESKTOP_ID, "folder", "Нова папка"))
    const twice = ok(create(once, DESKTOP_ID, "folder", "Нова папка"))
    expect(names(twice, DESKTOP_ID)).toContain("Нова папка (2)")
  })

  test("does not change the original state", () => {
    ok(create(start, DESKTOP_ID, "folder", "Тварини"))
    expect(findByPath(start, "Тварини")).toBeUndefined()
  })
})

describe("rename", () => {
  test("renames and refuses a duplicate name, ignoring case", () => {
    const id = idOf(start, "вірш.txt")
    expect(findByPath(ok(rename(start, id, "казка.txt")), "казка.txt")).toBeDefined()
    expect(rename(start, id, "мої фото").ok).toBe(false)
  })
})

describe("move", () => {
  test("moves a file into a folder", () => {
    const state = ok(move(start, idOf(start, "вірш.txt"), idOf(start, "Документи")))
    expect(findByPath(state, "Документи/вірш.txt")).toBeDefined()
    expect(findByPath(state, "вірш.txt")).toBeUndefined()
  })

  test("refuses to move a folder into itself", () => {
    const photos = idOf(start, "Мої фото")
    expect(move(start, photos, photos).ok).toBe(false)
    const withInner = ok(create(start, photos, "folder", "Ліс"))
    expect(move(withInner, photos, idOf(withInner, "Мої фото/Ліс")).ok).toBe(false)
  })

  test("refuses when the target already has that name", () => {
    const withCopy = ok(create(start, idOf(start, "Документи"), "file", "вірш.txt"))
    expect(move(withCopy, idOf(withCopy, "вірш.txt"), idOf(withCopy, "Документи")).ok).toBe(false)
  })
})

describe("copy", () => {
  test("keeps the original and copies the whole folder", () => {
    const state = ok(copy(start, idOf(start, "Мої фото"), idOf(start, "Документи")))
    expect(findByPath(state, "Мої фото/ліс.jpg")).toBeDefined()
    expect(findByPath(state, "Документи/Мої фото/море.jpg")).toBeDefined()
  })

  test("names a copy in the same folder like Windows", () => {
    const state = ok(copy(start, idOf(start, "вірш.txt"), DESKTOP_ID))
    expect(names(state, DESKTOP_ID)).toContain("вірш – копія.txt")
  })
})

describe("recycle bin", () => {
  test("deletes into the bin and restores to the old folder", () => {
    const deleted = ok(remove(start, idOf(start, "Мої фото/ліс.jpg")))
    expect(findByPath(deleted, "Мої фото/ліс.jpg")).toBeUndefined()
    expect(names(deleted, BIN_ID)).toEqual(["ліс.jpg"])
    const binItem = childrenOf(deleted, BIN_ID)[0]
    if (!binItem) throw new Error("кошик порожній")
    expect(findByPath(ok(restore(deleted, binItem.id)), "Мої фото/ліс.jpg")).toBeDefined()
  })

  test("moving into the bin is deleting, emptying removes everything inside", () => {
    const deleted = ok(move(start, idOf(start, "Мої фото"), BIN_ID))
    const emptied = emptyBin(deleted)
    expect(childrenOf(emptied, BIN_ID)).toEqual([])
    expect(Object.values(emptied.nodes).some((n) => n.name === "ліс.jpg")).toBe(false)
  })

  test("refuses to create inside the bin or inside a deleted folder", () => {
    const deleted = ok(remove(start, idOf(start, "Мої фото")))
    expect(create(deleted, BIN_ID, "folder", "Х").ok).toBe(false)
    const photos = childrenOf(deleted, BIN_ID)[0]
    if (!photos) throw new Error("кошик порожній")
    expect(create(deleted, photos.id, "folder", "Х").ok).toBe(false)
  })
})

describe("This PC and drives", () => {
  const withDrives = buildState({ "кіт.png": null }, { "D:": { "Мої уроки": { Інформатика: { "монітор.jpg": null } } } })

  test("finds files on a drive by a Windows path", () => {
    expect(findByPath(withDrives, "D:/Мої уроки/Інформатика/монітор.jpg")).toBeDefined()
    expect(findByPath(withDrives, "d:\\мої уроки\\інформатика")).toBeDefined()
    expect(findByPath(withDrives, "C:/Мої уроки")).toBeUndefined()
  })

  test("shows the path like the textbook: D:\\Мої уроки\\Інформатика\\монітор.jpg", () => {
    expect(windowsPath(withDrives, idOf(withDrives, "D:/Мої уроки/Інформатика/монітор.jpg"))).toBe("D:\\Мої уроки\\Інформатика\\монітор.jpg")
    expect(windowsPath(withDrives, driveId("D"))).toBe("D:\\")
    expect(windowsPath(withDrives, idOf(withDrives, "кіт.png"))).toBe("Робочий стіл\\кіт.png")
  })

  test("drives and This PC cannot be renamed, moved or deleted", () => {
    expect(rename(withDrives, driveId("D"), "E:").ok).toBe(false)
    expect(remove(withDrives, driveId("C")).ok).toBe(false)
    expect(move(withDrives, THIS_PC_ID, DESKTOP_ID).ok).toBe(false)
    expect(create(withDrives, THIS_PC_ID, "folder", "Х").ok).toBe(false)
  })

  test("copies between a drive and the desktop", () => {
    const state = ok(copy(withDrives, idOf(withDrives, "D:/Мої уроки/Інформатика/монітор.jpg"), DESKTOP_ID))
    expect(findByPath(state, "монітор.jpg")).toBeDefined()
    expect(findByPath(state, "D:/Мої уроки/Інформатика/монітор.jpg")).toBeDefined()
  })

  test("rejects an unknown drive in a scenario", () => {
    expect(() => buildState({}, { "E:": {} })).toThrow()
  })
})

describe("deleteForever", () => {
  test("removes an item from the bin only", () => {
    const fileId = idOf(start, "вірш.txt")
    expect(deleteForever(start, fileId).ok).toBe(false)
    const gone = ok(deleteForever(ok(remove(start, fileId)), fileId))
    expect(gone.nodes[fileId]).toBeUndefined()
  })
})

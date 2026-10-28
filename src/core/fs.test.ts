import { describe, expect, test } from "vitest"
import { BIN_ID, childrenOf, compress, copy, create, createShortcut, deleteForever, extractAll, DESKTOP_ID, driveId, emptyBin, findByPath, type FsResult, type FsState, move, pathOf, remove, rename, restore, THIS_PC_ID, resolveAddress, saveFile, shortcutTarget, windowsPath } from "./fs.ts"
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

describe("resolveAddress", () => {
  const withDrives = buildState({ "Мої фото": { "ліс.jpg": null } }, { "D:": { "Мої уроки": {} } })

  test("opens folders typed in the address bar", () => {
    expect(resolveAddress(withDrives, "D:\\Мої уроки")).toBe(idOf(withDrives, "D:/Мої уроки"))
    expect(resolveAddress(withDrives, "d:\\")).toBe(driveId("D"))
    expect(resolveAddress(withDrives, "Робочий стіл\\Мої фото")).toBe(idOf(withDrives, "Мої фото"))
    expect(resolveAddress(withDrives, "  Цей ПК ")).toBe(THIS_PC_ID)
    expect(resolveAddress(withDrives, "Робочий стіл")).toBe(DESKTOP_ID)
  })

  test("returns null for files and missing folders", () => {
    expect(resolveAddress(withDrives, "Робочий стіл\\Мої фото\\ліс.jpg")).toBeNull()
    expect(resolveAddress(withDrives, "C:\\Немає")).toBeNull()
  })
})

describe("shortcuts", () => {
  const start = buildState({ "вірш.txt": null }, { "D:": { "Моя папка": { "нотатки.txt": null } } })
  const folder = findByPath(start, "D:/Моя папка")?.id ?? ""

  test("a shortcut is named «… – ярлик» and opens its object", () => {
    const made = ok(createShortcut(start, folder, DESKTOP_ID))
    const shortcut = findByPath(made, "Моя папка – ярлик")
    expect(shortcut?.target).toBe(folder)
    expect(shortcut && shortcutTarget(made, shortcut)?.id).toBe(folder)
  })

  test("deleting a shortcut leaves the object; deleting the object breaks the shortcut", () => {
    const made = ok(createShortcut(start, folder, DESKTOP_ID))
    const shortcutId = findByPath(made, "Моя папка – ярлик")?.id ?? ""
    expect(findByPath(ok(remove(made, shortcutId)), "D:/Моя папка/нотатки.txt")).toBeDefined()
    const broken = ok(remove(made, folder))
    const shortcut = findByPath(broken, "Моя папка – ярлик")
    expect(shortcut && shortcutTarget(broken, shortcut)).toBeUndefined()
  })

  test("a shortcut to a shortcut points at the same object; copies keep the target", () => {
    const first = ok(createShortcut(start, folder, DESKTOP_ID))
    const firstId = findByPath(first, "Моя папка – ярлик")?.id ?? ""
    const second = ok(createShortcut(first, firstId, DESKTOP_ID))
    expect(findByPath(second, "Моя папка – ярлик (2)")?.target).toBe(folder)
    const copied = ok(copy(first, firstId, folder))
    expect(findByPath(copied, "D:/Моя папка/Моя папка – ярлик")?.target).toBe(folder)
  })

  test("no shortcuts to items in the bin or into the bin", () => {
    const poem = findByPath(start, "вірш.txt")?.id ?? ""
    expect(createShortcut(ok(remove(start, poem)), poem, DESKTOP_ID).ok).toBe(false)
    expect(createShortcut(start, poem, BIN_ID).ok).toBe(false)
  })

  test("scenario trees describe shortcuts as a path string", () => {
    const state = buildState({ "Ігри – ярлик": "D:/Ігри" }, { "D:": { Ігри: {} } })
    expect(findByPath(state, "Ігри – ярлик")?.target).toBe(findByPath(state, "D:/Ігри")?.id)
    expect(() => buildState({ "x – ярлик": "D:/Немає" })).toThrow()
  })
})

describe("«Зберегти як»", () => {
  test("adds the extension, keeps a typed one, refuses an existing name", () => {
    const saved = ok(saveFile(start, DESKTOP_ID, "Україна", ".png"))
    expect(findByPath(saved, "Україна.png")).toBeDefined()
    expect(findByPath(ok(saveFile(start, DESKTOP_ID, "мапа.PNG", ".png")), "мапа.PNG")).toBeDefined()
    const again = saveFile(saved, DESKTOP_ID, "україна", ".png")
    expect(again.ok).toBe(false)
    expect(saveFile(start, DESKTOP_ID, "  ", ".png").ok).toBe(false)
    expect(saveFile(start, THIS_PC_ID, "x", ".png").ok).toBe(false)
    expect(saveFile(start, DESKTOP_ID, "a?b", ".png").ok).toBe(false)
  })
})

describe("ZIP folders", () => {
  test("compress copies the items into name.zip next to them; extract makes a folder with the contents", () => {
    const sea = findByPath(start, "Мої фото/море.jpg")?.id ?? ""
    const forest = findByPath(start, "Мої фото/ліс.jpg")?.id ?? ""
    const zipped = ok(compress(start, [sea, forest], "фото"))
    expect(findByPath(zipped, "Мої фото/фото.zip")?.zip).toBe(true)
    expect(childrenOf(zipped, findByPath(zipped, "Мої фото/фото.zip")?.id ?? "").map((n) => n.name)).toEqual(["ліс.jpg", "море.jpg"])
    expect(findByPath(zipped, "Мої фото/море.jpg")).toBeDefined()
    const extracted = ok(extractAll(zipped, findByPath(zipped, "Мої фото/фото.zip")?.id ?? ""))
    expect(findByPath(extracted, "Мої фото/фото/ліс.jpg")).toBeDefined()
    expect(findByPath(extracted, "Мої фото/фото")?.zip).toBeUndefined()
    expect(extractAll(start, findByPath(start, "Документи")?.id ?? "").ok).toBe(false)
  })

  test("scenario trees mark `.zip` folders", () => {
    expect(findByPath(buildState({ "a.zip": { "b.txt": null } }), "a.zip")?.zip).toBe(true)
  })
})

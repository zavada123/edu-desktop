import { describe, expect, test } from "vitest"
import { copy, create, DESKTOP_ID, driveId, findByPath, type FsNode, type FsResult, type FsState, getNode, resolveAddress, saveFile, setAttributes } from "./fs.ts"
import { checkGoals } from "./goals.ts"
import { replay } from "./ops.ts"
import { contentsOf, driveSpace, formatDate, fullSize, locationOf, programOf, shortcutTargetPath, shortSize, sizeOf, sizeOnDiskOf, startDates, typeOf } from "./props.ts"
import { defaultSize } from "./sizes.ts"
import { buildState, toTreeSpec, tryBuildState } from "./tree.ts"

const ok = (result: FsResult): FsState => {
  if (!result.ok) throw new Error(result.error)
  return result.state
}
const at = (state: FsState, path: string): FsNode => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node
}

const start = buildState(
  { "вірш.txt": 1_286, "Мої фото": { "ліс.jpg": 1_843_200, "море.jpg": null, Літо: { "пляж.png": 5_000 } }, "Фото – ярлик": "Мої фото", README: 10 },
  { "D:": { "Мої уроки": { "монітор.jpg": 2_465_792 } } }
)

describe("sizes", () => {
  test("Explorer style: three digits, cut, not rounded", () => {
    expect(shortSize(0)).toBe("0 байт")
    expect(shortSize(345)).toBe("345 байт")
    expect(shortSize(1_023)).toBe("1\u00a0023 байт")
    expect(shortSize(1_024)).toBe("1,00 КБ")
    expect(shortSize(12_800)).toBe("12,5 КБ")
    expect(shortSize(240_640)).toBe("235 КБ")
    expect(shortSize(2_465_792)).toBe("2,35 МБ")
    expect(shortSize(1_020_000)).toBe("996 КБ")
    expect(shortSize(1_030_000)).toBe("0,98 МБ")
    expect(shortSize(3 * 1024 ** 3)).toBe("3,00 ГБ")
  })

  test("full size adds the bytes in groups of three", () => {
    expect(fullSize(2_465_792)).toBe("2,35 МБ (2\u00a0465\u00a0792 байт)")
  })

  test("a folder adds up everything inside; on disk every file takes whole 4 KB clusters", () => {
    const photos = at(start, "Мої фото")
    expect(sizeOf(start, photos)).toBe(1_843_200 + defaultSize("море.jpg") + 5_000)
    expect(sizeOnDiskOf(start, at(start, "вірш.txt"))).toBe(4_096)
    expect(sizeOnDiskOf(start, at(start, "Мої фото/Літо"))).toBe(8_192)
    expect(contentsOf(start, photos.id)).toEqual({ files: 3, folders: 1 })
  })

  test("a file without a size gets the same believable size every time", () => {
    const size = defaultSize("море.jpg")
    expect(size).toBe(defaultSize("море.jpg"))
    expect(size).toBeGreaterThanOrEqual(400 * 1024)
    expect(size).toBeLessThan(4 * 1024 * 1024)
  })

  test("a new text document is empty, a saved drawing is not", () => {
    const made = ok(create(start, DESKTOP_ID, "file", "Новий текстовий документ.txt"))
    expect(sizeOf(made, at(made, "Новий текстовий документ.txt"))).toBe(0)
    expect(sizeOnDiskOf(made, at(made, "Новий текстовий документ.txt"))).toBe(0)
    const saved = ok(saveFile(start, DESKTOP_ID, "Україна", ".png"))
    expect(sizeOf(saved, at(saved, "Україна.png"))).toBe(defaultSize("Україна.png"))
  })

  test("a copy keeps the size and the attributes", () => {
    const locked = ok(setAttributes(start, at(start, "вірш.txt").id, { readOnly: true, hidden: true }))
    const copied = ok(copy(locked, at(locked, "вірш.txt").id, DESKTOP_ID))
    const twin = at(copied, "вірш – копія.txt")
    expect(sizeOf(copied, twin)).toBe(1_286)
    expect(twin.readOnly).toBe(true)
    expect(twin.hidden).toBe(true)
  })

  test("the start tree rejects a negative size", () => {
    expect(tryBuildState({ "a.txt": -1 }).ok).toBe(false)
  })

  test("toTreeSpec keeps a size only where null would give another one", () => {
    const made = ok(create(start, DESKTOP_ID, "file", "нотатки.txt"))
    const spec = toTreeSpec(made)
    expect(spec.desktop["нотатки.txt"]).toBe(0)
    expect(spec.desktop["Мої фото"]).toMatchObject({ "море.jpg": null, "ліс.jpg": 1_843_200 })
    expect(toTreeSpec(buildState(spec.desktop, spec.drives))).toEqual(spec)
  })
})

describe("type and program", () => {
  test("as Windows writes them", () => {
    expect(typeOf(at(start, "вірш.txt"))).toBe("Текстовий документ (.txt)")
    expect(typeOf(at(start, "Мої фото/ліс.jpg"))).toBe("Файл JPG (.jpg)")
    expect(typeOf(at(start, "Мої фото"))).toBe("Папка з файлами")
    expect(typeOf(at(start, "Фото – ярлик"))).toBe("Ярлик (.lnk)")
    expect(typeOf(at(start, "README"))).toBe("Файл")
    expect(typeOf({ id: "x", name: "карта.xyz", kind: "file", parentId: DESKTOP_ID })).toBe("Файл XYZ (.xyz)")
    expect(typeOf(at(start, "D:"))).toBe("Локальний диск")
    expect(programOf(at(start, "вірш.txt"))).toBe("Блокнот")
    expect(programOf(at(start, "Мої фото"))).toBeUndefined()
  })
})

describe("location", () => {
  test("the desktop is a folder of the student's account, a drive root ends with a backslash", () => {
    expect(locationOf(start, at(start, "вірш.txt"))).toBe("C:\\Users\\Учень\\Desktop")
    expect(locationOf(start, at(start, "Мої фото/Літо/пляж.png"))).toBe("C:\\Users\\Учень\\Desktop\\Мої фото\\Літо")
    expect(locationOf(start, at(start, "D:/Мої уроки"))).toBe("D:\\")
    expect(locationOf(start, at(start, "D:/Мої уроки/монітор.jpg"))).toBe("D:\\Мої уроки")
  })

  test("a shortcut shows the full path of its object", () => {
    expect(shortcutTargetPath(start, at(start, "Фото – ярлик"))).toBe("C:\\Users\\Учень\\Desktop\\Мої фото")
  })

  test("the address bar understands the desktop path", () => {
    expect(resolveAddress(start, "C:\\Users\\Учень\\Desktop\\Мої фото")).toBe(at(start, "Мої фото").id)
    expect(resolveAddress(start, "c:/users/учень/desktop")).toBe(DESKTOP_ID)
  })
})

describe("dates and drives", () => {
  test("start items get the same dates every time, changed not before created", () => {
    const node = at(start, "вірш.txt")
    const dates = startDates(start, node)
    expect(startDates(buildState({ "вірш.txt": 1_286 }), at(buildState({ "вірш.txt": 1_286 }), "вірш.txt"))).toEqual(dates)
    expect(dates.modified).toBeGreaterThanOrEqual(dates.created)
  })

  test("Ukrainian Windows date format", () => {
    expect(formatDate(new Date(2026, 10, 18, 22, 5, 9).getTime())).toBe("18 листопада 2026 р., 22:05:09")
  })

  test("what lies on a drive takes its space", () => {
    const drive = getNode(start, driveId("D"))
    if (!drive) throw new Error("немає D:")
    const space = driveSpace(start, drive)
    expect(space.used + space.free).toBe(space.capacity)
    expect(space.used).toBe(118 * 1024 ** 3 + 204 * 1024 ** 2 + Math.ceil(2_465_792 / 4096) * 4096)
  })
})

describe("attributes", () => {
  const poem = at(start, "вірш.txt").id

  test("set and clear «Лише читання» and «Прихований»", () => {
    const set = ok(setAttributes(start, poem, { readOnly: true, hidden: true }))
    expect(at(set, "вірш.txt")).toMatchObject({ readOnly: true, hidden: true })
    const cleared = ok(setAttributes(set, poem, { readOnly: false, hidden: false }))
    expect(at(cleared, "вірш.txt").readOnly).toBeUndefined()
    expect(at(cleared, "вірш.txt").hidden).toBeUndefined()
  })

  test("a folder can be hidden but not read-only; the desktop has no attributes", () => {
    const photos = at(start, "Мої фото").id
    expect(setAttributes(start, photos, { readOnly: false, hidden: true }).ok).toBe(true)
    expect(setAttributes(start, photos, { readOnly: true, hidden: false }).ok).toBe(false)
    expect(setAttributes(start, DESKTOP_ID, { readOnly: false, hidden: true }).ok).toBe(false)
  })

  test("the change is logged and the goal checks it", () => {
    const replayed = replay(start, [{ op: "attributes", id: poem, readOnly: true, hidden: false }])
    if (!replayed.ok) throw new Error(replayed.error)
    const [readOnly, notHidden] = checkGoals(replayed.state, [
      { type: "attribute", path: "вірш.txt", readOnly: true },
      { type: "attribute", path: "вірш.txt", hidden: true }
    ])
    expect(readOnly).toMatchObject({ ok: true, text: "«вірш.txt»: лише для читання" })
    expect(notHidden?.ok).toBe(false)
    expect(checkGoals(start, [{ type: "attribute", path: "вірш.txt", readOnly: true }])[0]?.ok).toBe(false)
  })
})

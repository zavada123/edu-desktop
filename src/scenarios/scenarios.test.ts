import { describe, expect, test } from "vitest"
import { BIN_ID, childrenOf, compress, copy, create, createShortcut, DESKTOP_ID, extractAll, markOpened, driveId, findByPath, type FsResult, type FsState, move, remove, rename, restore } from "../core/fs.ts"
import { allMet, checkGoals } from "../core/goals.ts"
import { buildState } from "../core/tree.ts"
import { grade } from "../core/ops.ts"
import { scenarios } from "./index.ts"
import { referenceOps } from "./solutions.ts"

describe("scenarios", () => {
  test.each(scenarios.map((s) => [s.id, s] as const))("%s builds and is not solved at the start", (_id, scenario) => {
    const state = buildState(scenario.start, scenario.drives)
    expect(allMet(checkGoals(state, scenario.goals))).toBe(false)
  })

  test("ids are unique", () => {
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length)
  })
})

const scenario = (id: string) => {
  const found = scenarios.find((s) => s.id === id)
  if (!found) throw new Error(`немає сценарію ${id}`)
  return found
}
const step = (result: FsResult): FsState => {
  if (!result.ok) throw new Error(result.error)
  return result.state
}
const at = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`немає ${path}`)
  return node.id
}
const failed = (id: string, state: FsState) => checkGoals(state, scenario(id).goals).filter((r) => !r.ok).map((r) => r.text)

describe("5 клас, вправа 6", () => {
  const binItem = (s: FsState): string => childrenOf(s, BIN_ID)[0]?.id ?? ""
  const build = () => {
    let s = buildState(scenario("g5-exercise-6").start)
    s = step(create(s, DESKTOP_ID, "folder", "5 клас"))
    for (const name of ["Інформатика", "Українська мова", "Історія України"]) s = step(create(s, at(s, "5 клас"), "folder", name))
    return s
  }

  test("is solved only after delete and restore", () => {
    const made = build()
    expect(failed("g5-exercise-6", made)).toEqual(["Папку «5 клас» видалено в кошик і відновлено"])
    const deleted = step(remove(made, at(made, "5 клас")))
    const restored = step(restore(deleted, binItem(deleted)))
    expect(failed("g5-exercise-6", restored)).toEqual([])
  })

  test("dragging out of the bin also counts as restoring", () => {
    const made = build()
    const deleted = step(remove(made, at(made, "5 клас")))
    expect(failed("g5-exercise-6", step(move(deleted, binItem(deleted), DESKTOP_ID)))).toEqual([])
  })
})

describe("5 клас, файли за типами", () => {
  test("can be solved", () => {
    let s = buildState(scenario("g5-file-types").start)
    const sorting: Record<string, ReadonlyArray<string>> = {
      Малюнки: ["море.jpg", "кіт.png"],
      Тексти: ["реферат.docx", "нотатки.txt"],
      Музика: ["пісня.mp3", "дзвоник.wav"],
      Різне: ["оцінки.xlsx", "презентація.pptx"]
    }
    for (const [folder, files] of Object.entries(sorting)) {
      s = step(create(s, at(s, "Мої файли"), "folder", folder))
      for (const file of files) s = step(move(s, at(s, `Завантаження/${file}`), at(s, `Мої файли/${folder}`)))
    }
    expect(failed("g5-file-types", s)).toEqual([])
  })
})

describe("5 клас, папка на диску D:", () => {
  test("can be solved; a folder on the desktop does not count", () => {
    const sc = scenario("g5-drive-d-folder")
    let s = buildState(sc.start, sc.drives)
    s = step(create(s, driveId("D"), "folder", "Інформатика 5 клас"))
    for (const name of ["Вправи", "Практичні роботи"]) s = step(create(s, at(s, "D:/Інформатика 5 клас"), "folder", name))
    s = step(copy(s, at(s, "Вправа 5.docx"), at(s, "D:/Інформатика 5 клас/Вправи")))
    expect(failed("g5-drive-d-folder", s)).toEqual([])
    expect(failed("g5-drive-d-folder", step(create(s, DESKTOP_ID, "folder", "Інформатика 5 клас")))).toHaveLength(1)
  })
})

describe("5 клас, ярлики", () => {
  test("can be solved; deleting the folder instead of the shortcut is caught", () => {
    const sc = scenario("g5-shortcuts")
    let s = buildState(sc.start, sc.drives)
    s = step(createShortcut(s, at(s, "D:/Моя папка"), DESKTOP_ID))
    s = step(create(s, at(s, "D:/Моя папка"), "folder", "Проєкт"))
    const solved = step(remove(s, at(s, "Ігри – ярлик")))
    expect(failed("g5-shortcuts", solved)).toEqual([])
    const wrong = step(remove(s, at(s, "D:/Ігри")))
    expect(failed("g5-shortcuts", wrong)).toContain("Папка «Ігри» на диску D: ціла")
  })
})

describe("5 клас, практична робота 1", () => {
  test("can be solved", () => {
    const sc = scenario("g5-practical-1")
    let s = buildState(sc.start, sc.drives)
    s = step(create(s, driveId("D"), "folder", "Петренко"))
    for (const name of ["Малюнки", "Тексти", "Музика", "Різне"]) s = step(create(s, at(s, "D:/Петренко"), "folder", name))
    s = step(createShortcut(s, at(s, "D:/Петренко"), DESKTOP_ID))
    s = step(copy(s, at(s, "D:/Для учнів/осінь.jpg"), at(s, "D:/Петренко/Малюнки")))
    s = step(copy(s, at(s, "D:/Для учнів/правила.txt"), at(s, "D:/Петренко/Тексти")))
    s = step(copy(s, at(s, "D:/Для учнів/гімн.mp3"), at(s, "D:/Петренко/Музика")))
    expect(failed("g5-practical-1", s)).toEqual([])
  })
})

describe("9 клас, файлове сміття", () => {
  test("can be solved, and deleting a needed file is caught", () => {
    let s = buildState(scenario("g9-file-junk").start)
    const junk = [
      "Документи/Доповідь_v1.docx",
      "Документи/Доповідь_v2_final.docx",
      "Документи/~$Доповідь_final__final.docx",
      "Документи/звіт.tmp",
      "Документи/фото класу – копія.jpg",
      "Завантаження/реферат.docx",
      "Завантаження/setup_game.exe"
    ]
    for (const path of junk) s = step(remove(s, at(s, path)))
    s = step(rename(s, at(s, "Документи/Доповідь_final__final.docx"), "Доповідь.docx"))
    expect(failed("g9-file-junk", s)).toEqual([])
    const tooMuch = step(move(s, at(s, "Документи/реферат.docx"), BIN_ID))
    expect(failed("g9-file-junk", tooMuch)).toEqual(["У «Документи» лишилися доповідь, реферат і фото класу"])
  })
})

describe("g4-context-menu", () => {
  test("can be solved with the textbook steps", () => {
    const scenario = scenarios.find((s) => s.id === "g4-context-menu")
    if (!scenario) throw new Error("немає сценарію")
    const step = (result: FsResult): FsState => {
      if (!result.ok) throw new Error(result.error)
      return result.state
    }
    const at = (state: FsState, path: string): string => {
      const node = findByPath(state, path)
      if (!node) throw new Error(`немає ${path}`)
      return node.id
    }
    let s = buildState(scenario.start)
    s = step(create(s, DESKTOP_ID, "folder", "Моя папка"))
    s = step(create(s, at(s, "Моя папка"), "folder", "Інформатика"))
    for (const name of ["Тексти", "Картинки", "Фото"]) s = step(create(s, at(s, "Моя папка/Інформатика"), "folder", name))
    s = step(remove(s, at(s, "Моя папка/Інформатика/Фото")))
    s = step(rename(s, at(s, "Моя папка/Інформатика/Картинки"), "Малюнки"))
    s = step(copy(s, at(s, "Документи/сонце.png"), at(s, "Моя папка/Інформатика/Малюнки")))
    s = step(copy(s, at(s, "Документи/казка.txt"), at(s, "Моя папка/Інформатика/Тексти")))
    s = step(copy(s, at(s, "Документи/вірш.txt"), at(s, "Моя папка/Інформатика/Тексти")))
    s = step(move(s, at(s, "Моя папка/Інформатика/Тексти/вірш.txt"), at(s, "Моя папка/Інформатика/Малюнки")))
    expect(checkGoals(s, scenario.goals).filter((r) => !r.ok)).toEqual([])
  })
})

describe("8 клас, ZIP", () => {
  test("вправа 5 can be solved", () => {
    const sc = scenario("g8-zip")
    let s = buildState(sc.start, sc.drives)
    const nature = "D:/Розділ 2/Пункт 2.1/Природа"
    const first10 = Array.from({ length: 10 }, (_, i) => at(s, `${nature}/photo${String(i + 1).padStart(2, "0")}.jpg`))
    s = step(compress(s, first10, "nature"))
    s = step(move(s, at(s, `${nature}/nature.zip`), at(s, "D:/Моя папка")))
    for (const f of ["photo01.jpg", "photo02.jpg"]) s = step(move(s, at(s, `D:/Моя папка/nature.zip/${f}`), at(s, "D:/Моя папка")))
    expect(failed("g8-zip", s)).toEqual([])
  })

  test("practical work 2, extraction, can be solved", () => {
    const sc = scenario("g8-extract")
    let s = buildState(sc.start, sc.drives)
    const zip = "D:/Моя папка/Копія архіву/pictures.zip"
    for (let n = 12; n <= 16; n++) s = step(remove(s, at(s, `${zip}/pic${n}.png`)))
    s = step(extractAll(s, at(s, zip)))
    s = step(rename(s, at(s, "D:/Моя папка/Копія архіву/pictures"), "Мої малюнки"))
    s = step(move(s, at(s, "D:/Моя папка/Копія архіву/Мої малюнки"), at(s, "D:/Моя папка")))
    expect(failed("g8-extract", s)).toEqual([])
  })
})

describe("3 клас, відкрити файл", () => {
  test("only opening the right file counts", () => {
    const sc = scenario("g3-open-file")
    const s = buildState(sc.start, sc.drives)
    expect(failed("g3-open-file", step(markOpened(s, at(s, "Традиції – копія.docx"))))).toHaveLength(1)
    expect(failed("g3-open-file", step(markOpened(s, at(s, "D:/3 клас/Українська мова/Традиції.docx"))))).toEqual([])
  })
})

describe("4 клас, імена папок", () => {
  test("Inna and Інна can be made, In*na and NUL cannot", () => {
    let s = step(create(buildState({}), DESKTOP_ID, "folder", "Дослід"))
    for (const name of ["Inna", "Інна"]) s = step(create(s, at(s, "Дослід"), "folder", name))
    for (const name of ["In*na", "NUL"]) expect(create(s, at(s, "Дослід"), "folder", name).ok).toBe(false)
    expect(failed("g4-magic-names", s)).toEqual([])
  })
})

describe("reference solutions", () => {
  test.each(scenarios.map((s) => [s.id, s] as const))("%s: the reference log solves the task", (_id, sc) => {
    const result = grade(sc, referenceOps(sc))
    expect(result.ok && result.results.filter((r) => !r.ok).map((r) => r.text)).toEqual([])
  })
})

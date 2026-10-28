import { BIN_ID, childrenOf, findByPath, type FsState, sameName } from "../core/index.ts"
import { applyOp, type Op } from "../core/ops.ts"
import { buildState } from "../core/tree.ts"
import type { Scenario } from "./types.ts"

/**
 * Reference solutions: one correct way through each scenario. A page that grades on its server stores
 * this log with the task, so it can show that the task has a solution. Steps use paths, not ids:
 * `""` is the desktop, `D:` is a drive, `D:/Мої уроки` a folder on it.
 */
type Step =
  | { readonly do: "folder"; readonly in: string; readonly name: string }
  | { readonly do: "save"; readonly in: string; readonly name: string; readonly ext: string }
  | { readonly do: "rename"; readonly path: string; readonly name: string }
  | { readonly do: "move" | "copy" | "shortcut"; readonly path: string; readonly to: string }
  | { readonly do: "compress"; readonly paths: ReadonlyArray<string>; readonly name: string }
  | { readonly do: "extract" | "open" | "remove"; readonly path: string }
  | { readonly do: "restore"; readonly name: string }

const folder = (inPath: string, name: string): Step => ({ do: "folder", in: inPath, name })
const move = (path: string, to: string): Step => ({ do: "move", path, to })
const copy = (path: string, to: string): Step => ({ do: "copy", path, to })
const remove = (path: string): Step => ({ do: "remove", path })
const rename = (path: string, name: string): Step => ({ do: "rename", path, name })

const idAt = (state: FsState, path: string): string => {
  const node = findByPath(state, path)
  if (!node) throw new Error(`Помилка в розв'язку: немає «${path}»`)
  return node.id
}

const toOp = (state: FsState, step: Step): Op => {
  switch (step.do) {
    case "folder":
      return { op: "create", parentId: idAt(state, step.in), kind: "folder", name: step.name }
    case "save":
      return { op: "saveFile", folderId: idAt(state, step.in), name: step.name, ext: step.ext }
    case "rename":
      return { op: "rename", id: idAt(state, step.path), name: step.name }
    case "move":
    case "copy":
      return { op: step.do, id: idAt(state, step.path), targetId: idAt(state, step.to) }
    case "shortcut":
      return { op: "shortcut", id: idAt(state, step.path), parentId: idAt(state, step.to) }
    case "compress":
      return { op: "compress", ids: step.paths.map((p) => idAt(state, p)), name: step.name }
    case "extract":
      return { op: "extract", id: idAt(state, step.path) }
    case "open":
      return { op: "openFile", id: idAt(state, step.path) }
    case "remove":
      return { op: "remove", id: idAt(state, step.path) }
    case "restore": {
      const node = childrenOf(state, BIN_ID).find((n) => sameName(n.name, step.name))
      if (!node) throw new Error(`Помилка в розв'язку: у кошику немає «${step.name}»`)
      return { op: "restore", id: node.id }
    }
  }
}

const photos = (folderPath: string, from: number, to: number, name: (n: number) => string): ReadonlyArray<string> =>
  Array.from({ length: to - from + 1 }, (_, i) => `${folderPath}/${name(from + i)}`)
const pad = (n: number): string => String(n).padStart(2, "0")

const NATURE = "D:/Розділ 2/Пункт 2.1/Природа"
const PICTURES = "D:/Моя папка/Копія архіву/pictures.zip"

const steps: { readonly [scenarioId: string]: ReadonlyArray<Step> } = {
  "g3-folder-animals": [folder("", "Тварини"), move("кіт.png", "Тварини"), move("собака.png", "Тварини")],
  "g3-sort-pictures": [
    folder("", "Школа"),
    folder("", "Родина"),
    ...["Шкільні друзі.bmp", "Урок мистецтва.bmp", "Моя школа.bmp"].map((f) => move(f, "Школа")),
    ...["Мій день народження.bmp", "Моя родина.bmp"].map((f) => move(f, "Родина"))
  ],
  "g3-save-drawing": [folder("", "Мої малюнки"), { do: "save", in: "Мої малюнки", name: "Україна", ext: ".png" }],
  "g3-open-file": [{ do: "open", path: "D:/3 клас/Українська мова/Традиції.docx" }],
  "g4-copy-and-bin": [copy("Мої фото/море.jpg", "Для бабусі"), remove("чернетка.txt")],
  "g4-file-path": [copy("D:/Мої уроки/Інформатика/монітор.jpg", "")],
  "g4-context-menu": [
    folder("", "Моя папка"),
    folder("Моя папка", "Інформатика"),
    ...["Тексти", "Картинки", "Фото"].map((n) => folder("Моя папка/Інформатика", n)),
    remove("Моя папка/Інформатика/Фото"),
    rename("Моя папка/Інформатика/Картинки", "Малюнки"),
    copy("Документи/сонце.png", "Моя папка/Інформатика/Малюнки"),
    copy("Документи/казка.txt", "Моя папка/Інформатика/Тексти"),
    copy("Документи/вірш.txt", "Моя папка/Інформатика/Тексти"),
    move("Моя папка/Інформатика/Тексти/вірш.txt", "Моя папка/Інформатика/Малюнки")
  ],
  "g4-magic-names": [folder("", "Дослід"), folder("Дослід", "Inna"), folder("Дослід", "Інна")],
  "g4-save-text": [{ do: "save", in: "D:/Мої уроки", name: "Пристрої", ext: ".docx" }],
  "g4-save-image": [{ do: "save", in: "D:/Мої уроки/Література", name: "Садок", ext: ".jpg" }],
  "g5-trip-photos": [
    folder("Мої фото", "Мандрівка до лісу"),
    folder("Мої фото", "Мандрівка до моря"),
    move("Мої фото/ліс-1.jpg", "Мої фото/Мандрівка до лісу"),
    move("Мої фото/ліс-2.jpg", "Мої фото/Мандрівка до лісу"),
    move("Мої фото/море-1.jpg", "Мої фото/Мандрівка до моря"),
    rename("Мої фото/IMG_0042.jpg", "захід сонця.jpg"),
    move("Мої фото/захід сонця.jpg", "Мої фото/Мандрівка до моря"),
    remove("Мої фото/Нова папка")
  ],
  "g5-exercise-6": [
    folder("", "5 клас"),
    ...["Інформатика", "Українська мова", "Історія України"].map((n) => folder("5 клас", n)),
    remove("5 клас"),
    { do: "restore", name: "5 клас" }
  ],
  "g5-file-types": [
    ...Object.entries({
      Малюнки: ["море.jpg", "кіт.png"],
      Тексти: ["реферат.docx", "нотатки.txt"],
      Музика: ["пісня.mp3", "дзвоник.wav"],
      Різне: ["оцінки.xlsx", "презентація.pptx"]
    }).flatMap(([name, files]) => [folder("Мої файли", name), ...files.map((f) => move(`Завантаження/${f}`, `Мої файли/${name}`))])
  ],
  "g5-drive-d-folder": [
    folder("D:", "Інформатика 5 клас"),
    folder("D:/Інформатика 5 клас", "Вправи"),
    folder("D:/Інформатика 5 клас", "Практичні роботи"),
    copy("Вправа 5.docx", "D:/Інформатика 5 клас/Вправи")
  ],
  "g5-shortcuts": [
    { do: "shortcut", path: "D:/Моя папка", to: "" },
    folder("D:/Моя папка", "Проєкт"),
    remove("Ігри – ярлик")
  ],
  "g5-practical-1": [
    folder("D:", "Петренко"),
    ...["Малюнки", "Тексти", "Музика", "Різне"].map((n) => folder("D:/Петренко", n)),
    { do: "shortcut", path: "D:/Петренко", to: "" },
    copy("D:/Для учнів/осінь.jpg", "D:/Петренко/Малюнки"),
    copy("D:/Для учнів/правила.txt", "D:/Петренко/Тексти"),
    copy("D:/Для учнів/гімн.mp3", "D:/Петренко/Музика")
  ],
  "g8-zip": [
    { do: "compress", paths: photos(NATURE, 1, 10, (n) => `photo${pad(n)}.jpg`), name: "nature" },
    move(`${NATURE}/nature.zip`, "D:/Моя папка"),
    move("D:/Моя папка/nature.zip/photo01.jpg", "D:/Моя папка"),
    move("D:/Моя папка/nature.zip/photo02.jpg", "D:/Моя папка")
  ],
  "g8-extract": [
    ...photos(PICTURES, 12, 16, (n) => `pic${n}.png`).map(remove),
    { do: "extract", path: PICTURES },
    rename("D:/Моя папка/Копія архіву/pictures", "Мої малюнки"),
    move("D:/Моя папка/Копія архіву/Мої малюнки", "D:/Моя папка")
  ],
  "g9-file-junk": [
    ...[
      "Документи/Доповідь_v1.docx",
      "Документи/Доповідь_v2_final.docx",
      "Документи/~$Доповідь_final__final.docx",
      "Документи/звіт.tmp",
      "Документи/фото класу – копія.jpg",
      "Завантаження/реферат.docx",
      "Завантаження/setup_game.exe"
    ].map(remove),
    rename("Документи/Доповідь_final__final.docx", "Доповідь.docx")
  ]
}

/** The change log of the reference solution, with ids as the trainer records them. */
export const referenceOps = (scenario: Scenario): ReadonlyArray<Op> => {
  const plan = steps[scenario.id]
  if (!plan) throw new Error(`Немає розв'язку для сценарію «${scenario.id}»`)
  const ops: Op[] = []
  let state = buildState(scenario.start, scenario.drives)
  for (const step of plan) {
    const op = toOp(state, step)
    const result = applyOp(state, op)
    if (!result.ok) throw new Error(`Помилка в розв'язку «${scenario.id}»: ${result.error}`)
    ops.push(op)
    state = result.state
  }
  return ops
}

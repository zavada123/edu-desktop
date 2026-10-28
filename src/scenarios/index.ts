import type { Scenario } from "./types.ts"

export type { Scenario } from "./types.ts"

const animals: Scenario = {
  id: "g3-folder-animals",
  grade: 3,
  title: "Папка для тварин",
  large: true,
  task: ["Створи на робочому столі папку «Тварини».", "Перенеси в неї малюнки кота і собаки.", "Вірш залиш на робочому столі."],
  start: { "кіт.png": null, "собака.png": null, "вірш.txt": null, Документи: {} },
  goals: [
    { type: "exists", path: "Тварини", kind: "folder" },
    { type: "exists", path: "Тварини/кіт.png", kind: "file", text: "Кіт лежить у папці «Тварини»" },
    { type: "exists", path: "Тварини/собака.png", kind: "file", text: "Собака лежить у папці «Тварини»" },
    { type: "exists", path: "вірш.txt", kind: "file", text: "Вірш лишився на робочому столі", hint: "Вірш не треба переносити. Поверни його на робочий стіл." }
  ]
}

const grandma: Scenario = {
  id: "g4-copy-and-bin",
  grade: 4,
  title: "Фото для бабусі",
  large: true,
  task: [
    "Відкрий папку «Мої фото».",
    "Скопіюй фото «море.jpg» у папку «Для бабусі». Фото має залишитися і в «Мої фото».",
    "Видали файл «чернетка.txt» у кошик."
  ],
  start: { "Мої фото": { "ліс.jpg": null, "море.jpg": null, "гори.jpg": null }, "Для бабусі": {}, "чернетка.txt": null },
  goals: [
    { type: "exists", path: "Для бабусі/море.jpg", kind: "file", text: "У папці «Для бабусі» є «море.jpg»" },
    {
      type: "exists",
      path: "Мої фото/море.jpg",
      kind: "file",
      text: "У папці «Мої фото» теж лишилося «море.jpg»",
      hint: "Фото переміщено, а треба скопіювати. Поверни його в «Мої фото» і скористайся командою «Копіювати»."
    },
    { type: "count", folder: "Для бабусі", equals: 1, text: "У папці «Для бабусі» лише одне фото", hint: "Бабусі потрібне лише море. Прибери зайві фото." },
    { type: "inBin", name: "чернетка.txt", text: "Чернетка лежить у кошику" }
  ]
}

const trip: Scenario = {
  id: "g5-trip-photos",
  grade: 5,
  title: "Фото з мандрівок",
  task: [
    "У папці «Мої фото» створи папки «Мандрівка до лісу» і «Мандрівка до моря».",
    "Розклади фото: ліс — у першу папку, море — у другу.",
    "Перейменуй «IMG_0042.jpg» на «захід сонця.jpg» і поклади його в «Мандрівка до моря».",
    "Видали порожню папку «Нова папка»."
  ],
  start: {
    "Мої фото": { "ліс-1.jpg": null, "ліс-2.jpg": null, "море-1.jpg": null, "IMG_0042.jpg": null, "Нова папка": {} },
    Документи: { "розклад.docx": null }
  },
  goals: [
    { type: "exists", path: "Мої фото/Мандрівка до лісу", kind: "folder" },
    { type: "exists", path: "Мої фото/Мандрівка до моря", kind: "folder" },
    { type: "count", folder: "Мої фото/Мандрівка до лісу", ext: "jpg", equals: 2, text: "У «Мандрівка до лісу» 2 фото лісу" },
    {
      type: "exists",
      path: "Мої фото/Мандрівка до моря/захід сонця.jpg",
      kind: "file",
      text: "«захід сонця.jpg» лежить у «Мандрівка до моря»",
      hint: "Перевір назву: «захід сонця.jpg», маленькими літерами, з пробілом."
    },
    { type: "count", folder: "Мої фото/Мандрівка до моря", ext: "jpg", equals: 2, text: "У «Мандрівка до моря» 2 фото" },
    { type: "count", folder: "Мої фото", kind: "file", equals: 0, text: "У «Мої фото» не лишилося нерозкладених фото" },
    { type: "inBin", name: "Нова папка", text: "Порожня «Нова папка» лежить у кошику" }
  ]
}

export const scenarios: ReadonlyArray<Scenario> = [animals, grandma, trip]

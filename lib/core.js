import { $ as validateName, A as isInBin, B as resolveAddress, C as driveId, D as findByPath, E as extractAll, F as markZip, G as FORBIDDEN_CHARS, H as saveFile, I as move, J as extensionOf, K as MAX_NAME_LENGTH, L as pathOf, M as isShortcut, N as isSystem, O as getNode, P as markOpened, Q as splitExtension, R as remove, S as displayName, T as emptyState, U as shortcutTarget, V as restore, W as windowsPath, X as plural, Y as freeName, Z as sameName, _ as compress, a as grade, b as createShortcut, c as tryBuildState, d as describeGoal, f as BIN_ID, g as childrenOf, h as THIS_PC_ID, i as applyOp, j as isInside, k as isDrive, l as allMet, m as DRIVE_LETTERS, n as MAX_NODES, o as replay, p as DESKTOP_ID, q as RESERVED_NAMES, r as MAX_OPS, s as buildState, t as MAX_CREATED, u as checkGoals, v as copy, w as emptyBin, x as deleteForever, y as create, z as rename } from "./ops-Brip_Ky3.js";
var scenarios = [
	{
		id: "g3-folder-animals",
		grade: 3,
		title: "Папка для тварин",
		large: true,
		task: [
			"Створи на робочому столі папку «Тварини».",
			"Перенеси в неї малюнки кота і собаки.",
			"Вірш залиш на робочому столі."
		],
		start: {
			"кіт.png": null,
			"собака.png": null,
			"вірш.txt": null,
			Документи: {}
		},
		goals: [
			{
				type: "exists",
				path: "Тварини",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Тварини/кіт.png",
				kind: "file",
				text: "Кіт лежить у папці «Тварини»"
			},
			{
				type: "exists",
				path: "Тварини/собака.png",
				kind: "file",
				text: "Собака лежить у папці «Тварини»"
			},
			{
				type: "exists",
				path: "вірш.txt",
				kind: "file",
				text: "Вірш лишився на робочому столі",
				hint: "Вірш не треба переносити. Поверни його на робочий стіл."
			}
		]
	},
	{
		id: "g3-sort-pictures",
		grade: 3,
		title: "Розклади малюнки по папках",
		large: true,
		task: [
			"Створи на робочому столі дві папки: «Школа» і «Родина».",
			"У папку «Школа» перенеси малюнки «Шкільні друзі», «Урок мистецтва» і «Моя школа».",
			"У папку «Родина» перенеси малюнки «Мій день народження» і «Моя родина»."
		],
		start: {
			"Шкільні друзі.bmp": null,
			"Мій день народження.bmp": null,
			"Моя родина.bmp": null,
			"Урок мистецтва.bmp": null,
			"Моя школа.bmp": null
		},
		goals: [
			{
				type: "exists",
				path: "Школа",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Родина",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Школа/Шкільні друзі.bmp",
				kind: "file",
				text: "«Шкільні друзі» — у папці «Школа»"
			},
			{
				type: "exists",
				path: "Школа/Урок мистецтва.bmp",
				kind: "file",
				text: "«Урок мистецтва» — у папці «Школа»"
			},
			{
				type: "exists",
				path: "Школа/Моя школа.bmp",
				kind: "file",
				text: "«Моя школа» — у папці «Школа»"
			},
			{
				type: "exists",
				path: "Родина/Мій день народження.bmp",
				kind: "file",
				text: "«Мій день народження» — у папці «Родина»"
			},
			{
				type: "exists",
				path: "Родина/Моя родина.bmp",
				kind: "file",
				text: "«Моя родина» — у папці «Родина»"
			}
		]
	},
	{
		id: "g3-save-drawing",
		grade: 3,
		title: "Збережи малюнок у папці",
		large: true,
		app: { kind: "paint" },
		task: [
			"Створи на робочому столі папку «Мої малюнки». Щоб побачити робочий стіл, згорни Paint кнопкою «─».",
			"Поверни Paint кнопкою на панелі задач і намалюй малюнок «Україна — мій дім».",
			"Збережи малюнок: «Файл» → «Зберегти як». Відкрий папку «Мої малюнки», введи ім'я файлу «Україна» і натисни «Зберегти»."
		],
		start: { "вірш.txt": null },
		goals: [
			{
				type: "exists",
				path: "Мої малюнки",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Мої малюнки/Україна.png",
				kind: "file",
				text: "Малюнок «Україна» збережено в папці «Мої малюнки»",
				hint: "У вікні «Зберегти як» спершу відкрий папку «Мої малюнки», потім введи ім'я «Україна»."
			},
			{
				type: "absent",
				path: "Україна.png",
				text: "Малюнок не лежить просто на робочому столі",
				hint: "Малюнок збережено на робочий стіл. Перемісти його в «Мої малюнки»."
			}
		]
	},
	{
		id: "g3-open-file",
		grade: 3,
		title: "Відкрий файл з минулого уроку",
		large: true,
		app: { kind: "text" },
		task: [
			"У текстовому редакторі відкрий файл, опрацьований на минулому уроці: «Файл» → «Відкрити».",
			"У вікні «Відкрити» вибери «Цей ПК», потім диск D:, папку «3 клас» і папку «Українська мова».",
			"Вибери файл «Традиції.docx» і натисни «Відкрити».",
			"Відредагуй текст і збережи його: «Файл» → «Зберегти»."
		],
		start: { "Традиції – копія.docx": null },
		drives: {
			"C:": { Програми: {} },
			"D:": { "3 клас": {
				"Українська мова": {
					"Традиції.docx": null,
					"Вірш.docx": null
				},
				Математика: { "Задачі.docx": null }
			} }
		},
		goals: [{
			type: "opened",
			path: "D:/3 клас/Українська мова/Традиції.docx",
			text: "Відкрито файл D:\\3 клас\\Українська мова\\Традиції.docx",
			hint: "Потрібен саме файл на диску D: у папці «Українська мова», а не копія на робочому столі."
		}]
	},
	{
		id: "g4-copy-and-bin",
		grade: 4,
		title: "Фото для бабусі",
		large: true,
		task: [
			"Відкрий папку «Мої фото».",
			"Скопіюй фото «море.jpg» у папку «Для бабусі». Фото має залишитися і в «Мої фото».",
			"Видали файл «чернетка.txt» у кошик."
		],
		start: {
			"Мої фото": {
				"ліс.jpg": null,
				"море.jpg": null,
				"гори.jpg": null
			},
			"Для бабусі": {},
			"чернетка.txt": null
		},
		goals: [
			{
				type: "exists",
				path: "Для бабусі/море.jpg",
				kind: "file",
				text: "У папці «Для бабусі» є «море.jpg»"
			},
			{
				type: "exists",
				path: "Мої фото/море.jpg",
				kind: "file",
				text: "У папці «Мої фото» теж лишилося «море.jpg»",
				hint: "Фото переміщено, а треба скопіювати. Поверни його в «Мої фото» і скористайся командою «Копіювати»."
			},
			{
				type: "count",
				folder: "Для бабусі",
				equals: 1,
				text: "У папці «Для бабусі» лише одне фото",
				hint: "Бабусі потрібне лише море. Прибери зайві фото."
			},
			{
				type: "inBin",
				name: "чернетка.txt",
				text: "Чернетка лежить у кошику"
			}
		]
	},
	{
		id: "g4-file-path",
		grade: 4,
		title: "Шлях до файлу",
		large: true,
		task: ["Відкрий «Цей ПК» і знайди файл за шляхом D:\\Мої уроки\\Інформатика\\монітор.jpg.", "Скопіюй цей файл на робочий стіл. У папці «Інформатика» він теж має залишитися."],
		start: { Фото: {
			"Свято 1 Вересня": {},
			"Відпочинок у лісі": {}
		} },
		drives: {
			"C:": {
				Програми: {},
				Користувачі: {}
			},
			"D:": { "Мої уроки": {
				Математика: { "задачі.docx": null },
				Інформатика: {
					"комп'ютер.pptx": null,
					"монітор.jpg": null
				}
			} }
		},
		goals: [{
			type: "exists",
			path: "монітор.jpg",
			kind: "file",
			text: "«монітор.jpg» є на робочому столі"
		}, {
			type: "exists",
			path: "D:/Мої уроки/Інформатика/монітор.jpg",
			kind: "file",
			text: "«монітор.jpg» лишився в папці «Інформатика»",
			hint: "Файл переміщено, а треба скопіювати. Поверни його й скористайся командою «Копіювати»."
		}]
	},
	{
		id: "g4-context-menu",
		grade: 4,
		title: "Команди контекстного меню",
		large: true,
		task: [
			"Створи на робочому столі папку «Моя папка», у ній — папку «Інформатика».",
			"У папці «Інформатика» створи три папки: «Тексти», «Картинки», «Фото».",
			"Видали папку «Фото». Перейменуй папку «Картинки» на «Малюнки».",
			"З папки «Документи» скопіюй «сонце.png» у «Малюнки», а «казка.txt» і «вірш.txt» — у «Тексти».",
			"Перемісти «вірш.txt» з папки «Тексти» в папку «Малюнки»."
		],
		start: { Документи: {
			"казка.txt": null,
			"вірш.txt": null,
			"лист.txt": null,
			"сонце.png": null,
			"кіт.png": null
		} },
		goals: [
			{
				type: "exists",
				path: "Моя папка/Інформатика",
				kind: "folder"
			},
			{
				type: "inBin",
				name: "Фото",
				text: "Папка «Фото» лежить у кошику"
			},
			{
				type: "absent",
				path: "Моя папка/Інформатика/Картинки",
				text: "Папки «Картинки» більше немає (її перейменовано)"
			},
			{
				type: "exists",
				path: "Моя папка/Інформатика/Малюнки/сонце.png",
				kind: "file",
				text: "«сонце.png» — у папці «Малюнки»"
			},
			{
				type: "exists",
				path: "Моя папка/Інформатика/Тексти/казка.txt",
				kind: "file",
				text: "«казка.txt» — у папці «Тексти»"
			},
			{
				type: "exists",
				path: "Моя папка/Інформатика/Малюнки/вірш.txt",
				kind: "file",
				text: "«вірш.txt» переміщено в «Малюнки»"
			},
			{
				type: "absent",
				path: "Моя папка/Інформатика/Тексти/вірш.txt",
				text: "У папці «Тексти» вже немає «вірш.txt»"
			},
			{
				type: "count",
				folder: "Документи",
				kind: "file",
				equals: 5,
				text: "У «Документи» лишилися всі 5 файлів",
				hint: "Файли треба було копіювати, а не переміщувати. Натисни «Почати спочатку»."
			}
		]
	},
	{
		id: "g4-magic-names",
		grade: 4,
		title: "Дослідницька лабораторія: імена папок",
		large: true,
		task: [
			"Створи на робочому столі папку «Дослід».",
			"Відкрий її і спробуй створити в ній чотири папки з іменами: Inna, Інна, In*na, NUL.",
			"Які папки вдалося створити? Прочитай, що пише тренажер, коли ім'я не підходить.",
			"Чи будь-яке ім'я можна надати файлу або папці? Поясни чому."
		],
		start: {},
		goals: [
			{
				type: "exists",
				path: "Дослід",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Дослід/Inna",
				kind: "folder",
				text: "Папку Inna створено"
			},
			{
				type: "exists",
				path: "Дослід/Інна",
				kind: "folder",
				text: "Папку Інна створено"
			},
			{
				type: "count",
				folder: "Дослід",
				kind: "folder",
				equals: 2,
				text: "У папці «Дослід» лише дві папки: In*na і NUL створити не можна",
				hint: "Перейменуй або видали зайві папки: «Нова папка» не потрібна. In*na і NUL створити неможливо."
			}
		]
	},
	{
		id: "g4-save-text",
		grade: 4,
		title: "Збережи текст на диск D:",
		large: true,
		app: { kind: "text" },
		task: [
			"У текстовому редакторі напиши назви запам'ятовуючих пристроїв, які ти знаєш.",
			"Виконай команду «Файл» → «Зберегти як».",
			"У вікні, що відкрилося, вибери «Цей ПК», потім диск D: і папку «Мої уроки».",
			"Введи ім'я файлу «Пристрої» і натисни «Зберегти»."
		],
		start: {},
		drives: {
			"C:": { Програми: {} },
			"D:": {
				"Мої уроки": { Математика: {} },
				Ігри: {}
			}
		},
		goals: [{
			type: "exists",
			path: "D:/Мої уроки/Пристрої.docx",
			kind: "file",
			text: "Файл «Пристрої.docx» збережено на диску D: у папці «Мої уроки»",
			hint: "Перевір папку: «Цей ПК» → «Локальний диск (D:)» → «Мої уроки». І ім'я: «Пристрої»."
		}]
	},
	{
		id: "g4-save-image",
		grade: 4,
		title: "Збережи зображення з інтернету",
		large: true,
		app: {
			kind: "browser",
			fileName: "садок вишневий"
		},
		task: [
			"У браузері знайдено зображення до вірша «Садок вишневий коло хати».",
			"Клацни зображення правою кнопкою миші (на телефоні — натисни й потримай) і вибери «Зберегти зображення як…».",
			"У вікні, що відкрилося, вибери папку «Література» на диску D: (D:\\Мої уроки\\Література).",
			"Введи ім'я файлу «Садок» і натисни «Зберегти»."
		],
		start: {},
		drives: {
			"C:": { Програми: {} },
			"D:": { "Мої уроки": {
				Література: { "вірш.docx": null },
				Математика: {}
			} }
		},
		goals: [{
			type: "exists",
			path: "D:/Мої уроки/Література/Садок.jpg",
			kind: "file",
			text: "Зображення «Садок.jpg» збережено в папці «Література»",
			hint: "Відкрий у вікні збереження «Цей ПК» → D: → «Мої уроки» → «Література» і введи ім'я «Садок»."
		}]
	},
	{
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
			"Мої фото": {
				"ліс-1.jpg": null,
				"ліс-2.jpg": null,
				"море-1.jpg": null,
				"IMG_0042.jpg": null,
				"Нова папка": {}
			},
			Документи: { "розклад.docx": null }
		},
		goals: [
			{
				type: "exists",
				path: "Мої фото/Мандрівка до лісу",
				kind: "folder"
			},
			{
				type: "exists",
				path: "Мої фото/Мандрівка до моря",
				kind: "folder"
			},
			{
				type: "count",
				folder: "Мої фото/Мандрівка до лісу",
				ext: "jpg",
				equals: 2,
				text: "У «Мандрівка до лісу» 2 фото лісу"
			},
			{
				type: "exists",
				path: "Мої фото/Мандрівка до моря/захід сонця.jpg",
				kind: "file",
				text: "«захід сонця.jpg» лежить у «Мандрівка до моря»",
				hint: "Перевір назву: «захід сонця.jpg», маленькими літерами, з пробілом."
			},
			{
				type: "count",
				folder: "Мої фото/Мандрівка до моря",
				ext: "jpg",
				equals: 2,
				text: "У «Мандрівка до моря» 2 фото"
			},
			{
				type: "count",
				folder: "Мої фото",
				kind: "file",
				equals: 0,
				text: "У «Мої фото» не лишилося нерозкладених фото"
			},
			{
				type: "inBin",
				name: "Нова папка",
				text: "Порожня «Нова папка» лежить у кошику"
			}
		]
	},
	{
		id: "g5-exercise-6",
		grade: 5,
		title: "Вправа 6: папка «5 клас»",
		task: [
			"Створи на робочому столі папку «5 клас».",
			"Відкрий її і створи в ній три папки з назвами навчальних предметів, наприклад «Інформатика», «Українська мова», «Історія України».",
			"Закрий вікно папки. Видали папку «5 клас» у кошик.",
			"Відкрий «Кошик» і віднови папку «5 клас».",
			"Відкрий папку «5 клас»: чи відновилися папки всередині?"
		],
		start: {
			Документи: {},
			"розклад уроків.docx": null
		},
		goals: [
			{
				type: "exists",
				path: "5 клас",
				kind: "folder",
				text: "На робочому столі є папка «5 клас»"
			},
			{
				type: "count",
				folder: "5 клас",
				kind: "folder",
				equals: 3,
				text: "У папці «5 клас» три папки предметів",
				hint: "Відкрий «5 клас» і порахуй папки: їх має бути рівно три."
			},
			{
				type: "restored",
				path: "5 клас",
				text: "Папку «5 клас» видалено в кошик і відновлено"
			}
		]
	},
	{
		id: "g5-file-types",
		grade: 5,
		title: "Розклади файли за типами",
		task: [
			"Відкрий папку «Мої файли». У ній створи папки «Малюнки», «Тексти», «Музика», «Різне».",
			"Розклади файли з папки «Завантаження» за розширенням: зображення (.jpg, .png) — у «Малюнки», тексти (.txt, .docx) — у «Тексти», звуки (.mp3, .wav) — у «Музика», усе інше — у «Різне».",
			"Папка «Завантаження» має залишитися порожньою."
		],
		start: {
			"Мої файли": {},
			Завантаження: {
				"море.jpg": null,
				"кіт.png": null,
				"пісня.mp3": null,
				"дзвоник.wav": null,
				"реферат.docx": null,
				"нотатки.txt": null,
				"оцінки.xlsx": null,
				"презентація.pptx": null
			}
		},
		goals: [
			{
				type: "count",
				folder: "Мої файли",
				kind: "folder",
				equals: 4,
				text: "У «Мої файли» чотири папки"
			},
			{
				type: "exists",
				path: "Мої файли/Малюнки/море.jpg",
				kind: "file",
				text: "«море.jpg» — у «Малюнки»"
			},
			{
				type: "exists",
				path: "Мої файли/Малюнки/кіт.png",
				kind: "file",
				text: "«кіт.png» — у «Малюнки»"
			},
			{
				type: "exists",
				path: "Мої файли/Тексти/реферат.docx",
				kind: "file",
				text: "«реферат.docx» — у «Тексти»"
			},
			{
				type: "exists",
				path: "Мої файли/Тексти/нотатки.txt",
				kind: "file",
				text: "«нотатки.txt» — у «Тексти»"
			},
			{
				type: "exists",
				path: "Мої файли/Музика/пісня.mp3",
				kind: "file",
				text: "«пісня.mp3» — у «Музика»"
			},
			{
				type: "exists",
				path: "Мої файли/Музика/дзвоник.wav",
				kind: "file",
				text: "«дзвоник.wav» — у «Музика»"
			},
			{
				type: "count",
				folder: "Мої файли/Різне",
				kind: "file",
				equals: 2,
				text: "У «Різне» — таблиця й презентація",
				hint: ".xlsx — це таблиця Excel, .pptx — презентація. Вони не малюнки, не тексти й не музика."
			},
			{
				type: "count",
				folder: "Завантаження",
				equals: 0,
				text: "Папка «Завантаження» порожня"
			}
		]
	},
	{
		id: "g5-drive-d-folder",
		grade: 5,
		title: "Своя папка на диску D:",
		task: [
			"Відкрий «Цей ПК» і диск D:.",
			"Створи на диску D: папку «Інформатика 5 клас».",
			"У ній створи дві папки: «Вправи» і «Практичні роботи».",
			"Скопіюй файл «Вправа 5.docx» з робочого стола в папку «Вправи». На робочому столі він теж має залишитися."
		],
		start: {
			"Вправа 5.docx": null,
			"фото.jpg": null
		},
		drives: {
			"C:": {
				Програми: {},
				Користувачі: {}
			},
			"D:": {
				Ігри: {},
				Музика: {}
			}
		},
		goals: [
			{
				type: "exists",
				path: "D:/Інформатика 5 клас",
				kind: "folder",
				text: "На диску D: є папка «Інформатика 5 клас»"
			},
			{
				type: "exists",
				path: "D:/Інформатика 5 клас/Вправи",
				kind: "folder"
			},
			{
				type: "exists",
				path: "D:/Інформатика 5 клас/Практичні роботи",
				kind: "folder"
			},
			{
				type: "exists",
				path: "D:/Інформатика 5 клас/Вправи/Вправа 5.docx",
				kind: "file",
				text: "«Вправа 5.docx» — у папці «Вправи»"
			},
			{
				type: "exists",
				path: "Вправа 5.docx",
				kind: "file",
				text: "«Вправа 5.docx» лишилася на робочому столі",
				hint: "Файл переміщено, а треба скопіювати. Поверни його й скористайся командою «Копіювати»."
			},
			{
				type: "absent",
				path: "Інформатика 5 клас",
				text: "Папку створено на диску D:, а не на робочому столі",
				hint: "Папка має бути на диску D:. Перемісти її туди через «Вирізати» і «Вставити»."
			}
		]
	},
	{
		id: "g5-shortcuts",
		grade: 5,
		title: "Ярлики",
		task: [
			"На диску D: є папка «Моя папка». Створи її ярлик на робочому столі: права кнопка миші на папці → «Надіслати» → «Робочий стіл (створити ярлик)».",
			"Двічі клацни ярлик і в папці, що відкрилася, створи папку «Проєкт».",
			"На робочому столі є старий ярлик «Ігри – ярлик». Видали його в кошик.",
			"Відкрий диск D: і перевір, що папка «Ігри» з іграми лишилася: видалення ярлика не знищує сам об'єкт."
		],
		start: {
			"Ігри – ярлик": "D:/Ігри",
			"вірш.txt": null
		},
		drives: {
			"C:": { Програми: {} },
			"D:": {
				"Моя папка": { "нотатки.txt": null },
				Ігри: {
					"шахи.exe": null,
					"пазли.exe": null
				}
			}
		},
		goals: [
			{
				type: "shortcut",
				folder: "",
				target: "D:/Моя папка",
				text: "На робочому столі є ярлик «Моєї папки»"
			},
			{
				type: "exists",
				path: "D:/Моя папка/Проєкт",
				kind: "folder",
				text: "У «Моїй папці» на диску D: є папка «Проєкт»",
				hint: "Відкрий «Мою папку» через ярлик і створи «Проєкт» усередині, а не на робочому столі."
			},
			{
				type: "inBin",
				name: "Ігри – ярлик",
				text: "Старий ярлик «Ігри – ярлик» лежить у кошику"
			},
			{
				type: "count",
				folder: "D:/Ігри",
				equals: 2,
				text: "Папка «Ігри» на диску D: ціла",
				hint: "Видаляти треба лише ярлик на робочому столі. Віднови папку «Ігри» або її файли з кошика."
			}
		]
	},
	{
		id: "g5-practical-1",
		grade: 5,
		title: "Практична робота 1",
		task: [
			"Відкрий «Цей ПК» → диск D: і створи власну папку «Петренко» (у класі назви її своїм прізвищем).",
			"У папці «Петренко» створи папки «Малюнки», «Тексти», «Музика», «Різне».",
			"Створи на робочому столі ярлик папки «Петренко» і відкрий її за допомогою ярлика.",
			"Відкрий папку «Малюнки», згорни її на панель завдань, потім розгорни на весь екран і закрий.",
			"З папки D:\\Для учнів скопіюй малюнок у «Малюнки», текстовий файл у «Тексти», музичний файл у «Музика»."
		],
		start: { "Розклад.docx": null },
		drives: {
			"C:": { Програми: {} },
			"D:": { "Для учнів": {
				"осінь.jpg": null,
				"правила.txt": null,
				"гімн.mp3": null
			} }
		},
		goals: [
			{
				type: "exists",
				path: "D:/Петренко",
				kind: "folder",
				text: "На диску D: є папка «Петренко»"
			},
			{
				type: "count",
				folder: "D:/Петренко",
				kind: "folder",
				equals: 4,
				text: "У «Петренко» чотири папки: Малюнки, Тексти, Музика, Різне"
			},
			{
				type: "shortcut",
				folder: "",
				target: "D:/Петренко",
				text: "На робочому столі є ярлик папки «Петренко»"
			},
			{
				type: "exists",
				path: "D:/Петренко/Малюнки/осінь.jpg",
				kind: "file",
				text: "Малюнок скопійовано в «Малюнки»"
			},
			{
				type: "exists",
				path: "D:/Петренко/Тексти/правила.txt",
				kind: "file",
				text: "Текстовий файл скопійовано в «Тексти»"
			},
			{
				type: "exists",
				path: "D:/Петренко/Музика/гімн.mp3",
				kind: "file",
				text: "Музичний файл скопійовано в «Музика»"
			},
			{
				type: "count",
				folder: "D:/Для учнів",
				equals: 3,
				text: "У папці «Для учнів» лишилися всі файли",
				hint: "Файли треба копіювати, а не переміщувати: вони потрібні й іншим учням."
			}
		]
	},
	{
		id: "g8-zip",
		grade: 8,
		title: "Стиснута ZIP-папка",
		task: [
			"Відкрий папку D:\\Розділ 2\\Пункт 2.1\\Природа.",
			"Виділи перші 10 файлів (photo01–photo10): клацни перший, потім із Shift — десятий.",
			"Створи з них архів: права кнопка миші → «Надіслати» → «Стиснута ZIP-папка». Назви архів nature.",
			"Перемісти nature.zip у свою папку D:\\Моя папка.",
			"Відкрий архів і перемісти з нього у свою папку перші два файли (photo01 і photo02)."
		],
		start: {},
		drives: {
			"C:": { Програми: {} },
			"D:": {
				"Розділ 2": { "Пункт 2.1": { Природа: {
					"photo01.jpg": null,
					"photo02.jpg": null,
					"photo03.jpg": null,
					"photo04.jpg": null,
					"photo05.jpg": null,
					"photo06.jpg": null,
					"photo07.jpg": null,
					"photo08.jpg": null,
					"photo09.jpg": null,
					"photo10.jpg": null,
					"photo11.jpg": null,
					"photo12.jpg": null
				} } },
				"Моя папка": {}
			}
		},
		goals: [
			{
				type: "exists",
				path: "D:/Моя папка/nature.zip",
				kind: "zip",
				text: "У «Моїй папці» є архів nature.zip"
			},
			{
				type: "count",
				folder: "D:/Моя папка/nature.zip",
				equals: 8,
				text: "В архіві лишилося 8 файлів",
				hint: "В архів мали потрапити 10 файлів (photo01–photo10), а два з них треба перемістити в «Мою папку»."
			},
			{
				type: "exists",
				path: "D:/Моя папка/photo01.jpg",
				kind: "file",
				text: "photo01.jpg переміщено з архіву в «Мою папку»"
			},
			{
				type: "exists",
				path: "D:/Моя папка/photo02.jpg",
				kind: "file",
				text: "photo02.jpg переміщено з архіву в «Мою папку»"
			},
			{
				type: "absent",
				path: "D:/Моя папка/nature.zip/photo11.jpg",
				text: "В архіві немає зайвих файлів (photo11, photo12)"
			},
			{
				type: "count",
				folder: "D:/Розділ 2/Пункт 2.1/Природа",
				equals: 12,
				text: "У папці «Природа» лишилися всі 12 файлів",
				hint: "Стиснення робить копії, оригінали мають лишитися на місці."
			}
		]
	},
	{
		id: "g8-extract",
		grade: 8,
		title: "Видобути файли з архіву",
		task: [
			"Відкрий папку D:\\Моя папка\\Копія архіву. У ній лежить архів pictures.zip.",
			"Відкрий архів і видали з нього останні п'ять файлів (pic12–pic16).",
			"Закрий архів. Клацни його правою кнопкою миші → «Видобути все…».",
			"Перейменуй створену папку pictures на «Мої малюнки» і перемісти її в D:\\Моя папка."
		],
		start: {},
		drives: {
			"C:": { Програми: {} },
			"D:": { "Моя папка": { "Копія архіву": { "pictures.zip": {
				"pic01.png": null,
				"pic02.png": null,
				"pic03.png": null,
				"pic04.png": null,
				"pic05.png": null,
				"pic06.png": null,
				"pic07.png": null,
				"pic08.png": null,
				"pic09.png": null,
				"pic10.png": null,
				"pic11.png": null,
				"pic12.png": null,
				"pic13.png": null,
				"pic14.png": null,
				"pic15.png": null,
				"pic16.png": null
			} } } }
		},
		goals: [
			{
				type: "count",
				folder: "D:/Моя папка/Копія архіву/pictures.zip",
				equals: 11,
				text: "В архіві лишилося 11 файлів"
			},
			{
				type: "exists",
				path: "D:/Моя папка/Мої малюнки",
				kind: "folder",
				text: "У «Моїй папці» є папка «Мої малюнки»"
			},
			{
				type: "count",
				folder: "D:/Моя папка/Мої малюнки",
				equals: 11,
				text: "У «Мої малюнки» видобуто 11 файлів",
				hint: "Спершу видали з архіву 5 останніх файлів, потім «Видобути все…»."
			}
		]
	},
	{
		id: "g9-file-junk",
		grade: 9,
		title: "Прибери файлове сміття",
		task: [
			"Переглянь папки «Документи» і «Завантаження»: у них накопичилося файлове сміття.",
			"Видали в кошик тимчасові файли: .tmp і ті, що починаються з ~$.",
			"Видали старі версії доповіді (_v1 і _v2_final) та дублікати: «– копія» і другий «реферат.docx» у «Завантаження».",
			"Видали інсталятор setup_game.exe, він уже не потрібен.",
			"Останню версію «Доповідь_final__final.docx» перейменуй на «Доповідь.docx». Потрібні файли не видаляй."
		],
		start: {
			Документи: {
				"Доповідь_v1.docx": null,
				"Доповідь_v2_final.docx": null,
				"Доповідь_final__final.docx": null,
				"~$Доповідь_final__final.docx": null,
				"реферат.docx": null,
				"фото класу.jpg": null,
				"фото класу – копія.jpg": null,
				"звіт.tmp": null
			},
			Завантаження: {
				"setup_game.exe": null,
				"реферат.docx": null,
				"розклад дзвінків.pdf": null
			}
		},
		goals: [
			{
				type: "exists",
				path: "Документи/Доповідь.docx",
				kind: "file",
				text: "Є «Доповідь.docx» (остання версія)"
			},
			{
				type: "absent",
				path: "Документи/Доповідь_v1.docx",
				text: "Стару версію _v1 видалено"
			},
			{
				type: "absent",
				path: "Документи/Доповідь_v2_final.docx",
				text: "Стару версію _v2_final видалено"
			},
			{
				type: "absent",
				path: "Документи/~$Доповідь_final__final.docx",
				text: "Тимчасовий файл ~$ видалено"
			},
			{
				type: "absent",
				path: "Документи/звіт.tmp",
				text: "Тимчасовий файл .tmp видалено"
			},
			{
				type: "absent",
				path: "Документи/фото класу – копія.jpg",
				text: "Дублікат фото видалено"
			},
			{
				type: "absent",
				path: "Завантаження/реферат.docx",
				text: "Дублікат реферату в «Завантаження» видалено"
			},
			{
				type: "absent",
				path: "Завантаження/setup_game.exe",
				text: "Непотрібний інсталятор видалено"
			},
			{
				type: "count",
				folder: "Документи",
				equals: 3,
				text: "У «Документи» лишилися доповідь, реферат і фото класу",
				hint: "Потрібні файли: «Доповідь.docx», «реферат.docx», «фото класу.jpg». Якщо зайве потрапило в кошик, віднови його."
			},
			{
				type: "exists",
				path: "Завантаження/розклад дзвінків.pdf",
				kind: "file",
				text: "Розклад дзвінків лишився",
				hint: "Розклад дзвінків потрібен. Віднови його з кошика."
			}
		]
	}
];
// src/scenarios/solutions.ts
var folder = (inPath, name) => ({
	do: "folder",
	in: inPath,
	name
});
var move$1 = (path, to) => ({
	do: "move",
	path,
	to
});
var copy$1 = (path, to) => ({
	do: "copy",
	path,
	to
});
var remove$1 = (path) => ({
	do: "remove",
	path
});
var rename$1 = (path, name) => ({
	do: "rename",
	path,
	name
});
var idAt = (state, path) => {
	const node = findByPath(state, path);
	if (!node) throw new Error(`Помилка в розв'язку: немає «${path}»`);
	return node.id;
};
var toOp = (state, step) => {
	switch (step.do) {
		case "folder": return {
			op: "create",
			parentId: idAt(state, step.in),
			kind: "folder",
			name: step.name
		};
		case "save": return {
			op: "saveFile",
			folderId: idAt(state, step.in),
			name: step.name,
			ext: step.ext
		};
		case "rename": return {
			op: "rename",
			id: idAt(state, step.path),
			name: step.name
		};
		case "move":
		case "copy": return {
			op: step.do,
			id: idAt(state, step.path),
			targetId: idAt(state, step.to)
		};
		case "shortcut": return {
			op: "shortcut",
			id: idAt(state, step.path),
			parentId: idAt(state, step.to)
		};
		case "compress": return {
			op: "compress",
			ids: step.paths.map((p) => idAt(state, p)),
			name: step.name
		};
		case "extract": return {
			op: "extract",
			id: idAt(state, step.path)
		};
		case "open": return {
			op: "openFile",
			id: idAt(state, step.path)
		};
		case "remove": return {
			op: "remove",
			id: idAt(state, step.path)
		};
		case "restore": {
			const node = childrenOf(state, "bin").find((n) => sameName(n.name, step.name));
			if (!node) throw new Error(`Помилка в розв'язку: у кошику немає «${step.name}»`);
			return {
				op: "restore",
				id: node.id
			};
		}
	}
};
var photos = (folderPath, from, to, name) => Array.from({ length: to - from + 1 }, (_, i) => `${folderPath}/${name(from + i)}`);
var pad = (n) => String(n).padStart(2, "0");
var NATURE = "D:/Розділ 2/Пункт 2.1/Природа";
var PICTURES = "D:/Моя папка/Копія архіву/pictures.zip";
var steps = {
	"g3-folder-animals": [
		folder("", "Тварини"),
		move$1("кіт.png", "Тварини"),
		move$1("собака.png", "Тварини")
	],
	"g3-sort-pictures": [
		folder("", "Школа"),
		folder("", "Родина"),
		...[
			"Шкільні друзі.bmp",
			"Урок мистецтва.bmp",
			"Моя школа.bmp"
		].map((f) => move$1(f, "Школа")),
		...["Мій день народження.bmp", "Моя родина.bmp"].map((f) => move$1(f, "Родина"))
	],
	"g3-save-drawing": [folder("", "Мої малюнки"), {
		do: "save",
		in: "Мої малюнки",
		name: "Україна",
		ext: ".png"
	}],
	"g3-open-file": [{
		do: "open",
		path: "D:/3 клас/Українська мова/Традиції.docx"
	}],
	"g4-copy-and-bin": [copy$1("Мої фото/море.jpg", "Для бабусі"), remove$1("чернетка.txt")],
	"g4-file-path": [copy$1("D:/Мої уроки/Інформатика/монітор.jpg", "")],
	"g4-context-menu": [
		folder("", "Моя папка"),
		folder("Моя папка", "Інформатика"),
		...[
			"Тексти",
			"Картинки",
			"Фото"
		].map((n) => folder("Моя папка/Інформатика", n)),
		remove$1("Моя папка/Інформатика/Фото"),
		rename$1("Моя папка/Інформатика/Картинки", "Малюнки"),
		copy$1("Документи/сонце.png", "Моя папка/Інформатика/Малюнки"),
		copy$1("Документи/казка.txt", "Моя папка/Інформатика/Тексти"),
		copy$1("Документи/вірш.txt", "Моя папка/Інформатика/Тексти"),
		move$1("Моя папка/Інформатика/Тексти/вірш.txt", "Моя папка/Інформатика/Малюнки")
	],
	"g4-magic-names": [
		folder("", "Дослід"),
		folder("Дослід", "Inna"),
		folder("Дослід", "Інна")
	],
	"g4-save-text": [{
		do: "save",
		in: "D:/Мої уроки",
		name: "Пристрої",
		ext: ".docx"
	}],
	"g4-save-image": [{
		do: "save",
		in: "D:/Мої уроки/Література",
		name: "Садок",
		ext: ".jpg"
	}],
	"g5-trip-photos": [
		folder("Мої фото", "Мандрівка до лісу"),
		folder("Мої фото", "Мандрівка до моря"),
		move$1("Мої фото/ліс-1.jpg", "Мої фото/Мандрівка до лісу"),
		move$1("Мої фото/ліс-2.jpg", "Мої фото/Мандрівка до лісу"),
		move$1("Мої фото/море-1.jpg", "Мої фото/Мандрівка до моря"),
		rename$1("Мої фото/IMG_0042.jpg", "захід сонця.jpg"),
		move$1("Мої фото/захід сонця.jpg", "Мої фото/Мандрівка до моря"),
		remove$1("Мої фото/Нова папка")
	],
	"g5-exercise-6": [
		folder("", "5 клас"),
		...[
			"Інформатика",
			"Українська мова",
			"Історія України"
		].map((n) => folder("5 клас", n)),
		remove$1("5 клас"),
		{
			do: "restore",
			name: "5 клас"
		}
	],
	"g5-file-types": [...Object.entries({
		Малюнки: ["море.jpg", "кіт.png"],
		Тексти: ["реферат.docx", "нотатки.txt"],
		Музика: ["пісня.mp3", "дзвоник.wav"],
		Різне: ["оцінки.xlsx", "презентація.pptx"]
	}).flatMap(([name, files]) => [folder("Мої файли", name), ...files.map((f) => move$1(`Завантаження/${f}`, `Мої файли/${name}`))])],
	"g5-drive-d-folder": [
		folder("D:", "Інформатика 5 клас"),
		folder("D:/Інформатика 5 клас", "Вправи"),
		folder("D:/Інформатика 5 клас", "Практичні роботи"),
		copy$1("Вправа 5.docx", "D:/Інформатика 5 клас/Вправи")
	],
	"g5-shortcuts": [
		{
			do: "shortcut",
			path: "D:/Моя папка",
			to: ""
		},
		folder("D:/Моя папка", "Проєкт"),
		remove$1("Ігри – ярлик")
	],
	"g5-practical-1": [
		folder("D:", "Петренко"),
		...[
			"Малюнки",
			"Тексти",
			"Музика",
			"Різне"
		].map((n) => folder("D:/Петренко", n)),
		{
			do: "shortcut",
			path: "D:/Петренко",
			to: ""
		},
		copy$1("D:/Для учнів/осінь.jpg", "D:/Петренко/Малюнки"),
		copy$1("D:/Для учнів/правила.txt", "D:/Петренко/Тексти"),
		copy$1("D:/Для учнів/гімн.mp3", "D:/Петренко/Музика")
	],
	"g8-zip": [
		{
			do: "compress",
			paths: photos(NATURE, 1, 10, (n) => `photo${pad(n)}.jpg`),
			name: "nature"
		},
		move$1(`${NATURE}/nature.zip`, "D:/Моя папка"),
		move$1("D:/Моя папка/nature.zip/photo01.jpg", "D:/Моя папка"),
		move$1("D:/Моя папка/nature.zip/photo02.jpg", "D:/Моя папка")
	],
	"g8-extract": [
		...photos(PICTURES, 12, 16, (n) => `pic${n}.png`).map(remove$1),
		{
			do: "extract",
			path: PICTURES
		},
		rename$1("D:/Моя папка/Копія архіву/pictures", "Мої малюнки"),
		move$1("D:/Моя папка/Копія архіву/Мої малюнки", "D:/Моя папка")
	],
	"g9-file-junk": [...[
		"Документи/Доповідь_v1.docx",
		"Документи/Доповідь_v2_final.docx",
		"Документи/~$Доповідь_final__final.docx",
		"Документи/звіт.tmp",
		"Документи/фото класу – копія.jpg",
		"Завантаження/реферат.docx",
		"Завантаження/setup_game.exe"
	].map(remove$1), rename$1("Документи/Доповідь_final__final.docx", "Доповідь.docx")]
};
/** The change log of the reference solution, with ids as the trainer records them. */
var referenceOps = (scenario) => {
	const plan = steps[scenario.id];
	if (!plan) throw new Error(`Немає розв'язку для сценарію «${scenario.id}»`);
	const ops = [];
	let state = buildState(scenario.start, scenario.drives);
	for (const step of plan) {
		const op = toOp(state, step);
		const result = applyOp(state, op);
		if (!result.ok) throw new Error(`Помилка в розв'язку «${scenario.id}»: ${result.error}`);
		ops.push(op);
		state = result.state;
	}
	return ops;
};
export { BIN_ID, DESKTOP_ID, DRIVE_LETTERS, FORBIDDEN_CHARS, MAX_CREATED, MAX_NAME_LENGTH, MAX_NODES, MAX_OPS, RESERVED_NAMES, THIS_PC_ID, allMet, applyOp, buildState, checkGoals, childrenOf, compress, copy, create, createShortcut, deleteForever, describeGoal, displayName, driveId, emptyBin, emptyState, extensionOf, extractAll, findByPath, freeName, getNode, grade, isDrive, isInBin, isInside, isShortcut, isSystem, markOpened, markZip, move, pathOf, plural, referenceOps, remove, rename, replay, resolveAddress, restore, sameName, saveFile, scenarios, shortcutTarget, splitExtension, tryBuildState, validateName, windowsPath };

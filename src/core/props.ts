import { childrenOf, DESKTOP_ID, DESKTOP_PATH, type FsNode, type FsState, isDrive, type NodeId, pathOf, shortcutTarget, THIS_PC_ID } from "./fs.ts"
import { extensionOf } from "./names.ts"
import { hashOf } from "./sizes.ts"

/** What the «Властивості» window shows, worked out the way Windows does it. */

const KB = 1024
const CLUSTER = 4 * KB
/** A `.lnk` file is small; its size does not depend on what it opens. */
const SHORTCUT_SIZE = 1_412

const TYPE_NAMES: Readonly<Record<string, string>> = {
  txt: "Текстовий документ",
  rtf: "Документ у форматі RTF",
  doc: "Документ Microsoft Word 97–2003",
  docx: "Документ Microsoft Word",
  odt: "Текст OpenDocument",
  xlsx: "Аркуш Microsoft Excel",
  pptx: "Презентація Microsoft PowerPoint",
  pdf: "Документ PDF",
  jpg: "Файл JPG",
  jpeg: "Файл JPEG",
  png: "Файл PNG",
  gif: "Файл GIF",
  bmp: "Точковий рисунок",
  mp3: "Звук у форматі MP3",
  wav: "Звук у форматі WAV",
  mp4: "Відео MP4",
  avi: "Відео AVI",
  exe: "Програма",
  html: "Документ HTML",
  htm: "Документ HTML",
  zip: "Стиснута ZIP-папка",
  tmp: "Тимчасовий файл"
}

const PROGRAMS: Readonly<Record<string, string>> = {
  txt: "Блокнот",
  rtf: "WordPad",
  doc: "Word",
  docx: "Word",
  odt: "LibreOffice Writer",
  xlsx: "Excel",
  pptx: "PowerPoint",
  pdf: "Microsoft Edge",
  jpg: "Фотографії",
  jpeg: "Фотографії",
  png: "Фотографії",
  gif: "Фотографії",
  bmp: "Paint",
  mp3: "Медіапрогравач",
  wav: "Медіапрогравач",
  mp4: "Кіно й ТБ",
  avi: "Кіно й ТБ",
  html: "Microsoft Edge",
  htm: "Microsoft Edge",
  zip: "Провідник"
}

/** «Тип файлу» as Windows writes it: `Текстовий документ (.txt)`, `Ярлик (.lnk)`, `Папка з файлами`. */
export const typeOf = (node: FsNode): string => {
  if (isDrive(node.id)) return "Локальний диск"
  if (node.target !== undefined) return "Ярлик (.lnk)"
  if (node.zip) return "Стиснута ZIP-папка (.zip)"
  if (node.kind === "folder") return "Папка з файлами"
  const ext = extensionOf(node.name)
  if (ext === "") return "Файл"
  return `${TYPE_NAMES[ext] ?? `Файл ${ext.toUpperCase()}`} (.${ext})`
}

/** «Програма»: what opens the file. `undefined` for folders and unknown types. */
export const programOf = (node: FsNode): string | undefined =>
  node.kind === "file" && node.target === undefined ? PROGRAMS[extensionOf(node.name)] : undefined

/** Size in bytes; a folder adds up everything inside it. */
export const sizeOf = (state: FsState, node: FsNode): number => {
  if (node.target !== undefined) return SHORTCUT_SIZE
  if (node.kind === "file") return node.size ?? 0
  return childrenOf(state, node.id).reduce((sum, child) => sum + sizeOf(state, child), 0)
}

/** «На диску»: every file takes whole 4 KB clusters, an empty file takes none. */
export const sizeOnDiskOf = (state: FsState, node: FsNode): number => {
  if (node.kind === "file") return Math.ceil(sizeOf(state, node) / CLUSTER) * CLUSTER
  return childrenOf(state, node.id).reduce((sum, child) => sum + sizeOnDiskOf(state, child), 0)
}

/** «Містить»: files and folders inside, at every depth. */
export const contentsOf = (state: FsState, id: NodeId): { readonly files: number; readonly folders: number } =>
  childrenOf(state, id).reduce(
    (acc, child) => {
      if (child.kind === "file") return { ...acc, files: acc.files + 1 }
      const inner = contentsOf(state, child.id)
      return { files: acc.files + inner.files, folders: acc.folders + 1 + inner.folders }
    },
    { files: 0, folders: 0 }
  )

/** `2 465 792`: groups of three digits, as Windows shows bytes. */
export const groupDigits = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")

const UNITS = ["КБ", "МБ", "ГБ", "ТБ"] as const

/**
 * Short size as Explorer writes it: `345 байт`, `12,5 КБ`, `2,35 МБ`. Three significant digits, cut, not rounded;
 * from 1000 of a unit Windows already takes the next one: `0,97 МБ`.
 */
export const shortSize = (bytes: number): string => {
  if (bytes < KB) return `${groupDigits(bytes)} байт`
  let value = bytes / KB
  let unit = 0
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= KB
    unit += 1
  }
  const digits = value < 10 ? 2 : value < 100 ? 1 : 0
  const cut = Math.floor(value * 10 ** digits) / 10 ** digits
  return `${cut.toFixed(digits).replace(".", ",")} ${UNITS[unit]}`
}

/** `2,35 МБ (2 465 792 байт)`, as on the «Загальні» tab. */
export const fullSize = (bytes: number): string => `${shortSize(bytes)} (${groupDigits(bytes)} байт)`

/**
 * Windows path of the folder an item lies in («Розташування»). The desktop is a folder of the student's account:
 * `C:\Users\Учень\Desktop`. A drive root ends with a backslash: `D:\`.
 */
export const windowsPathOf = (state: FsState, id: NodeId): string => {
  if (id === DESKTOP_ID) return DESKTOP_PATH
  if (id === THIS_PC_ID) return "Цей ПК"
  const parts = pathOf(state, id)
  const first = parts[0]
  if (first !== undefined && /^[a-z]:$/i.test(first)) return parts.length === 1 ? `${first}\\` : parts.join("\\")
  return [DESKTOP_PATH, ...parts].join("\\")
}

/** «Розташування»: the folder the item lies in. */
export const locationOf = (state: FsState, node: FsNode): string =>
  node.parentId === null ? "" : windowsPathOf(state, node.parentId)

/** «Об'єкт» of a shortcut: the full path of what it opens, or `undefined` when that is deleted. */
export const shortcutTargetPath = (state: FsState, node: FsNode): string | undefined => {
  const target = shortcutTarget(state, node)
  return target === undefined ? undefined : windowsPathOf(state, target.id)
}

const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"] as const

/** `18 листопада 2026 р., 22:50:23`, as in Ukrainian Windows. Local time. */
export const formatDate = (time: number): string => {
  const d = new Date(time)
  const two = (n: number) => String(n).padStart(2, "0")
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} р., ${d.getHours()}:${two(d.getMinutes())}:${two(d.getSeconds())}`
}

/** `18.11.2026 22:50`, as the «Дата змінення» column writes it. */
export const formatShortDate = (time: number): string => {
  const d = new Date(time)
  const two = (n: number) => String(n).padStart(2, "0")
  return `${two(d.getDate())}.${two(d.getMonth() + 1)}.${d.getFullYear()} ${two(d.getHours())}:${two(d.getMinutes())}`
}

const DAY = 24 * 60 * 60 * 1000
/** Files from the start tree were made during the school year before the lesson. */
const START_FROM = Date.UTC(2025, 8, 1, 6)
const START_DAYS = 400

/**
 * When an item from the start tree was created and last changed: the same for the same name and place,
 * so every student sees the same dates. Items the student made carry their own time instead.
 */
export const startDates = (state: FsState, node: FsNode): { readonly created: number; readonly modified: number } => {
  const key = pathOf(state, node.id).join("/").toLocaleLowerCase("uk")
  const hash = hashOf(key)
  const created = START_FROM + (hash % START_DAYS) * DAY + (hash % 36_000) * 1000
  const modified = created + ((hash >>> 8) % 40) * DAY + ((hash >>> 4) % 20_000) * 1000
  return { created, modified }
}

const GB = KB * KB * KB
/** Disk sizes of a school computer; the system and programs already take part of drive C:. */
const DRIVES: Readonly<Record<string, { readonly capacity: number; readonly used: number }>> = {
  "C:": { capacity: 237 * GB + 312 * KB * KB, used: 96 * GB + 731 * KB * KB },
  "D:": { capacity: 465 * GB + 625 * KB * KB, used: 118 * GB + 204 * KB * KB }
}

/** «Ємність», «Зайнято» and «Вільно» of a drive; what the student puts on it counts too. */
export const driveSpace = (state: FsState, node: FsNode): { readonly capacity: number; readonly used: number; readonly free: number } => {
  const disk = DRIVES[node.name] ?? { capacity: 0, used: 0 }
  const used = disk.used + sizeOnDiskOf(state, node)
  return { capacity: disk.capacity, used, free: Math.max(0, disk.capacity - used) }
}

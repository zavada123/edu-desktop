/** Name rules follow Windows so children learn the same limits they meet on a real computer. */

export const MAX_NAME_LENGTH = 60
export const FORBIDDEN_CHARS = ["\\", "/", ":", "*", "?", '"', "<", ">", "|"] as const
/** Device names Windows reserves: a file or folder cannot be called `NUL` or `prn.txt`. */
export const RESERVED_NAMES = ["CON", "PRN", "AUX", "NUL", ...[1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((n) => [`COM${n}`, `LPT${n}`])] as const

/** Returns an error message in Ukrainian, or `null` when the name is valid. */
export const validateName = (raw: string): string | null => {
  const name = raw.trim()
  if (name.length === 0) return "Назва не може бути порожньою"
  if (name.length > MAX_NAME_LENGTH) return `Назва задовга: не більше ${MAX_NAME_LENGTH} символів`
  if (name === "." || name === "..") return "Така назва недоступна"
  const bad = FORBIDDEN_CHARS.find((c) => name.includes(c))
  if (bad !== undefined) return `Назва не може містити символи ${FORBIDDEN_CHARS.join(" ")}`
  if (name.endsWith(".")) return "Назва не може закінчуватися крапкою"
  const base = name.split(".")[0]?.toUpperCase() ?? ""
  if ((RESERVED_NAMES as ReadonlyArray<string>).includes(base)) return `«${base}» — зарезервоване ім'я пристрою, так назвати не можна`
  return null
}

/** Windows compares names without regard to letter case. */
export const sameName = (a: string, b: string): boolean => a.trim().toLocaleLowerCase("uk") === b.trim().toLocaleLowerCase("uk")

/** Splits `ліс.jpg` into `ліс` and `.jpg`. A name without a dot has an empty extension. */
export const splitExtension = (name: string): { readonly base: string; readonly ext: string } => {
  const dot = name.lastIndexOf(".")
  return dot <= 0 ? { base: name, ext: "" } : { base: name.slice(0, dot), ext: name.slice(dot) }
}

/** Lower-case extension without the dot: `jpg`, `txt`, or an empty string. */
export const extensionOf = (name: string): string => splitExtension(name).ext.slice(1).toLocaleLowerCase("uk")

/**
 * Picks the first free name: `Нова папка`, `Нова папка (2)`, `Нова папка (3)` and so on.
 * The number goes before the extension: `море (2).jpg`.
 */
export const freeName = (wanted: string, isTaken: (name: string) => boolean): string => {
  if (!isTaken(wanted)) return wanted
  const { base, ext } = splitExtension(wanted)
  for (let n = 2; ; n++) {
    const candidate = `${base} (${n})${ext}`
    if (!isTaken(candidate)) return candidate
  }
}

/** Ukrainian plural: 1 файл, 2 файли, 5 файлів. */
export const plural = (n: number, one: string, few: string, many: string): string => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

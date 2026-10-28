import { BIN_ID, childrenOf, findByPath, type FsState, type NodeKind, shortcutTarget } from "./fs.ts"
import { extensionOf, plural, sameName } from "./names.ts"

/**
 * Conditions a scenario checks on the final desktop. Authors pick them from this list,
 * no programming needed. Paths are relative to the desktop: `Мої фото/ліс.jpg`.
 */
export type Goal =
  | { readonly type: "exists"; readonly path: string; readonly kind?: NodeKind; readonly text?: string; readonly hint?: string }
  | { readonly type: "absent"; readonly path: string; readonly text?: string; readonly hint?: string }
  | { readonly type: "inBin"; readonly name: string; readonly text?: string; readonly hint?: string }
  /** The item at `path` was deleted into the bin and then restored. */
  /** In `folder` lies a shortcut (any name) that opens the object at `target`. */
  | { readonly type: "shortcut"; readonly folder: string; readonly target: string; readonly text?: string; readonly hint?: string }
  | { readonly type: "restored"; readonly path: string; readonly text?: string; readonly hint?: string }
  | {
      readonly type: "count"
      readonly folder: string
      readonly equals: number
      /** Count only files with this extension, without the dot: `jpg`. */
      readonly ext?: string
      readonly kind?: NodeKind
      readonly text?: string
      readonly hint?: string
    }

export interface GoalResult {
  readonly goal: Goal
  readonly ok: boolean
  /** What the student sees in the task list. */
  readonly text: string
  /** Shown only when the condition is not met. */
  readonly hint: string
}

const splitPath = (path: string): ReadonlyArray<string> =>
  path
    .split(/[/\\]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

/** `""` → на робочому столі, `D:` → на диску D:, `D:/Мої уроки` → у папці «D:\\Мої уроки». */
const folderLabel = (path: string): string => {
  const parts = splitPath(path)
  if (parts.length === 0) return "на робочому столі"
  if (parts.length === 1 && /^[a-z]:$/i.test(parts[0] ?? "")) return `на диску ${parts[0]}`
  return `у папці «${parts.join("\\")}»`
}

const lastPart = (path: string): { readonly where: string; readonly name: string } => {
  const parts = splitPath(path)
  return { where: parts.slice(0, -1).join("/"), name: parts.at(-1) ?? "" }
}

/** Default wording of a goal for the task list. */
export const describeGoal = (goal: Goal): string => {
  if (goal.text !== undefined) return goal.text
  switch (goal.type) {
    case "exists": {
      const { where, name } = lastPart(goal.path)
      const what = goal.kind === "folder" ? "папка" : goal.kind === "file" ? "файл" : ""
      return `${folderLabel(where)} є ${what} «${name}»`.replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase())
    }
    case "absent": {
      const { where, name } = lastPart(goal.path)
      return `${folderLabel(where)} немає «${name}»`.replace(/^./, (c) => c.toUpperCase())
    }
    case "inBin":
      return `«${goal.name}» лежить у кошику`
    case "shortcut":
      return `${folderLabel(goal.folder)} є ярлик до «${lastPart(goal.target).name}»`.replace(/^./, (c) => c.toUpperCase())
    case "restored":
      return `«${lastPart(goal.path).name}» видалено в кошик і відновлено`
    case "count": {
      const n = goal.equals
      const files = plural(n, "файл", "файли", "файлів")
      const what =
        goal.ext !== undefined
          ? `${files} .${goal.ext}`
          : goal.kind === "folder"
            ? plural(n, "папка", "папки", "папок")
            : goal.kind === "file"
              ? files
              : plural(n, "об'єкт", "об'єкти", "об'єктів")
      return `${folderLabel(goal.folder)} ${n} ${what}`.replace(/^./, (c) => c.toUpperCase())
    }
  }
}

const defaultHint = (goal: Goal): string => {
  switch (goal.type) {
    case "exists":
      return "Перевір назву й місце: можливо, об'єкт лежить не в тій папці або назва з помилкою."
    case "absent":
      return "Цей об'єкт ще на місці. Його треба перемістити або видалити."
    case "inBin":
      return "Видали об'єкт: права кнопка миші (або довге натискання) → «Видалити»."
    case "shortcut":
      return "Клацни правою кнопкою на об'єкті → «Надіслати» → «Робочий стіл (створити ярлик)» або «Створити ярлик»."
    case "restored":
      return "Видали об'єкт у кошик, потім відкрий «Кошик» і вибери «Відновити»."
    case "count":
      return "Порахуй, скільки об'єктів лежить у папці зараз, і порівняй із завданням."
  }
}

const isMet = (state: FsState, goal: Goal): boolean => {
  switch (goal.type) {
    case "exists": {
      const node = findByPath(state, goal.path)
      return node !== undefined && (goal.kind === undefined || node.kind === goal.kind)
    }
    case "absent":
      return findByPath(state, goal.path) === undefined
    case "inBin":
      return childrenOf(state, BIN_ID).some((n) => sameName(n.name, goal.name))
    case "shortcut": {
      const folder = findByPath(state, goal.folder)
      const target = findByPath(state, goal.target)
      if (!folder || !target) return false
      return childrenOf(state, folder.id).some((n) => shortcutTarget(state, n)?.id === target.id)
    }
    case "restored":
      return findByPath(state, goal.path)?.restored === true
    case "count": {
      const folder = findByPath(state, goal.folder)
      if (!folder || folder.kind !== "folder") return false
      const matching = childrenOf(state, folder.id).filter(
        (n) =>
          (goal.kind === undefined || n.kind === goal.kind) &&
          (goal.ext === undefined || (n.kind === "file" && extensionOf(n.name) === goal.ext.toLocaleLowerCase("uk")))
      )
      return matching.length === goal.equals
    }
  }
}

export const checkGoals = (state: FsState, goals: ReadonlyArray<Goal>): ReadonlyArray<GoalResult> =>
  goals.map((goal) => ({ goal, ok: isMet(state, goal), text: describeGoal(goal), hint: goal.hint ?? defaultHint(goal) }))

export const allMet = (results: ReadonlyArray<GoalResult>): boolean => results.every((r) => r.ok)

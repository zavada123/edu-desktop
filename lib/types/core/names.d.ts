/** Name rules follow Windows so children learn the same limits they meet on a real computer. */
export declare const MAX_NAME_LENGTH = 60;
export declare const FORBIDDEN_CHARS: readonly ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"];
/** Device names Windows reserves: a file or folder cannot be called `NUL` or `prn.txt`. */
export declare const RESERVED_NAMES: readonly ["CON", "PRN", "AUX", "NUL", ...string[]];
/** Returns an error message in Ukrainian, or `null` when the name is valid. */
export declare const validateName: (raw: string) => string | null;
/** Windows compares names without regard to letter case. */
export declare const sameName: (a: string, b: string) => boolean;
/** Splits `ліс.jpg` into `ліс` and `.jpg`. A name without a dot has an empty extension. */
export declare const splitExtension: (name: string) => {
    readonly base: string;
    readonly ext: string;
};
/** Lower-case extension without the dot: `jpg`, `txt`, or an empty string. */
export declare const extensionOf: (name: string) => string;
/**
 * Picks the first free name: `Нова папка`, `Нова папка (2)`, `Нова папка (3)` and so on.
 * The number goes before the extension: `море (2).jpg`.
 */
export declare const freeName: (wanted: string, isTaken: (name: string) => boolean) => string;
/** Ukrainian plural: 1 файл, 2 файли, 5 файлів. */
export declare const plural: (n: number, one: string, few: string, many: string) => string;

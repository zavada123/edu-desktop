import { type FsState } from "./fs.ts";
/**
 * Compact description of a starting desktop for scenario authors.
 * An object is a folder, `null` is a file, a string is a shortcut to that path:
 * `{ "Мої фото": { "ліс.jpg": null }, "вірш.txt": null, "Ігри – ярлик": "D:/Ігри" }`.
 * A folder whose name ends with `.zip` is a compressed ZIP folder: `{ "фото.zip": { "ліс.jpg": null } }`.
 */
export type TreeSpec = {
    readonly [name: string]: TreeSpec | null | string;
};
export type BuildResult = {
    readonly ok: true;
    readonly state: FsState;
} | {
    readonly ok: false;
    readonly error: string;
};
/** Contents of drives by letter: `{ "D:": { "Мої уроки": {} } }`. */
export type DrivesSpec = {
    readonly [drive: string]: TreeSpec;
};
/** Builds the start tree, or names the first problem in it. A server uses it on data it did not write. */
export declare const tryBuildState: (desktop: TreeSpec, drives?: DrivesSpec) => BuildResult;
/** Builds the start tree of a scenario from this package; a mistake in it is a programming error. */
export declare const buildState: (desktop: TreeSpec, drives?: DrivesSpec) => FsState;

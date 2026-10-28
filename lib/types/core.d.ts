/** Entry `edu-desktop/core`: the file system, goals, the change log and the scenarios. No React, so a server can use it. */
export * from "./core/index.ts";
export { scenarios } from "./scenarios/index.ts";
export { referenceOps } from "./scenarios/solutions.ts";
export type { AppKind, AppSpec, Scenario } from "./scenarios/types.ts";

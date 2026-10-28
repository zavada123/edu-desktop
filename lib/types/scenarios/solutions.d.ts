import { type Op } from "../core/ops.ts";
import type { Scenario } from "./types.ts";
/** The change log of the reference solution, with ids as the trainer records them. */
export declare const referenceOps: (scenario: Scenario) => ReadonlyArray<Op>;

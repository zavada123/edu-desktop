/** FNV-1a: the same name always gives the same number, so sizes and dates never change between visits. */
export declare const hashOf: (text: string) => number;
/**
 * Size of a file from the start tree whose size the scenario does not give: a believable number for its type,
 * the same for the same name. A scenario that needs exact sizes gives them as numbers in the tree.
 */
export declare const defaultSize: (name: string) => number;

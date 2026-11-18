import { extensionOf } from "./names.ts"

/** FNV-1a: the same name always gives the same number, so sizes and dates never change between visits. */
export const hashOf = (text: string): number => {
  let hash = 0x811c9dc5
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

const KB = 1024
const MB = KB * KB

/** Typical sizes of files of each kind, smallest and largest, in bytes. */
const SIZE_RANGES: Readonly<Record<string, readonly [number, number]>> = {
  txt: [300, 6 * KB],
  rtf: [20 * KB, 200 * KB],
  doc: [25 * KB, 400 * KB],
  docx: [15 * KB, 300 * KB],
  odt: [15 * KB, 300 * KB],
  xlsx: [10 * KB, 200 * KB],
  pptx: [500 * KB, 8 * MB],
  pdf: [100 * KB, 5 * MB],
  jpg: [400 * KB, 4 * MB],
  jpeg: [400 * KB, 4 * MB],
  png: [100 * KB, 2 * MB],
  gif: [50 * KB, 2 * MB],
  bmp: [1 * MB, 6 * MB],
  mp3: [2 * MB, 9 * MB],
  wav: [5 * MB, 50 * MB],
  mp4: [20 * MB, 300 * MB],
  avi: [50 * MB, 500 * MB],
  exe: [1 * MB, 60 * MB],
  html: [2 * KB, 80 * KB],
  htm: [2 * KB, 80 * KB],
  tmp: [1 * KB, 64 * KB]
}
const OTHER_RANGE: readonly [number, number] = [1 * KB, 500 * KB]

/**
 * Size of a file from the start tree whose size the scenario does not give: a believable number for its type,
 * the same for the same name. A scenario that needs exact sizes gives them as numbers in the tree.
 */
export const defaultSize = (name: string): number => {
  const [min, max] = SIZE_RANGES[extensionOf(name)] ?? OTHER_RANGE
  return min + (hashOf(name.toLocaleLowerCase("uk")) % (max - min))
}

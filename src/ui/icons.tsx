import type { FsNode, FsState } from "../core/fs.ts"
import { BIN_ID, getNode, isDrive, THIS_PC_ID } from "../core/fs.ts"
import { extensionOf } from "../core/names.ts"

/** Own simple icons: no Microsoft artwork is used anywhere in the project. */

type IconKind = "zip" | "folder" | "bin" | "binFull" | "pc" | "drive" | "image" | "text" | "doc" | "audio" | "video" | "file"

const IMAGE = ["jpg", "jpeg", "png", "gif", "bmp", "webp"]
const TEXT = ["txt"]
const DOC = ["doc", "docx", "odt", "rtf", "pdf", "pptx", "xlsx"]
const AUDIO = ["mp3", "wav", "ogg"]
const VIDEO = ["mp4", "avi", "mkv", "webm"]

export const iconKindOf = (node: FsNode, binHasItems: boolean): IconKind => {
  if (node.id === BIN_ID) return binHasItems ? "binFull" : "bin"
  if (node.id === THIS_PC_ID) return "pc"
  if (isDrive(node.id)) return "drive"
  if (node.zip) return "zip"
  if (node.kind === "folder") return "folder"
  const ext = extensionOf(node.name)
  if (IMAGE.includes(ext)) return "image"
  if (TEXT.includes(ext)) return "text"
  if (DOC.includes(ext)) return "doc"
  if (AUDIO.includes(ext)) return "audio"
  if (VIDEO.includes(ext)) return "video"
  return "file"
}

const Page = ({ color, children }: { readonly color: string; readonly children?: React.ReactNode }) => (
  <>
    <path d="M12 4h26l12 12v42a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" stroke="#9aa4b2" strokeWidth="2" />
    <path d="M38 4v10a2 2 0 0 0 2 2h10" fill="#e8ecf2" stroke="#9aa4b2" strokeWidth="2" />
    <rect x="16" y="40" width="28" height="12" rx="2" fill={color} />
    {children}
  </>
)

const shapes: Record<IconKind, React.ReactNode> = {
  zip: (
    <>
      <path d="M4 14a3 3 0 0 1 3-3h16l5 6h29a3 3 0 0 1 3 3v31a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#e8a317" />
      <path d="M4 22a3 3 0 0 1 3-3h50a3 3 0 0 1 3 3v29a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#ffc83d" />
      <rect x="28" y="19" width="8" height="35" fill="#3b4a5e" />
      <path d="M28 23h8M28 28h8M28 33h8M28 38h8" stroke="#ffc83d" strokeWidth="2" />
      <rect x="26" y="40" width="12" height="10" rx="2" fill="#9aa4b2" stroke="#3b4a5e" strokeWidth="2" />
    </>
  ),
  folder: (
    <>
      <path d="M4 14a3 3 0 0 1 3-3h16l5 6h29a3 3 0 0 1 3 3v31a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#e8a317" />
      <path d="M4 22a3 3 0 0 1 3-3h50a3 3 0 0 1 3 3v29a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#ffc83d" />
    </>
  ),
  bin: (
    <>
      <path d="M14 18h36l-4 38a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z" fill="#dfe6ef" stroke="#7b8796" strokeWidth="2" />
      <rect x="10" y="12" width="44" height="6" rx="2" fill="#b8c3d1" />
      <path d="M26 26v26M32 26v26M38 26v26" stroke="#9aa4b2" strokeWidth="2" />
    </>
  ),
  binFull: (
    <>
      <path d="M14 18h36l-4 38a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z" fill="#dfe6ef" stroke="#7b8796" strokeWidth="2" />
      <path d="M16 18c4-8 10-12 16-8 6-6 12-2 16 8z" fill="#fff" stroke="#9aa4b2" strokeWidth="2" />
      <rect x="10" y="16" width="44" height="5" rx="2" fill="#b8c3d1" />
    </>
  ),
  pc: (
    <>
      <rect x="6" y="10" width="52" height="34" rx="3" fill="#3b4a5e" />
      <rect x="10" y="14" width="44" height="26" rx="1" fill="#7cc4ff" />
      <path d="M26 44h12l2 8H24z" fill="#8a94a3" />
      <rect x="18" y="52" width="28" height="4" rx="2" fill="#5b6577" />
    </>
  ),
  drive: (
    <>
      <rect x="6" y="22" width="52" height="22" rx="4" fill="#cfd6e0" stroke="#7b8796" strokeWidth="2" />
      <rect x="6" y="36" width="52" height="8" rx="2" fill="#aab4c2" />
      <circle cx="48" cy="40" r="2.5" fill="#22c55e" />
      <rect x="12" y="27" width="20" height="4" rx="2" fill="#7b8796" />
    </>
  ),
  image: (
    <>
      <rect x="6" y="10" width="52" height="44" rx="4" fill="#fff" stroke="#9aa4b2" strokeWidth="2" />
      <rect x="10" y="14" width="44" height="36" rx="2" fill="#bfe3ff" />
      <circle cx="42" cy="23" r="5" fill="#ffd34d" />
      <path d="M10 50l14-18 10 12 7-8 13 14z" fill="#4caf50" />
    </>
  ),
  text: (
    <Page color="#5b8def">
      <path d="M16 16h16M16 23h28M16 30h28" stroke="#9aa4b2" strokeWidth="2.5" strokeLinecap="round" />
    </Page>
  ),
  doc: (
    <Page color="#2f6fd6">
      <path d="M16 18h22M16 25h28M16 32h28" stroke="#2f6fd6" strokeWidth="2.5" strokeLinecap="round" />
    </Page>
  ),
  audio: (
    <Page color="#e05a8a">
      <path d="M26 34V18l14-3v15" fill="none" stroke="#e05a8a" strokeWidth="3" />
      <circle cx="23" cy="34" r="4" fill="#e05a8a" />
      <circle cx="37" cy="30" r="4" fill="#e05a8a" />
    </Page>
  ),
  video: (
    <Page color="#7a5af5">
      <path d="M24 16l14 9-14 9z" fill="#7a5af5" />
    </Page>
  ),
  file: <Page color="#8a94a3" />
}

/** The small white square with a curved arrow in the lower left corner of a shortcut (5 клас, рис. 5.5). */
const ShortcutArrow = () => (
  <g>
    <rect x="2" y="38" width="24" height="24" rx="3" fill="#fff" stroke="#5b6675" strokeWidth="2" />
    <path d="M9 56c0-9 4-13 12-13" fill="none" stroke="#1f6feb" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M15 38.5l7 4.5-6 5.5" fill="none" stroke="#1f6feb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

export const NodeIcon = ({ kind, size, shortcut = false }: { readonly kind: IconKind; readonly size: number; readonly shortcut?: boolean }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
    {shapes[kind]}
    {shortcut && <ShortcutArrow />}
  </svg>
)

/** Icon of an item in a folder: a shortcut looks like its object plus the arrow; a broken one like a plain file. */
export const ItemIcon = ({ fs, node, binHasItems, size }: { readonly fs: FsState; readonly node: FsNode; readonly binHasItems: boolean; readonly size: number }) => {
  if (node.target === undefined) return <NodeIcon kind={iconKindOf(node, binHasItems)} size={size} />
  const target = getNode(fs, node.target)
  return <NodeIcon kind={target ? iconKindOf(target, binHasItems) : "file"} size={size} shortcut />
}

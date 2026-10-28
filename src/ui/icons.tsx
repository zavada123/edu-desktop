import type { FsNode } from "../core/fs.ts"
import { BIN_ID } from "../core/fs.ts"
import { extensionOf } from "../core/names.ts"

/** Own simple icons: no Microsoft artwork is used anywhere in the project. */

type IconKind = "folder" | "bin" | "binFull" | "image" | "text" | "doc" | "audio" | "video" | "file"

const IMAGE = ["jpg", "jpeg", "png", "gif", "bmp", "webp"]
const TEXT = ["txt"]
const DOC = ["doc", "docx", "odt", "rtf", "pdf", "pptx", "xlsx"]
const AUDIO = ["mp3", "wav", "ogg"]
const VIDEO = ["mp4", "avi", "mkv", "webm"]

export const iconKindOf = (node: FsNode, binHasItems: boolean): IconKind => {
  if (node.id === BIN_ID) return binHasItems ? "binFull" : "bin"
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

export const NodeIcon = ({ kind, size }: { readonly kind: IconKind; readonly size: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
    {shapes[kind]}
  </svg>
)

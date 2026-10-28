import { useEffect, useRef, useState } from "react"
import { BIN_ID, childrenOf, DESKTOP_ID, DRIVE_LETTERS, displayName, driveId, getNode, type NodeId, saveFile, THIS_PC_ID, windowsPath } from "../core/fs.ts"
import { extensionOf, sameName } from "../core/names.ts"
import { APPS } from "./AppWindow.tsx"
import { ItemIcon, NodeIcon } from "./icons.tsx"
import type { Action, DesktopState, FileDialog } from "./store.ts"
import type { AppSpec } from "../scenarios/types.ts"

const PLACES: ReadonlyArray<NodeId> = [DESKTOP_ID, THIS_PC_ID, ...DRIVE_LETTERS.map(driveId)]

const placeLabel = (state: DesktopState, id: NodeId): string => {
  if (id === DESKTOP_ID) return "Робочий стіл"
  const node = getNode(state.fs, id)
  return node ? displayName(node) : ""
}

interface Props {
  readonly mode: FileDialog
  readonly state: DesktopState
  readonly app: AppSpec
  readonly dispatch: (action: Action) => void
}

/**
 * «Зберегти як» and «Відкрити» as the textbooks show them (3 клас, с. 54; 4 клас, с. 21): places on the left,
 * the current folder, «Ім'я файлу», «Тип файлу» and the buttons. A tap on a folder opens it.
 */
export const SaveDialog = ({ mode, state, app, dispatch }: Props) => {
  const { ext, typeLabel, fileName } = APPS[app.kind]
  const opening = mode === "open"
  const [folderId, setFolderId] = useState<NodeId>(DESKTOP_ID)
  const [name, setName] = useState(opening ? "" : (app.fileName ?? fileName))
  const [newFolder, setNewFolder] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Enter removes the input, and its blur would create the folder a second time.
  const folderDone = useRef(false)
  const nameRef = useRef<HTMLInputElement>(null)
  useEffect(() => nameRef.current?.select(), [])

  const go = (id: NodeId) => {
    setFolderId(id)
    setError(null)
  }
  const parentId = getNode(state.fs, folderId)?.parentId ?? null
  // «Відкрити» lists only files of the program's type, as Windows does.
  const items = childrenOf(state.fs, folderId).filter((n) => !opening || n.kind === "folder" || `.${extensionOf(n.name)}` === ext)
  const close = () => dispatch({ type: "fileDialog", dialog: null })

  const open = (fileName: string) => {
    const wanted = fileName.trim()
    const file = childrenOf(state.fs, folderId).find((n) => n.kind === "file" && (sameName(n.name, wanted) || sameName(n.name, `${wanted}${ext}`)))
    if (!file) return setError(wanted.length === 0 ? "Вибери файл" : `Файл «${wanted}» не знайдено в цій папці.`)
    dispatch({ type: "openFile", nodeId: file.id })
  }
  const save = () => {
    if (opening) return open(name)
    const result = saveFile(state.fs, folderId, name, ext)
    if (!result.ok) return setError(result.error)
    dispatch({ type: "saveFile", folderId, name, ext })
  }
  const startFolder = () => {
    folderDone.current = false
    setNewFolder("Нова папка")
  }
  const makeFolder = (folderName: string) => {
    if (folderDone.current) return
    folderDone.current = true
    setNewFolder(null)
    if (folderName.trim().length > 0) dispatch({ type: "newFolder", containerId: folderId, name: folderName })
  }

  return (
    <div className="ed-modal-backdrop">
      <div className="ed-dialog ed-save" role="dialog" aria-modal="true" aria-labelledby="ed-save-title" onKeyDown={(e) => e.key === "Escape" && close()}>
        <div className="ed-titlebar">
          <span id="ed-save-title" className="ed-title">
            {opening ? "Відкрити" : app.kind === "browser" ? "Зберегти зображення як" : "Зберегти як"}
          </span>
          <button type="button" className="ed-tb-btn ed-close" aria-label="Закрити" onClick={() => close()}>
            ✕
          </button>
        </div>
        <div className="ed-save-nav">
          <button type="button" disabled={parentId === null} onClick={() => parentId !== null && go(parentId)} aria-label="Вгору">
            ↑
          </button>
          <span className="ed-save-path">{windowsPath(state.fs, folderId)}</span>
          <button type="button" disabled={folderId === THIS_PC_ID} hidden={opening} onClick={startFolder}>
            ＋ Нова папка
          </button>
        </div>
        <div className="ed-save-body">
          <ul className="ed-save-places" aria-label="Розташування">
            {PLACES.filter((id) => getNode(state.fs, id) || id === DESKTOP_ID).map((id) => (
              <li key={id}>
                <button type="button" className={id === folderId ? "is-on" : ""} onClick={() => go(id)}>
                  <NodeIcon kind={id === DESKTOP_ID ? "folder" : id === THIS_PC_ID ? "pc" : "drive"} size={20} />
                  {placeLabel(state, id)}
                </button>
              </li>
            ))}
          </ul>
          <ul className="ed-save-list" aria-label="Вміст папки">
            {newFolder !== null && (
              <li>
                <input
                  className="ed-rename"
                  aria-label="Назва нової папки"
                  autoFocus
                  defaultValue={newFolder}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") makeFolder(e.currentTarget.value)
                    if (e.key === "Escape") {
                      e.stopPropagation()
                      folderDone.current = true
                      setNewFolder(null)
                    }
                  }}
                  onBlur={(e) => makeFolder(e.currentTarget.value)}
                />
              </li>
            )}
            {items.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  className={node.kind === "folder" ? "" : "is-file"}
                  onClick={() => (node.kind === "folder" && node.id !== BIN_ID ? go(node.id) : node.kind === "file" && (setName(node.name), setError(null)))}
                  onDoubleClick={() => opening && node.kind === "file" && open(node.name)}
                >
                  <ItemIcon fs={state.fs} node={node} binHasItems={false} size={24} />
                  {displayName(node)}
                </button>
              </li>
            ))}
            {items.length === 0 && newFolder === null && <li className="ed-empty">Ця папка порожня</li>}
          </ul>
        </div>
        <div className="ed-save-fields">
          <label>
            Ім'я файлу:
            <input ref={nameRef} value={name} spellCheck={false} onChange={(e) => (setName(e.target.value), setError(null))} onKeyDown={(e) => e.key === "Enter" && save()} />
          </label>
          <label>
            Тип файлу:
            <input value={typeLabel} readOnly tabIndex={-1} />
          </label>
          {error && (
            <p className="ed-save-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="ed-dialog-actions">
          <button type="button" className="ed-yes" onClick={save}>
            {opening ? "Відкрити" : "Зберегти"}
          </button>
          <button type="button" onClick={() => close()}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  )
}

import { type ReactNode, useEffect, useRef, useState } from "react"
import { displayName, type FsNode, getNode, isDrive, type NodeId } from "../core/fs.ts"
import {
  contentsOf,
  driveSpace,
  formatDate,
  fullSize,
  locationOf,
  programOf,
  shortcutTargetPath,
  sizeOf,
  sizeOnDiskOf,
  startDates,
  typeOf
} from "../core/props.ts"
import { ItemIcon } from "./icons.tsx"
import type { Action, DesktopState } from "./store.ts"

interface Props {
  readonly state: DesktopState
  readonly nodeId: NodeId
  readonly dispatch: (action: Action) => void
}

/** One «Назва: значення» line. Values can be selected and copied, a path above all. */
const Row = ({ label, children }: { readonly label: string; readonly children: ReactNode }) => (
  <div className="ed-props-row">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const Rule = () => <hr className="ed-props-rule" />

const DriveRows = ({ state, node }: { readonly state: DesktopState; readonly node: FsNode }) => {
  const { capacity, used, free } = driveSpace(state.fs, node)
  const share = capacity === 0 ? 0 : Math.round((used / capacity) * 100)
  return (
    <>
      <dl className="ed-props-list">
        <Row label="Тип:">{typeOf(node)}</Row>
        <Row label="Файлова система:">NTFS</Row>
      </dl>
      <Rule />
      <dl className="ed-props-list">
        <Row label="Зайнято:">{fullSize(used)}</Row>
        <Row label="Вільно:">{fullSize(free)}</Row>
      </dl>
      <Rule />
      <dl className="ed-props-list">
        <Row label="Ємність:">{fullSize(capacity)}</Row>
      </dl>
      <div className="ed-props-disk" role="img" aria-label={`Зайнято ${share}% диска`}>
        <span style={{ width: `${share}%` }} />
      </div>
      <p className="ed-props-legend">
        <span className="ed-props-used" /> Зайнято <span className="ed-props-free" /> Вільно
      </p>
    </>
  )
}

const ItemRows = ({ state, node }: { readonly state: DesktopState; readonly node: FsNode }) => {
  const isFolder = node.kind === "folder" && !node.zip
  const program = programOf(node)
  const born = state.born[node.id]
  const dates = born === undefined ? startDates(state.fs, node) : { created: born, modified: born }
  const contents = isFolder ? contentsOf(state.fs, node.id) : undefined
  const target = node.target === undefined ? undefined : (shortcutTargetPath(state.fs, node) ?? "Об'єкт не знайдено: його видалено")
  return (
    <>
      <dl className="ed-props-list">
        <Row label={isFolder ? "Тип:" : "Тип файлу:"}>{typeOf(node)}</Row>
        {program !== undefined && <Row label="Програма:">{program}</Row>}
        {target !== undefined && <Row label="Об'єкт:">{target}</Row>}
      </dl>
      <Rule />
      <dl className="ed-props-list">
        <Row label="Розташування:">{locationOf(state.fs, node)}</Row>
        <Row label="Розмір:">{fullSize(sizeOf(state.fs, node))}</Row>
        <Row label="На диску:">{fullSize(sizeOnDiskOf(state.fs, node))}</Row>
        {contents && <Row label="Містить:">{`Файлів: ${contents.files}; папок: ${contents.folders}`}</Row>}
      </dl>
      <Rule />
      <dl className="ed-props-list">
        <Row label="Створено:">{formatDate(dates.created)}</Row>
        {!isFolder && <Row label="Змінено:">{formatDate(dates.modified)}</Row>}
      </dl>
      <Rule />
    </>
  )
}

/** «Властивості»: the «Загальні» tab of Windows, with the attributes «Лише читання» and «Прихований». */
export const PropertiesDialog = ({ state, nodeId, dispatch }: Props) => {
  const node = getNode(state.fs, nodeId)
  const [readOnly, setReadOnly] = useState(node?.readOnly === true)
  const [hidden, setHidden] = useState(node?.hidden === true)
  const ok = useRef<HTMLButtonElement>(null)
  useEffect(() => ok.current?.focus(), [])
  if (!node) return null

  const drive = isDrive(node.id)
  const changed = (node.readOnly === true) !== readOnly || (node.hidden === true) !== hidden
  const close = () => dispatch({ type: "properties", nodeId: null })
  const apply = () => dispatch({ type: "attributes", nodeId, readOnly, hidden })
  const name = displayName(node)

  return (
    <div className="ed-modal-backdrop">
      <div
        className="ed-dialog ed-props"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ed-props-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") close()
        }}
      >
        <div className="ed-titlebar">
          <span id="ed-props-title" className="ed-title">
            Властивості: {name}
          </span>
          <button type="button" className="ed-props-x" aria-label="Закрити" onClick={close}>
            ✕
          </button>
        </div>
        <div className="ed-props-tabs" role="tablist">
          <span role="tab" aria-selected="true" className="is-active">
            Загальні
          </span>
        </div>
        <div className="ed-props-body">
          <div className="ed-props-head">
            <ItemIcon fs={state.fs} node={node} binHasItems={false} size={40} />
            <output className="ed-props-name">{drive ? `Диск ${node.name}` : name}</output>
          </div>
          <Rule />
          {drive ? <DriveRows state={state} node={node} /> : <ItemRows state={state} node={node} />}
          {!drive && (
            <fieldset className="ed-props-attrs">
              <legend>Атрибути:</legend>
              {node.kind === "file" && (
                <label>
                  <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.currentTarget.checked)} /> Лише читання
                </label>
              )}
              <label>
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.currentTarget.checked)} /> Прихований
              </label>
            </fieldset>
          )}
        </div>
        <div className="ed-dialog-actions">
          <button
            ref={ok}
            type="button"
            className="ed-yes"
            onClick={() => {
              apply()
              close()
            }}
          >
            OK
          </button>
          <button type="button" onClick={close}>
            Скасувати
          </button>
          {!drive && (
            <button type="button" disabled={!changed} onClick={apply}>
              Застосувати
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

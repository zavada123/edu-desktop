import { type NodeId } from "../core/fs.ts";
import type { Action, DesktopState } from "./store.ts";
interface Props {
    readonly state: DesktopState;
    readonly nodeId: NodeId;
    readonly dispatch: (action: Action) => void;
}
/** «Властивості»: the «Загальні» tab of Windows, with the attributes «Лише читання» and «Прихований». */
export declare const PropertiesDialog: ({ state, nodeId, dispatch }: Props) => import("react").JSX.Element | null;
export {};

import type { DeepReadonly } from "@/common/types/object.types";
import type { EditorActionType } from "../../../actions/actions.models";
import type { DocumentRoot } from "../../../document/DocumentRoot/DocumentRoot";
import type { HistoryOperationType } from "../../../history/models/history-operation.models";

export interface EditorChangeEvent {
  type: "editor:change";
  documentJSON: string;
  history: string[];
  currentPositionInHistory: number;
  root: DeepReadonly<DocumentRoot>;
  triggerAction: EditorActionType | HistoryOperationType;
}

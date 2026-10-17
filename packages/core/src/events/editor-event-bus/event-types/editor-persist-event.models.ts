import type { EditorActionType } from "../../../actions/actions.models";
import type { HistoryOperationType } from "../../../history/models/history-operation.models";

export interface EditorPersistEvent {
  type: "editor:persist";
  triggerAction: EditorActionType | HistoryOperationType;
  documentJSON: string;
  history: string[];
}

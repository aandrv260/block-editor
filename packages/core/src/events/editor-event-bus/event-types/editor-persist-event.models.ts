import type { EditorActionType } from "../../../actions/actions.models";

export interface EditorPersistEvent {
  type: "editor:persist";
  triggerAction: EditorActionType | "history:set";
  documentJSON: string;
  history: string[];
}

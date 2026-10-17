import type {
  EditorActionMap,
  EditorActionType,
} from "../../actions/actions.models";
import type { EditorDocument } from "../../document/EditorDocument";
import type { Command } from "./Command";

export interface CommandConstructor<T extends EditorActionType> {
  new (payload: EditorActionMap[T]["payload"], document: EditorDocument): Command<T>;
}

export type CommandsRecord = {
  [T in EditorActionType]: CommandConstructor<T>;
};

export interface GeEditorCommandConfig<T extends EditorActionType> {
  type: T;
  payload: EditorActionMap[T]["payload"];
  document: EditorDocument;
}

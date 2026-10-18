import type {
  EditorActionMap,
  EditorActionType,
} from "../../actions/actions.models";
import type { EditorEventsMap } from "../../events/editor-event-bus/editorEvent.models";
import type { EditorDocument } from "../../document/EditorDocument";

export interface CommandContext<TPayload> {
  payload: TPayload;
  document: EditorDocument;
}

/**
 * Changes the document and returns the event that describes the change.
 */
export type Command<T extends EditorActionType> = (
  context: CommandContext<EditorActionMap[T]["payload"]>,
) => EditorEventsMap[T];

export type CommandsRecord = {
  [T in EditorActionType]: Command<T>;
};

export interface ExecuteCommandConfig<T extends EditorActionType> {
  type: T;
  payload: EditorActionMap[T]["payload"];
  document: EditorDocument;
}

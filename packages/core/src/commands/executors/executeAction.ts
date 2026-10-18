import type {
  EditorActionMap,
  EditorActionType,
} from "../../actions/actions.models";
import type { EditorDocument } from "../../document/EditorDocument";
import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";
import type { CommandContext } from "./commandExecutors.models";
import { DEFAULT_COMMANDS } from "./defaultCommands";

type ActionCommands = {
  [TType in EditorActionType]: (
    context: CommandContext<EditorActionMap[TType]["payload"]>,
  ) => CommandEvent;
};

interface ExecuteActionConfig<TType extends EditorActionType> {
  type: TType;
  payload: EditorActionMap[TType]["payload"];
  document: EditorDocument;
}

const ACTION_COMMANDS: ActionCommands = DEFAULT_COMMANDS;

// TODO: Remove together with the action creators once every caller uses `execute`.
export const executeAction = <TType extends EditorActionType>({
  type,
  payload,
  document,
}: ExecuteActionConfig<TType>): CommandEvent => {
  const command = ACTION_COMMANDS[type];
  return command({ payload, document });
};

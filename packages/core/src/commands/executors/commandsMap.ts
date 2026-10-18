import type { EditorActionType } from "../../actions/actions.models";
import type { EditorEventsMap } from "../../events/editor-event-bus/editorEvent.models";
import { insertBlockCommand } from "./InsertBlockCommand";
import { deleteBlockCommand } from "./DeleteBlockCommand";
import { moveBlockCommand } from "./MoveBlockCommand";
import { updateBlockCommand } from "./UpdateBlockCommand";
import type {
  CommandsRecord,
  ExecuteCommandConfig,
} from "./commandExecutors.models";
import { swapDocumentCommand } from "./SwapDocumentCommand/SwapDocumentCommand";

const commandsMap: CommandsRecord = {
  "block:insert": insertBlockCommand,
  "block:delete": deleteBlockCommand,
  "block:move": moveBlockCommand,
  "block:update": updateBlockCommand,
  "document:swap": swapDocumentCommand,
};

export const executeCommand = <T extends EditorActionType>({
  type,
  payload,
  document,
}: ExecuteCommandConfig<T>): EditorEventsMap[T] => {
  const command = commandsMap[type];
  return command({ payload, document });
};

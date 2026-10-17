import type { EditorActionType } from "../../actions/actions.models";
import { Command } from "./Command";
import { InsertBlockCommand } from "./InsertBlockCommand";
import { DeleteBlockCommand } from "./DeleteBlockCommand";
import { MoveBlockCommand } from "./MoveBlockCommand";
import { UpdateBlockCommand } from "./UpdateBlockCommand";
import type {
  CommandsRecord,
  GeEditorCommandConfig,
} from "./commandExecutors.models";
import { SwapDocumentCommand } from "./SwapDocumentCommand/SwapDocumentCommand";

const commandsMap: CommandsRecord = {
  "block:insert": InsertBlockCommand,
  "block:delete": DeleteBlockCommand,
  "block:move": MoveBlockCommand,
  "block:update": UpdateBlockCommand,
  "document:swap": SwapDocumentCommand,
};

export const getEditorCommand = <T extends EditorActionType>({
  type,
  payload,
  document,
}: GeEditorCommandConfig<T>): Command<T> => {
  const CommandClass = commandsMap[type];
  return new CommandClass(payload, document);
};

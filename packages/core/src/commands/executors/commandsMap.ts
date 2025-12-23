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
import { UndoCommand } from "./UndoCommand/UndoCommand";
import { RedoCommand } from "./RedoCommand/RedoCommand";
import { HistoryJumpCommand } from "./HistoryJumpCommand/HistoryJumpCommand";
import { SwapDocumentCommand } from "./SwapDocumentCommand/SwapDocumentCommand";
import { HistorySetCommand } from "./HistorySetCommand/HistorySetCommand";

const commandsMap: CommandsRecord = {
  "block:insert": InsertBlockCommand,
  "block:delete": DeleteBlockCommand,
  "block:move": MoveBlockCommand,
  "block:update": UpdateBlockCommand,
  "history:undo": UndoCommand,
  "history:redo": RedoCommand,
  "history:jump": HistoryJumpCommand,
  "document:swap": SwapDocumentCommand,
  "history:set": HistorySetCommand,
};

export const getEditorCommand = <T extends EditorActionType>({
  type,
  payload,
  eventBus,
  history,
  document,
}: GeEditorCommandConfig<T>): Command<T> => {
  const CommandClass = commandsMap[type];
  return new CommandClass(payload, eventBus, history, document);
};

import { insertBlockCommand } from "./InsertBlockCommand";
import { deleteBlockCommand } from "./DeleteBlockCommand";
import { moveBlockCommand } from "./MoveBlockCommand";
import { updateBlockCommand } from "./UpdateBlockCommand";
import { swapDocumentCommand } from "./SwapDocumentCommand/SwapDocumentCommand";
import type { Commands } from "./commandExecutors.models";

export const DEFAULT_COMMANDS = {
  insertBlock: insertBlockCommand,
  deleteBlock: deleteBlockCommand,
  moveBlock: moveBlockCommand,
  updateBlock: updateBlockCommand,
  swapDocument: swapDocumentCommand,
} as const satisfies Commands;

export type DefaultCommands = typeof DEFAULT_COMMANDS;

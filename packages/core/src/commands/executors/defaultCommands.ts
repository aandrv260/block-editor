import { insertBlockCommand } from "./InsertBlockCommand";
import { deleteBlockCommand } from "./DeleteBlockCommand";
import { moveBlockCommand } from "./MoveBlockCommand";
import { updateBlockCommand } from "./UpdateBlockCommand";
import { insertTextCommand } from "./InsertTextCommand";
import { deleteTextCommand } from "./DeleteTextCommand";
import { toggleMarkCommand } from "./ToggleMarkCommand";
import { splitBlockCommand } from "./SplitBlockCommand";
import { mergeBlocksCommand } from "./MergeBlocksCommand";
import { swapDocumentCommand } from "./SwapDocumentCommand/SwapDocumentCommand";
import type { Commands } from "./commandExecutors.models";

export const DEFAULT_COMMANDS = {
  insertBlock: insertBlockCommand,
  deleteBlock: deleteBlockCommand,
  moveBlock: moveBlockCommand,
  updateBlock: updateBlockCommand,
  swapDocument: swapDocumentCommand,
  insertText: insertTextCommand,
  deleteText: deleteTextCommand,
  toggleMark: toggleMarkCommand,
  splitBlock: splitBlockCommand,
  mergeBlocks: mergeBlocksCommand,
} as const satisfies Commands;

export type DefaultCommands = typeof DEFAULT_COMMANDS;

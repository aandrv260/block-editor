/*
  Actions are a way for the presentation layer to communicate with the editor core. They are highly inspired by Redux actions. Each action is pure and without any side effects.

  They enforce a certain structure and flow of the editor state. This is crucial for the editor to be predictable and consistent. Each action is processed in a central place in the system called the command center through specific commands. Each action is associated with a specific command.

  Actions include things like Editor CRUD, undo, redo, etc.
*/

import type { DeleteBlockAction } from "./action-types/delete-block-action.models";
import type { InsertBlockAction } from "./action-types/insert-block-action.models";
import type { UpdateBlockAction } from "./action-types/update-block-action.models";
import type { MoveBlockAction } from "./action-types/move-block-action.models";
import type { UndoAction } from "./action-types/undo-action.models";
import type { RedoAction } from "./action-types/redo-action.models";
import type { HistoryJumpAction } from "./action-types/history-jump-action.models";
import type { SwapDocumentAction } from "./action-types/swap-document-action.models";
import type { HistorySetAction } from "./action-types/history-set-action.models";

export type EditorActionMap = {
  "block:insert": InsertBlockAction;
  "block:delete": DeleteBlockAction;
  "block:update": UpdateBlockAction;
  "block:move": MoveBlockAction;
  "history:undo": UndoAction;
  "history:redo": RedoAction;
  "history:jump": HistoryJumpAction;
  "document:swap": SwapDocumentAction;
  "history:set": HistorySetAction;
};

export type InsertBlockActionStrategy = "after" | "before" | "append";
export type EditorActionType = keyof EditorActionMap;

export type EditorAction =
  | InsertBlockAction
  | DeleteBlockAction
  | UpdateBlockAction
  | MoveBlockAction
  | UndoAction
  | RedoAction
  | HistoryJumpAction
  | SwapDocumentAction
  | HistorySetAction;

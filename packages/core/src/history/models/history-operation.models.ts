/**
 * History operations are not commands. The command center runs them directly because they only move through the history and never describe a document change.
 */
export type HistoryOperationType =
  | "history:undo"
  | "history:redo"
  | "history:jump"
  | "history:set";

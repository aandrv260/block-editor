import type { DeleteBlockEvent } from "./event-types/delete-block-event.models";
import type { DocumentSwapEvent } from "./event-types/document-swap-event.models";
import type { EditorChangeEvent } from "./event-types/editor-change-event.models";
import type { EditorPersistEvent } from "./event-types/editor-persist-event.models";
import type { HistoryJumpEvent } from "./event-types/history-jump-event.models";
import type { HistoryRedoEvent } from "./event-types/history-redo-event.models";
import type { HistorySetEvent } from "./event-types/history-set-event.models";
import type { HistoryUndoEvent } from "./event-types/history-undo-event.models";
import type { InsertBlockEvent } from "./event-types/insert-block-event.models";
import type { MoveBlockEvent } from "./event-types/move-block-event.models";
import type { UpdateBlockEvent } from "./event-types/update-block-event.models";

export const createInsertBlockEvent = (
  payload: Omit<InsertBlockEvent, "type">,
): InsertBlockEvent => {
  return {
    type: "block:insert",
    blockId: payload.blockId,
    targetId: payload.targetId,
    strategy: payload.strategy,
  };
};

export const createDeleteBlockEvent = (
  payload: Omit<DeleteBlockEvent, "type">,
): DeleteBlockEvent => {
  return {
    type: "block:delete",
    blockId: payload.blockId,
  };
};

export const createUpdateBlockEvent = (
  payload: Omit<UpdateBlockEvent, "type">,
): UpdateBlockEvent => {
  return {
    type: "block:update",
    blockId: payload.blockId,
    childrenStrategy: payload.childrenStrategy,
    newBlock: payload.newBlock,
  };
};

export const createMoveBlockEvent = (
  payload: Omit<MoveBlockEvent, "type">,
): MoveBlockEvent => {
  return {
    type: "block:move",
    blockId: payload.blockId,
    targetId: payload.targetId,
    strategy: payload.strategy,
  };
};

export const createHistoryUndoEvent = (): HistoryUndoEvent => {
  return {
    type: "history:undo",
  };
};

export const createHistoryRedoEvent = (): HistoryRedoEvent => {
  return {
    type: "history:redo",
  };
};
export const createHistoryJumpEvent = (
  payload: Omit<HistoryJumpEvent, "type">,
): HistoryJumpEvent => {
  return {
    type: "history:jump",
    index: payload.index,
  };
};

export const createDocumentSwapEvent = (
  payload: Omit<DocumentSwapEvent, "type">,
): DocumentSwapEvent => {
  return {
    type: "document:swap",
    element: payload.element,
    historyCleared: payload.historyCleared,
  };
};

export const createHistorySetEvent = ({
  history,
  currentPosition,
  currentRecord,
}: Omit<HistorySetEvent, "type">): HistorySetEvent => {
  return {
    type: "history:set",
    history,
    currentPosition,
    currentRecord,
  };
};

export const createEditorPersistEvent = (
  payload: Omit<EditorPersistEvent, "type">,
): EditorPersistEvent => {
  return {
    type: "editor:persist",
    documentJSON: payload.documentJSON,
    history: payload.history,
    triggerAction: payload.triggerAction,
  };
};

export const createEditorChangeEvent = (
  payload: Omit<EditorChangeEvent, "type">,
): EditorChangeEvent => {
  return {
    type: "editor:change",
    documentJSON: payload.documentJSON,
    history: payload.history,
    currentPositionInHistory: payload.currentPositionInHistory,
    root: payload.root,
    triggerAction: payload.triggerAction,
  };
};

import type {
  InsertBlockAction,
  InsertBlockActionPayload,
} from "./action-types/insert-block-action.models";
import type {
  DeleteBlockAction,
  DeleteBlockActionPayload,
} from "./action-types/delete-block-action.models";
import type {
  UpdateBlockAction,
  UpdateBlockActionPayload,
} from "./action-types/update-block-action.models";
import type {
  MoveBlockAction,
  MoveBlockActionPayload,
} from "./action-types/move-block-action.models";
import type { UndoAction } from "./action-types/undo-action.models";
import type { RedoAction } from "./action-types/redo-action.models";
import type { HistoryJumpAction } from "./action-types/history-jump-action.models";
import type {
  SwapDocumentAction,
  SwapDocumentActionPayload,
} from "./action-types/swap-document-action.models";
import type {
  HistorySetAction,
  HistorySetActionPayload,
} from "./action-types/history-set-action.models";

export const insertBlock = (
  payload: InsertBlockActionPayload,
): InsertBlockAction => ({
  type: "block:insert",
  payload,
});

export const deleteBlock = (
  payload: DeleteBlockActionPayload,
): DeleteBlockAction => ({
  type: "block:delete",
  payload,
});

export const updateBlock = (
  payload: UpdateBlockActionPayload,
): UpdateBlockAction => ({
  type: "block:update",
  payload,
});

export const moveBlock = (payload: MoveBlockActionPayload): MoveBlockAction => ({
  type: "block:move",
  payload,
});

export const historyUndo = (): UndoAction => ({
  type: "history:undo",
  payload: null,
});

export const historyRedo = (): RedoAction => ({
  type: "history:redo",
  payload: null,
});

export const historyJump = (index: number): HistoryJumpAction => ({
  type: "history:jump",
  payload: { index },
});

export const swapDocument = (
  payload: SwapDocumentActionPayload,
): SwapDocumentAction => ({
  type: "document:swap",
  payload: { ...payload, clearHistory: payload.clearHistory ?? false },
});

export const historySet = (payload: HistorySetActionPayload): HistorySetAction => ({
  type: "history:set",
  payload,
});

import type { EventBus } from "../event-bus/EventBus";
import type { InsertBlockEvent } from "./event-types/insert-block-event.models";
import type { DeleteBlockEvent } from "./event-types/delete-block-event.models";
import type { UpdateBlockEvent } from "./event-types/update-block-event.models";
import type { MoveBlockEvent } from "./event-types/move-block-event.models";
import type { HistoryUndoEvent } from "./event-types/history-undo-event.models";
import type { HistoryRedoEvent } from "./event-types/history-redo-event.models";
import type { HistoryJumpEvent } from "./event-types/history-jump-event.models";
import type { DocumentSwapEvent } from "./event-types/document-swap-event.models";
import type { EditorPersistEvent } from "./event-types/editor-persist-event.models";
import type { EditorChangeEvent } from "./event-types/editor-change-event.models";
import type { HistorySetEvent } from "./event-types/history-set-event.models";

export type EditorEventsMap = {
  "block:insert": InsertBlockEvent;
  "block:delete": DeleteBlockEvent;
  "block:update": UpdateBlockEvent;
  "block:move": MoveBlockEvent;
  "history:undo": HistoryUndoEvent;
  "history:redo": HistoryRedoEvent;
  "history:jump": HistoryJumpEvent;
  "document:swap": DocumentSwapEvent;
  "editor:persist": EditorPersistEvent;
  "editor:change": EditorChangeEvent;
  "history:set": HistorySetEvent;
};

export type EditorEventType = keyof EditorEventsMap;
export type EditorEvent = EditorEventsMap[EditorEventType];

export type EditorEventHandler<
  TEventType extends EditorEventType = EditorEventType,
> = (event: EditorEventsMap[TEventType]) => void;

export type EditorEventBus = EventBus<EditorEventsMap>;

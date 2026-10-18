import type { EventBus } from "../event-bus/EventBus";
import type { InsertBlockEvent } from "./event-types/insert-block-event.models";
import type { DeleteBlockEvent } from "./event-types/delete-block-event.models";
import type { UpdateBlockEvent } from "./event-types/update-block-event.models";
import type { MoveBlockEvent } from "./event-types/move-block-event.models";
import type { DocumentSwapEvent } from "./event-types/document-swap-event.models";
import type { HistoryUndoEvent } from "./event-types/history-undo-event.models";
import type { HistoryRedoEvent } from "./event-types/history-redo-event.models";
import type { HistoryJumpEvent } from "./event-types/history-jump-event.models";
import type { EditorChangeEvent } from "./event-types/editor-change-event.models";
import type { HistorySetEvent } from "./event-types/history-set-event.models";
import type { HistoryOperationType } from "../../history/models/history-operation.models";
import type {
  CommandType,
  DefaultEditorSchema,
  EditorSchema,
} from "../../editor/editor-schema.models";

type SystemEventsMap<TSchema extends EditorSchema> = {
  "history:undo": HistoryUndoEvent;
  "history:redo": HistoryRedoEvent;
  "history:jump": HistoryJumpEvent;
  "history:set": HistorySetEvent;
  "editor:change": EditorChangeEvent<CommandType<TSchema> | HistoryOperationType>;
};

/**
 * The events commands return. The names are fixed, so they never depend on the command types.
 */
type CommandEventsMap = {
  "block:insert": InsertBlockEvent;
  "block:delete": DeleteBlockEvent;
  "block:update": UpdateBlockEvent;
  "block:move": MoveBlockEvent;
  "document:swap": DocumentSwapEvent;
};

export type CommandEvent = CommandEventsMap[keyof CommandEventsMap];

export type EditorEventsMap<TSchema extends EditorSchema = DefaultEditorSchema> =
  SystemEventsMap<TSchema> & CommandEventsMap;

export type EditorEventType<TSchema extends EditorSchema = DefaultEditorSchema> =
  keyof EditorEventsMap<TSchema> & string;

export type EditorEvent<TSchema extends EditorSchema = DefaultEditorSchema> =
  EditorEventsMap<TSchema>[EditorEventType<TSchema>];

export type EditorEventHandler<
  TSchema extends EditorSchema,
  TEventType extends EditorEventType<TSchema>,
> = (event: EditorEventsMap<TSchema>[TEventType]) => void;

/**
 * The event bus the internals use. Its event names are fixed, so every emit is type-checked.
 */
export type EditorEventBus = EventBus<EditorEventsMap<EditorSchema>>;

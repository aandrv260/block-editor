import type { DeepReadonly } from "@/common/types/object.types";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import type { BlockPayload } from "@/document/models/document-payload.models";
import type {
  ConstructableDocumentElement,
  MoveBlockStrategy,
  UpdateBlockChildrenStrategy,
} from "@/document/models/document.models";
import type {
  CommandType,
  DefaultEditorSchema,
  EditorSchema,
} from "@/editor/editor-schema.models";
import type { HistoryOperationType } from "@/history/models/history-operation.models";
import type { EventBus } from "../event-bus/EventBus";

type NoEventData = Record<never, never>;

type DocumentEventsData = {
  "block:insert": {
    blockId: string;
    targetId: string;
    strategy: "before" | "after" | "append";
  };
  "block:delete": { blockId: string };
  "block:update": {
    blockId: string;
    childrenStrategy: UpdateBlockChildrenStrategy;
    newBlock: BlockPayload;
  };
  "block:move": { blockId: string; targetId: string; strategy: MoveBlockStrategy };
  "document:swap": {
    element: ConstructableDocumentElement;
    historyCleared: boolean;
  };
};

type SystemEventsData<TSchema extends EditorSchema> = {
  "history:undo": NoEventData;
  "history:redo": NoEventData;
  "history:jump": { index: number };
  "history:set": {
    history: readonly string[];
    currentPosition: number;
    currentRecord: string | null;
  };
  "editor:change": {
    documentJSON: string;
    history: string[];
    currentPositionInHistory: number;
    root: DeepReadonly<DocumentRoot>;
    trigger: CommandType<TSchema> | HistoryOperationType;
  };
};

export type EditorEventsData<TSchema extends EditorSchema = DefaultEditorSchema> =
  DocumentEventsData & SystemEventsData<TSchema>;

type EventsOf<TEventsData> = {
  [TType in keyof TEventsData]: { type: TType } & TEventsData[TType];
};

export type EditorEventsMap<TSchema extends EditorSchema = DefaultEditorSchema> =
  EventsOf<EditorEventsData<TSchema>>;

export type EditorEventType<TSchema extends EditorSchema = DefaultEditorSchema> =
  keyof EditorEventsMap<TSchema> & string;

export type EditorEvent<TSchema extends EditorSchema = DefaultEditorSchema> =
  EditorEventsMap<TSchema>[EditorEventType<TSchema>];

export type CommandEvent = EventsOf<DocumentEventsData>[keyof DocumentEventsData];

export type EditorEventHandler<
  TSchema extends EditorSchema,
  TEventType extends EditorEventType<TSchema>,
> = (event: EditorEventsMap<TSchema>[TEventType]) => void;

/**
 * The event bus the internals use. Its event names are fixed, so every emit is type-checked.
 */
export type EditorEventBus = EventBus<EditorEventsMap<EditorSchema>>;

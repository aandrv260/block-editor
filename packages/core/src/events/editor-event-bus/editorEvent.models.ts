import type { Mark } from "@/blocks/models/content/marks/mark.models";
import type { DeepReadonly } from "@/common/types/object.types";
import type { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import type { Block } from "@/blocks/models/block.models";
import type {
  ConstructableDocumentElement,
  MoveBlockStrategy,
  UpdateBlockChildrenStrategy,
} from "@/document/models/document.models";
import type { EventBus } from "../event-bus/EventBus";

type NoEventData = Record<never, never>;

type DocumentEventsData = {
  "block:insert": {
    blockId: string;
    targetId: string;
    strategy: "before" | "after" | "append";
  };
  "block:delete": {
    blockId: string;
  };
  "block:update": {
    blockId: string;
    childrenStrategy: UpdateBlockChildrenStrategy;
    newBlock: DeepReadonly<Block>;
  };
  "block:move": {
    blockId: string;
    targetId: string;
    strategy: MoveBlockStrategy;
  };
  "document:swap": {
    element: ConstructableDocumentElement;
    historyCleared: boolean;
  };
  "text:insert": {
    blockId: string;
    offset: number;
    text: string;
  };
  "text:delete": {
    blockId: string;
    from: number;
    to: number;
  };
  "mark:add": {
    blockId: string;
    from: number;
    to: number;
    mark: Mark;
  };
  "mark:remove": {
    blockId: string;
    from: number;
    to: number;
    mark: Mark;
  };
};

type SystemEventsData = {
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
    trigger: string;
  };
};

export type EditorEventsData = DocumentEventsData & SystemEventsData;

type EventsOf<TEventsData> = {
  [TType in keyof TEventsData]: { type: TType } & TEventsData[TType];
};

export type EditorEventsMap = EventsOf<EditorEventsData>;

export type EditorEventType = keyof EditorEventsMap & string;

export type EditorEvent = EditorEventsMap[EditorEventType];

export type CommandEvent = EventsOf<DocumentEventsData>[keyof DocumentEventsData];

export type EditorEventHandler<TEventType extends EditorEventType> = (
  event: EditorEventsMap[TEventType],
) => void;

/**
 * The event bus the internals use. Its event names are fixed, so every emit is type-checked.
 */
export type EditorEventBus = EventBus<EditorEventsMap>;

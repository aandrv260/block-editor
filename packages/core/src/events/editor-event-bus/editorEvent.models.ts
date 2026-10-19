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

type BuiltInEventsData = DocumentEventsData & SystemEventsData;

type BuiltInEventType = keyof BuiltInEventsData;

export type NoCustomEvents = Record<never, never>;

export type AnyCustomEvents = Record<string, object>;

export type CustomEventsData = AnyCustomEvents & {
  [TType in BuiltInEventType]?: never;
};

export type EditorEventsData<TCustomEvents = NoCustomEvents> = BuiltInEventsData &
  TCustomEvents;

type EventsOf<TEventsData> = {
  [TType in keyof TEventsData]: { type: TType } & TEventsData[TType];
};

export type EditorEventsMap<TCustomEvents = NoCustomEvents> = EventsOf<
  EditorEventsData<TCustomEvents>
>;

export type EditorEventType<TCustomEvents = NoCustomEvents> =
  keyof EditorEventsMap<TCustomEvents> & string;

export type EditorEvent<TCustomEvents = NoCustomEvents> =
  EditorEventsMap<TCustomEvents>[EditorEventType<TCustomEvents>];

export type BuiltInCommandEventsMap = EventsOf<DocumentEventsData>;

export type CommandEventsData<TCustomEvents = NoCustomEvents> = DocumentEventsData &
  TCustomEvents;

export type CommandEventType<TCustomEvents = NoCustomEvents> =
  keyof CommandEventsData<TCustomEvents> & string;

export type CreateCommandEvent<TCustomEvents = NoCustomEvents> = <
  TType extends CommandEventType<TCustomEvents>,
>(
  type: TType,
  data: CommandEventsData<TCustomEvents>[TType],
) => { type: TType } & CommandEventsData<TCustomEvents>[TType];

export type EventsDefinition<TCustomEvents> = {
  readonly events?: TCustomEvents;
};

export type CommandEvent<TCustomEvents = NoCustomEvents> = EventsOf<
  CommandEventsData<TCustomEvents>
>[keyof CommandEventsData<TCustomEvents>];

export type EditorEventHandler<
  TEventType extends EditorEventType<TCustomEvents>,
  TCustomEvents = NoCustomEvents,
> = (event: EditorEventsMap<TCustomEvents>[TEventType]) => void;

export type EditorEventBus<TCustomEvents = NoCustomEvents> = EventBus<
  EditorEventsMap<TCustomEvents>
>;

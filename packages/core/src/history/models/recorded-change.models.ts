import type {
  AnyCustomEvents,
  CommandEvent,
} from "@/events/editor-event-bus/editorEvent.models";

export type RecordedChange = {
  events: CommandEvent<AnyCustomEvents>[];
  time: number;
};

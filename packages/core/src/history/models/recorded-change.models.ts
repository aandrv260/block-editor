import type { CommandEvent } from "@/events/editor-event-bus/editorEvent.models";

export type RecordedChange = {
  events: CommandEvent[];
  time: number;
};

import type { CommandEvent } from "@/events/editor-event-bus/editorEvent.models";
import type { RecordedChange } from "../models/recorded-change.models";

export const DEFAULT_HISTORY_GROUP_DELAY = 500;

const isContinuingTextEdit = (
  lastEvent: CommandEvent,
  newEvent: CommandEvent,
): boolean => {
  if (lastEvent.type === "text:insert" && newEvent.type === "text:insert") {
    return (
      newEvent.blockId === lastEvent.blockId &&
      newEvent.offset === lastEvent.offset + lastEvent.text.length
    );
  }

  if (lastEvent.type === "text:delete" && newEvent.type === "text:delete") {
    return (
      newEvent.blockId === lastEvent.blockId &&
      (newEvent.to === lastEvent.from || newEvent.from === lastEvent.from)
    );
  }

  return false;
};

export const canMergeWithLastChange = (
  lastChange: RecordedChange | null,
  newChange: RecordedChange,
  groupDelay: number,
): boolean => {
  if (!lastChange || newChange.time - lastChange.time > groupDelay) {
    return false;
  }

  const [lastEvent] = lastChange.events;
  const [newEvent] = newChange.events;

  return (
    lastChange.events.length === 1 &&
    newChange.events.length === 1 &&
    isContinuingTextEdit(lastEvent, newEvent)
  );
};

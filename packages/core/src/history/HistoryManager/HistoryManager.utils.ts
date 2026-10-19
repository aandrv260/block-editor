import type {
  AnyCustomEvents,
  CommandEvent,
} from "@/events/editor-event-bus/editorEvent.models";
import { isEventOfType } from "@/events/editor-event-bus/editorEvent.utils";
import type { RecordedChange } from "../models/recorded-change.models";

export const DEFAULT_HISTORY_GROUP_DELAY = 500;

const isContinuingTextEdit = (
  lastEvent: CommandEvent<AnyCustomEvents>,
  newEvent: CommandEvent<AnyCustomEvents>,
): boolean => {
  if (
    isEventOfType(lastEvent, "text:insert") &&
    isEventOfType(newEvent, "text:insert")
  ) {
    return (
      newEvent.blockId === lastEvent.blockId &&
      newEvent.offset === lastEvent.offset + lastEvent.text.length
    );
  }

  if (
    isEventOfType(lastEvent, "text:delete") &&
    isEventOfType(newEvent, "text:delete")
  ) {
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

import type { EditorEventsData, EditorEventType } from "./editorEvent.models";

export const createEvent = <TType extends EditorEventType>(
  type: TType,
  data: EditorEventsData[TType],
): { type: TType } & EditorEventsData[TType] => ({ type, ...data });

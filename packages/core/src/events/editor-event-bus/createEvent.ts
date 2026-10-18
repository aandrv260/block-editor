import type { EditorSchema } from "@/editor/editor-schema.models";
import type { EditorEventsData, EditorEventType } from "./editorEvent.models";

export const createEvent = <TType extends EditorEventType<EditorSchema>>(
  type: TType,
  data: EditorEventsData<EditorSchema>[TType],
): { type: TType } & EditorEventsData<EditorSchema>[TType] => ({ type, ...data });

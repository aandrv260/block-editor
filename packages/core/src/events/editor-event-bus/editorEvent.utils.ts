import type { BuiltInCommandEventsMap } from "./editorEvent.models";

export const isEventOfType = <TType extends keyof BuiltInCommandEventsMap>(
  event: { type: string },
  type: TType,
): event is BuiltInCommandEventsMap[TType] => event.type === type;

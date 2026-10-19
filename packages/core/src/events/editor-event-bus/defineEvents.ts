import type { CustomEventsData, EventsDefinition } from "./editorEvent.models";

export const defineEvents = <
  TCustomEvents extends CustomEventsData,
>(): EventsDefinition<TCustomEvents> => ({});

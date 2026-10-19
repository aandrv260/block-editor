import type { AnyCustomEvents, CreateCommandEvent } from "./editorEvent.models";

export const createCommandEvent: CreateCommandEvent<AnyCustomEvents> = (
  type,
  data,
) => Object.assign({ type }, data);

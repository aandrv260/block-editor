import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";
import type { CommandResult } from "../executors/commandExecutors.models";

export const toCommandEvents = (result: CommandResult): CommandEvent[] =>
  Array.isArray(result) ? result : [result];

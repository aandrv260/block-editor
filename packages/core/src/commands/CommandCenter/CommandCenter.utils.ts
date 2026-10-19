import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";
import type { CommandResult } from "../executors/commandExecutors.models";

export const toCommandEvents = <TCustomEvents>(
  result: CommandResult<TCustomEvents>,
): CommandEvent<TCustomEvents>[] => (Array.isArray(result) ? result : [result]);

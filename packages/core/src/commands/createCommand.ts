import type { CommandEvent } from "@/events/editor-event-bus/editorEvent.models";
import type { CommandContext } from "./executors/commandExecutors.models";

export const createCommand = <TPayload = undefined>(
  command: (context: CommandContext<TPayload>) => CommandEvent,
): ((context: CommandContext<TPayload>) => CommandEvent) => command;

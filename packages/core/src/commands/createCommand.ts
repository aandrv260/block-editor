import type {
  CommandContext,
  CommandResult,
} from "./executors/commandExecutors.models";

export const createCommand = <TPayload = undefined>(
  command: (context: CommandContext<TPayload>) => CommandResult,
): ((context: CommandContext<TPayload>) => CommandResult) => command;

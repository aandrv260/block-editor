import type {
  Command,
  CommandContext,
  CommandResult,
} from "@/commands/executors/commandExecutors.models";
import type { DefaultCommands } from "@/commands/executors/defaultCommands";

export type NoCustomCommands = Record<never, never>;

export type CustomCommands<TCustomEvents> = Record<string, Command<TCustomEvents>>;

export type EditorCommands<TCustomCommands> = DefaultCommands & TCustomCommands;

export type CommandType<TCustomCommands> = keyof EditorCommands<TCustomCommands> &
  string;

export type CommandBuilder<TCustomEvents> = {
  createCommand: <TPayload = void>(
    command: (
      context: CommandContext<TPayload, TCustomEvents>,
    ) => CommandResult<TCustomEvents>,
  ) => (
    context: CommandContext<TPayload, TCustomEvents>,
  ) => CommandResult<TCustomEvents>;
};

export type WithoutBuiltInCommandNames<TCustomCommands> = TCustomCommands & {
  [TType in keyof DefaultCommands]?: never;
};

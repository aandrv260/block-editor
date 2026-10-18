import type {
  Command,
  CommandContext,
  Commands,
} from "@/commands/executors/commandExecutors.models";
import type { DefaultCommands } from "@/commands/executors/defaultCommands";
import type { CommandEvent } from "@/events/editor-event-bus/editorEvent.models";

export interface EditorSchema {
  commands: Commands;
}

export interface DefaultEditorSchema {
  commands: DefaultCommands;
}

export type CommandType<TSchema extends EditorSchema> = keyof TSchema["commands"] &
  string;

type InlineCommand = (context: CommandContext<undefined>) => CommandEvent;

export type CustomCommands<TCommands> = {
  [TType in keyof TCommands]: TType extends keyof DefaultCommands
    ? never
    : TCommands[TType] extends Command
      ? TCommands[TType]
      : InlineCommand;
};

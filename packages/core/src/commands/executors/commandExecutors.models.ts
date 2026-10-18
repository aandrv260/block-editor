import type { EditorDocument } from "../../document/EditorDocument";
import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";

export interface CommandContext<TPayload> {
  payload: TPayload;
  document: EditorDocument;
}

export type Command = (context: CommandContext<never>) => CommandEvent;

export type Commands = Record<string, Command>;

export type CommandPayload<TCommand> = TCommand extends (
  context: CommandContext<infer TPayload>,
) => CommandEvent
  ? TPayload
  : never;

export type CommandArgs = [payload?: unknown];

export type CommandArgsOf<TCommand> = [CommandPayload<TCommand>] extends [void]
  ? [payload?: undefined]
  : [payload: CommandPayload<TCommand>];

export type CommandArgsMap = Record<string, CommandArgs>;

export type CommandArgsMapOf<TCommands extends Commands> = {
  [TType in keyof TCommands]: CommandArgsOf<TCommands[TType]>;
};

export type CommandsFor<TArgsMap extends CommandArgsMap> = {
  [TType in keyof TArgsMap]: (
    context: CommandContext<TArgsMap[TType][0]>,
  ) => CommandEvent;
};

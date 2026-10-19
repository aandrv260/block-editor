import type { EditorDocument } from "../../document/EditorDocument";
import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";

export interface CommandContext<TPayload> {
  payload: TPayload;
  document: EditorDocument;
}

export type CommandResult = CommandEvent | [CommandEvent, ...CommandEvent[]];

export type Command = (context: CommandContext<never>) => CommandResult;
export type Commands = Record<string, Command>;

export type CommandArgsOf<TCommand> = TCommand extends (
  context: CommandContext<infer TPayload>,
) => CommandResult
  ? [TPayload] extends [void]
    ? [payload?: undefined]
    : [payload: TPayload]
  : never;

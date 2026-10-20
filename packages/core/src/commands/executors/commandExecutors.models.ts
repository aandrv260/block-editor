import type { EditorDocument } from "../../document/EditorDocument";
import type {
  AnyCustomEvents,
  CommandEvent,
  CreateCommandEvent,
  NoCustomEvents,
} from "../../events/editor-event-bus/editorEvent.models";

export interface CommandContext<TPayload, TCustomEvents = NoCustomEvents> {
  payload: TPayload;
  document: EditorDocument;
  createEvent: CreateCommandEvent<TCustomEvents>;
}

export type CommandResult<TCustomEvents = NoCustomEvents> =
  | CommandEvent<TCustomEvents>
  | [CommandEvent<TCustomEvents>, ...CommandEvent<TCustomEvents>[]];

export type Command<TCustomEvents = AnyCustomEvents> = (
  context: CommandContext<never, TCustomEvents>,
) => CommandResult<TCustomEvents>;

export type Commands<TCustomEvents = AnyCustomEvents> = Record<
  string,
  Command<TCustomEvents>
>;

export type AnyCommands = Record<string, unknown>;

export type CommandArgsOf<TCommand> = TCommand extends (
  context: infer TContext,
) => unknown
  ? TContext extends { payload: infer TPayload }
    ? [TPayload] extends [void]
      ? [payload?: undefined]
      : [payload: TPayload]
    : never
  : never;

export type CommandOf<TCommands extends AnyCommands> = {
  [TType in keyof TCommands & string]: {
    type: TType;
    payload: CommandArgsOf<TCommands[TType]>[0];
  };
}[keyof TCommands & string];

export type ExecutableCommand = {
  type: string;
  payload: unknown;
};

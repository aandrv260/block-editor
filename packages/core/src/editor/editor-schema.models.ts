import type {
  CommandArgsMap,
  CommandArgsMapOf,
  CommandsFor,
} from "@/commands/executors/commandExecutors.models";
import type { DefaultCommands } from "@/commands/executors/defaultCommands";

export type Blocks = Record<string, never>;

export interface EditorSchema {
  commands: CommandArgsMap;
  blocks: Blocks;
}

export interface DefaultEditorSchema {
  commands: CommandArgsMapOf<DefaultCommands>;
  blocks: Blocks;
}

export type CommandType<TSchema extends EditorSchema> = keyof TSchema["commands"] &
  string;

export type CustomCommandsFor<TSchema extends EditorSchema> = Omit<
  CommandsFor<TSchema["commands"]>,
  keyof DefaultCommands
>;

export type CommandPayloadOf<
  TSchema extends EditorSchema,
  TType extends CommandType<TSchema>,
> = TSchema["commands"][TType][0];

export type EditorActionOf<TSchema extends EditorSchema> = {
  [TType in CommandType<TSchema>]: {
    type: TType;
    payload: CommandPayloadOf<TSchema, TType>;
  };
}[CommandType<TSchema>];

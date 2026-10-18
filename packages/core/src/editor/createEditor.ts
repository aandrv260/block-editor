import type { DefaultCommands } from "@/commands/executors/defaultCommands";
import { Editor, type EditorConfig } from "./Editor";
import type { CustomCommands } from "./editor-schema.models";

interface CreateEditorConfig<TCommands> extends Pick<
  EditorConfig,
  "initialDocument" | "historyLimit"
> {
  /**
   * Add custom commands to your editor.
   */
  commands?: TCommands & CustomCommands<TCommands>;
}

export const createEditor = <
  TCommands extends Record<string, unknown> = Record<never, never>,
>(
  config: CreateEditorConfig<TCommands> = {},
): Editor<{ commands: DefaultCommands & CustomCommands<TCommands> }> => {
  type TEditorCommands = DefaultCommands & CustomCommands<TCommands>;

  return new Editor<{ commands: TEditorCommands }>({
    ...config,
    commands: config.commands as Partial<TEditorCommands>,
  });
};

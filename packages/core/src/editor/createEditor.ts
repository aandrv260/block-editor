import type {
  AnyCustomEvents,
  NoCustomEvents,
} from "@/events/editor-event-bus/editorEvent.models";
import { Editor, type EditorConfig } from "./Editor";
import type { CustomCommands, NoCustomCommands } from "./editor-commands.models";

export const createEditor = <
  TCustomEvents extends AnyCustomEvents = NoCustomEvents,
  TCustomCommands extends CustomCommands<TCustomEvents> = NoCustomCommands,
>(
  config: EditorConfig<TCustomEvents, TCustomCommands> = {},
): Editor<TCustomEvents, TCustomCommands> => new Editor(config);

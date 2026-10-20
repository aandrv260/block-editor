import type {
  CustomCommands,
  NoCustomCommands,
} from "@/editor/editor-commands.models";
import type {
  AnyCustomEvents,
  NoCustomEvents,
} from "@/events/editor-event-bus/editorEvent.models";
import type { Extension } from "./models/extension.models";

/**
 * Types an extension and returns it unchanged.
 * Its custom events and commands become part of the types of every editor that uses it.
 *
 * Put `commands` before `onBeforeCommand`, `onAfterCommand` and `onBeforeCommit`, so those hooks can see the extension's own commands.
 *
 * Calling `abort` in a hook rolls back the whole transaction, not only the current command.
 *
 * Example:
 * ```TS
 * const ClearDocumentExtension = defineExtension({
 *   name: "ClearDocumentExtension",
 *   events: defineEvents<{
 *     "document:clear": { removedBlocks: number };
 *   }>(),
 *   commands: ({ createCommand }) => ({
 *     clearDocument: createCommand(({ document, createEvent }) => {
 *       const blocks = [...document.getRoot().children];
 *
 *       blocks.forEach(block => document.remove(block.id));
 *
 *       return createEvent("document:clear", {
 *         removedBlocks: blocks.length,
 *       });
 *     }),
 *   }),
 *   onBeforeCommand: ({ command, document, abort }) => {
 *     const isEmpty = document.getRoot().children.length === 0;
 *
 *     if (command.type === "clearDocument" && isEmpty) {
 *       abort();
 *     }
 *   },
 * });
 *
 * const editor = new Editor({ extensions: [ClearDocumentExtension] });
 *
 * editor.execute("clearDocument");
 * editor.subscribe("document:clear", event => console.log(event.removedBlocks));
 * ```
 */
export const defineExtension = <
  TEvents extends AnyCustomEvents = NoCustomEvents,
  TCommands extends CustomCommands<TEvents> = NoCustomCommands,
>(
  extension: Extension<TEvents, TCommands>,
): Extension<TEvents, TCommands> => extension;

// Expose to the outside world.
// TODO: Consider before the release of a stable version 1.0.0 to use a more specific export strategy. For example, allow the user to import only the parts of the core they need like `import { EditorDocument } from "@block-editor/core/document";`.
export * from "./blocks";
export * from "./document";
export * from "./actions";
export * from "./errors";
export * from "./history";
export * from "./events";
export * from "./editor";
export * from "./common";
export { createCommand } from "./commands/createCommand";
export type {
  CommandContext,
  Commands,
} from "./commands/executors/commandExecutors.models";

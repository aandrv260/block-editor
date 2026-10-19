import type { Extension } from "./models/extension.models";

/**
 * Types an extension and returns it unchanged.
 *
 * Example:
 * ```TS
 * const readOnly = defineExtension({
 *   name: "readOnly",
 *   beforeCommand: ({ abort }) => abort(),
 * });
 *
 * const editor = new Editor({ extensions: [readOnly] });
 * ```
 */
export const defineExtension = (extension: Extension): Extension => extension;

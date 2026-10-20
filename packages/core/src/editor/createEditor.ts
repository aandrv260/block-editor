import type { AnyExtension } from "@/extensions/models/extension.models";
import { Editor, type EditorConfig } from "./Editor";

export const createEditor = <
  const TExtensions extends readonly AnyExtension[] = readonly AnyExtension[],
>(
  config: EditorConfig<TExtensions> = {},
): Editor<TExtensions> => new Editor(config);

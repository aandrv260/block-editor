import { Editor } from "@block-editor/core";
import type { BlockRendererOverrides } from "../models/block-ui.models";
import type { EditorKeymap } from "./EditorContext";

export interface EditorProviderProps {
  // TODO: This is typed `Editor` for debugging and dev purposes. Use the IEditor interface to decouple.
  editor: Editor;
  blockOverrides?: BlockRendererOverrides;
  keymap?: Partial<EditorKeymap>;
  children: React.ReactNode;
}

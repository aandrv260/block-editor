import type { IEditor } from "@block-editor/core";
import type { BlockRendererOverrides } from "../models/block-ui.models";
import type { EditorKeymap } from "./EditorContext";

export interface EditorProviderProps {
  editor: IEditor;
  blockOverrides?: BlockRendererOverrides;
  keymap?: Partial<EditorKeymap>;
  children: React.ReactNode;
}

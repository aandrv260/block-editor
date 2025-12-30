import { createContext } from "react";
import type { Editor } from "@block-editor/core";
import type { DeepReadonly } from "@block-editor/core";
import type { DocumentRoot } from "@block-editor/core";
import type { BlockRendererMap } from "../models/block-ui.models";

// TODO: Organize into a separate file
export interface EditorDocumentValue {
  json: string;
  root: DeepReadonly<DocumentRoot>;
}

export interface EditorHistoryValue {
  historyRecords: readonly string[];
  currentPositionInHistory: number;
}

export interface EditorKeymap {
  /**
   * The undo key combination. The default is `META` + `Z` on Mac and `CTRL` + `Z` on Windows.
   * @returns Whether the undo key combination should be triggered.
   */
  shouldUndo: (event: KeyboardEvent) => boolean;

  /**
   * The redo key combination. The default is `META` + `SHIFT` + `Z` on Mac and `CTRL` + `SHIFT` + `Z` on Windows.
   * @returns Whether the redo key combination should be triggered.
   */
  shouldRedo: (event: KeyboardEvent) => boolean;
}

export interface EditorContextValue {
  // TODO: This is typed `Editor` for debugging and dev purposes. Use the IEditor interface to decouple before publishing alpha version.
  editor: Editor;
  editorDocument: EditorDocumentValue;
  history: EditorHistoryValue;
  blockRendererMap: BlockRendererMap;
  keymap: EditorKeymap;
  blockElementsMap: Map<string, HTMLElement>;
  addBlockHTMLElement: (blockId: string, element: HTMLElement) => void;
  removeBlockHTMLElement: (blockId: string) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

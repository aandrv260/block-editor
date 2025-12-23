import { useEffect, useMemo, useState } from "react";
import {
  EditorContext,
  type EditorContextValue,
  type EditorDocumentValue,
  type EditorHistoryValue,
  type EditorKeymap,
} from "./EditorContext";
import type { BlockRendererMap } from "@/models/block-ui.models";
import { DEFAULT_BLOCK_RENDER_MAP } from "../utils/defaultBlockRenderMap";
import type { EditorProviderProps } from "./EditorProvider.types";
import { DEFAULT_EDITOR_KEYMAP } from "./EditorProvider.utils";

// TODO: Restructure the folders and files but after I implement the difficult carret focus logic.

// TODO: This is not going to scale well. For instance, when the history or the editorDocument changes, only the parts of the tree (blocks) that are affected should be re-rendered. This will very quickly become a bottleneck as the tree grows. I need to handle this with `useSyncExternalStore` and make the DOM re-render like Redux, Zustand do. I can't force consumers of this lib to use any of those state management libs so I must implement a simple solution from scratch.

export default function EditorProvider({
  editor,
  blockOverrides = {},
  keymap: keymapOverrides = {},
  children,
}: EditorProviderProps) {
  const [history, setHistory] = useState<EditorHistoryValue>(() => ({
    historyRecords: editor.getHistory(),
    currentPositionInHistory: editor.getCurrentPositionInHistory(),
  }));

  const [editorDocument, setEditorDocument] = useState<EditorDocumentValue>(() => ({
    json: editor.getDocumentJSON(),
    root: editor.getRoot(),
  }));

  const blockRendererMap = useMemo<BlockRendererMap>(() => {
    return { ...DEFAULT_BLOCK_RENDER_MAP, ...blockOverrides };
  }, [blockOverrides]);

  const keymap = useMemo<EditorKeymap>(
    () => ({ ...DEFAULT_EDITOR_KEYMAP, ...keymapOverrides }),
    [keymapOverrides],
  );

  useEffect(() => {
    // TODO: Swap with history:change event when it's implemented to reduce re-renders.
    const unsubscribe = editor.subscribe("editor:change", event => {
      setHistory({
        historyRecords: event.history,
        currentPositionInHistory: event.currentPositionInHistory,
      });

      setEditorDocument({
        json: event.documentJSON,
        root: event.root,
      });
    });

    return () => {
      unsubscribe();
      editor.cleanup();
    };
  }, [editor]);

  const value = useMemo<EditorContextValue>(
    () => ({ editor, editorDocument, blockRendererMap, history, keymap }),
    [editor, editorDocument, blockRendererMap, history, keymap],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

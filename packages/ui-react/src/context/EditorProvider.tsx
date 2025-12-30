import { useEffect, useMemo } from "react";
import { EditorContext, type EditorContextValue } from "./EditorContext";
import type { EditorProviderProps } from "./EditorProvider.types";
import { useHistoryState } from "./hooks/useHistoryState";
import { useDocumentState } from "./hooks/useDocumentState";
import { useBlockState } from "./hooks/useBlockState";
import { useEditorKeymapState } from "./hooks/useEditorKeymapState";

// TODO: Restructure the folders and files but after I implement the difficult carret focus logic.

// TODO: This is not going to scale well. For instance, when the history or the editorDocument changes, only the parts of the tree (blocks) that are affected should be re-rendered. This will very quickly become a bottleneck as the tree grows. I need to handle this with `useSyncExternalStore` and make the DOM re-render like Redux, Zustand do. I can't force consumers of this lib to use any of those state management libs so I must implement a simple solution from scratch.

export default function EditorProvider({
  editor,
  blockOverrides = {},
  keymap: keymapOverrides = {},
  children,
}: EditorProviderProps) {
  const { history, setHistory } = useHistoryState(editor);
  const { editorDocument, setEditorDocument } = useDocumentState(editor);
  const { keymap } = useEditorKeymapState(keymapOverrides);

  const {
    blockElementsMap,
    blockRendererMap,
    addBlockHTMLElement,
    removeBlockHTMLElement,
  } = useBlockState(blockOverrides);

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
  }, [editor, setHistory, setEditorDocument]);

  const value = useMemo<EditorContextValue>(
    () => ({
      editor,
      editorDocument,
      blockRendererMap,
      history,
      keymap,
      blockElementsMap,
      addBlockHTMLElement,
      removeBlockHTMLElement,
    }),
    [
      editor,
      editorDocument,
      blockRendererMap,
      history,
      keymap,
      blockElementsMap,
      addBlockHTMLElement,
      removeBlockHTMLElement,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

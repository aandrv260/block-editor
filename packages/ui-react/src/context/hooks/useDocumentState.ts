import type { Editor } from "@block-editor/core";
import type { EditorDocumentValue } from "../EditorContext";
import { useState } from "react";

export const useDocumentState = (editor: Editor) => {
  const [editorDocument, setEditorDocument] = useState<EditorDocumentValue>(() => ({
    json: editor.getDocumentJSON(),
    root: editor.getRoot(),
  }));

  return {
    editorDocument,
    setEditorDocument,
  };
};

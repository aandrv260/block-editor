import type { Editor, DeepReadonly, DocumentRoot } from "@block-editor/core";
import { useEditorContext } from "../context/hooks/useEditorContext";

interface UseEditorResult {
  editor: Editor;
  documentRoot: DeepReadonly<DocumentRoot>;
  documentJSON: string;
}

export const useEditor = (): UseEditorResult => {
  const { editor, editorDocument } = useEditorContext();

  return {
    editor,
    documentRoot: editorDocument.root,
    documentJSON: editorDocument.json,
  };
};

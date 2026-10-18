import type { DeepReadonly, DocumentRoot, IEditor } from "@block-editor/core";
import { useEditorContext } from "../context/hooks/useEditorContext";

interface UseEditorResult<TEditor extends IEditor> {
  editor: TEditor;
  documentRoot: DeepReadonly<DocumentRoot>;
  documentJSON: string;
}

export const useEditor = <
  TEditor extends IEditor = IEditor,
>(): UseEditorResult<TEditor> => {
  const { editor, editorDocument } = useEditorContext();

  return {
    editor: editor as TEditor,
    documentRoot: editorDocument.root,
    documentJSON: editorDocument.json,
  };
};

useEditor.withTypes = <TEditor extends IEditor>() => useEditor<TEditor>;

import { useCallback } from "react";
import type { EditorAction } from "@block-editor/core";
import { useEditorContext } from "../../context/useEditorContext";

export const useDispatcher = () => {
  const { editor } = useEditorContext();

  const dispatch = useCallback(
    (action: EditorAction) => {
      editor.dispatchAction(action);
    },
    [editor],
  );

  return dispatch;
};

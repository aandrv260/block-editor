import { useCallback } from "react";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useHistoryActions = () => {
  const { editor } = useEditorContext();

  const undo = useCallback(() => {
    editor.undo();
  }, [editor]);

  const redo = useCallback(() => {
    editor.redo();
  }, [editor]);

  const jumpToPointInHistory = useCallback(
    (index: number) => {
      editor.jumpToPointInHistory(index);
    },
    [editor],
  );

  return {
    undo,
    redo,
    jumpToPointInHistory,
  };
};

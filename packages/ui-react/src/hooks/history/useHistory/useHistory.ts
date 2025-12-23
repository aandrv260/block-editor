import { useCallback } from "react";
import { useEditorContext } from "../../../context/useEditorContext";
import { useEditor } from "../../useEditor";

export const useHistory = () => {
  const { editor } = useEditor();

  const {
    history: { historyRecords, ...rest },
  } = useEditorContext();

  const clearHistory = useCallback(() => {
    editor.setHistory([]);
  }, [editor]);

  const setHistory = useCallback(
    (history: string[]) => {
      editor.setHistory(history);
    },
    [editor],
  );

  const isHistoryEmpty = historyRecords.length === 0;

  return {
    history: historyRecords,
    clearHistory,
    setHistory,
    isHistoryEmpty,
    ...rest,
  };
};

import { useState } from "react";
import type { EditorHistoryValue } from "../EditorContext";
import type { IEditor } from "@block-editor/core";

export const useHistoryState = (editor: IEditor) => {
  const [history, setHistory] = useState<EditorHistoryValue>(() => ({
    historyRecords: editor.getHistory(),
    currentPositionInHistory: editor.getCurrentPositionInHistory(),
  }));

  return {
    history,
    setHistory,
  };
};

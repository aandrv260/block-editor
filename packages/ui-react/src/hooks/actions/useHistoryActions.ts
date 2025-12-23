import { historyRedo, historyUndo, historyJump } from "@block-editor/core";
import { useDispatcher } from "./useDispatcher";
import { useCallback } from "react";

export const useHistoryActions = () => {
  const dispatch = useDispatcher();

  const undo = useCallback(() => {
    dispatch(historyUndo());
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch(historyRedo());
  }, [dispatch]);

  const jumpToPointInHistory = useCallback(
    (index: number) => {
      dispatch(historyJump(index));
    },
    [dispatch],
  );

  return {
    undo,
    redo,
    jumpToPointInHistory,
  };
};

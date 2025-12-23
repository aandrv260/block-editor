import {
  type MoveBlockActionPayload,
  moveBlock as moveBlockAction,
} from "@block-editor/core";
import { useDispatcher } from "./useDispatcher";
import { useCallback } from "react";

export const useMoveBlock = () => {
  const dispatch = useDispatcher();

  const moveBlock = useCallback(
    (payload: MoveBlockActionPayload) => {
      dispatch(moveBlockAction(payload));
    },
    [dispatch],
  );

  return moveBlock;
};

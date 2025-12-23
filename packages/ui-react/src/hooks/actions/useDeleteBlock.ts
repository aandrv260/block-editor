import { useCallback } from "react";
import { useDispatcher } from "./useDispatcher";
import {
  type DeleteBlockActionPayload,
  deleteBlock as deleteBlockAction,
} from "@block-editor/core";

export const useDeleteBlock = () => {
  const dispatch = useDispatcher();

  const deleteBlock = useCallback(
    (payload: DeleteBlockActionPayload) => {
      dispatch(deleteBlockAction(payload));
    },
    [dispatch],
  );

  return deleteBlock;
};

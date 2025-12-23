import { useCallback } from "react";
import { useDispatcher } from "./useDispatcher";
import {
  type BlockPayload,
  type UpdateBlockChildrenStrategy,
  updateBlock as updateBlockAction,
} from "@block-editor/core";

interface UpdatePayload {
  blockId: string;
  newBlock: BlockPayload;
  childrenStrategy: UpdateBlockChildrenStrategy;
}

export const useUpdateBlock = () => {
  const dispatch = useDispatcher();

  const updateBlock = useCallback(
    (payload: UpdatePayload) => {
      dispatch(updateBlockAction({ ...payload }));
    },
    [dispatch],
  );

  return updateBlock;
};

import { useCallback } from "react";
import { useDispatcher } from "./useDispatcher";
import {
  type InsertBlockActionPayload,
  insertBlock as insertBlockAction,
} from "@block-editor/core";

export const useInsertBlock = () => {
  const dispatch = useDispatcher();

  const insertBlock = useCallback(
    (payload: InsertBlockActionPayload) => {
      dispatch(insertBlockAction(payload));
    },
    [dispatch],
  );

  return insertBlock;
};

import { useCallback } from "react";
import type { InsertBlockPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useInsertBlock = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: InsertBlockPayload) => {
      editor.execute("block:insert", payload);
    },
    [editor],
  );
};

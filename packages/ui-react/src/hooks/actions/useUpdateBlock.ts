import { useCallback } from "react";
import type { UpdateBlockPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useUpdateBlock = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: UpdateBlockPayload) => {
      editor.execute("block:update", payload);
    },
    [editor],
  );
};

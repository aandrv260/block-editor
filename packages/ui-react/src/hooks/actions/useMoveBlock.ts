import { useCallback } from "react";
import type { MoveBlockPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useMoveBlock = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: MoveBlockPayload) => {
      editor.execute("block:move", payload);
    },
    [editor],
  );
};

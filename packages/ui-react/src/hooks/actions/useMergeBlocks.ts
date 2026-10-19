import { useCallback } from "react";
import type { MergeBlocksPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useMergeBlocks = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: MergeBlocksPayload) => {
      editor.execute("mergeBlocks", payload);
    },
    [editor],
  );
};

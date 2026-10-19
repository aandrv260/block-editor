import { useCallback } from "react";
import type { SplitBlockPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useSplitBlock = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: SplitBlockPayload) => {
      editor.execute("splitBlock", payload);
    },
    [editor],
  );
};

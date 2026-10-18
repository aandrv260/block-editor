import { useCallback } from "react";
import type { DeleteBlockPayload } from "@block-editor/core";
import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useDeleteBlock = () => {
  const { editor } = useEditorContext();

  return useCallback(
    (payload: DeleteBlockPayload) => {
      editor.execute("deleteBlock", payload);
    },
    [editor],
  );
};

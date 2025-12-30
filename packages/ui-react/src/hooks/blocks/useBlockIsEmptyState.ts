import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useCallback, useState } from "react";

export const useBlockIsEmptyState = (block: DeepReadonly<HeadingBlock>) => {
  const [showEmptyText, setShowEmptyText] = useState(block.data.text === "");

  const updateIsEmptyText = useCallback((newValue: string) => {
    setShowEmptyText(newValue === "");
  }, []);

  return { showEmptyText, updateIsEmptyText };
};

import { isElementFocused } from "@/common/dom-state/focus.utils";
import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useCallback, useState } from "react";
import { useEditor } from "../useEditor";

export const useBlockIsEmptyState = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const [showEmptyText, setShowEmptyText] = useState(block.data.text === "");
  const { editor } = useEditor();

  const updateIsEmptyText = useCallback((newValue: string) => {
    setShowEmptyText(newValue === "");
  }, []);

  const showEmptyTextOnFocus = () => {
    setShowEmptyText(
      headingRef.current?.innerText === "" && isElementFocused(headingRef.current),
    );
  };

  const removeEmptyTextOnBlur = () => {
    const isOnlyBlockInDocument =
      editor.getDocumentSize() === 2 && editor.getBlock(block.id) === block;

    if (isOnlyBlockInDocument) return;

    setShowEmptyText(false);
  };

  return {
    showEmptyText,
    updateIsEmptyText,
    showEmptyTextOnFocus,
    removeEmptyTextOnBlur,
  };
};

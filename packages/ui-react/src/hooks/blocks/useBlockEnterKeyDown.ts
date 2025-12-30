import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useEnterKeyBlockCreation } from "./useEnterKeyBlockCreation";
import { useEnterKeyInBeginningSplitBlock } from "./useEnterKeyInBeginningSplitBlock";
import {
  isFocusedAndCaretAtEnd,
  isFocusedAndCaretAtStart,
} from "@/utils/focus-caret.utils";

export const useBlockEnterKeyDown = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { createNewBlockOnEnterKeyInEnd } = useEnterKeyBlockCreation(block);
  const { splitBlockOnEnterKeyInBeginning } = useEnterKeyInBeginningSplitBlock(
    block,
    headingRef,
  );

  const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const isShiftKeyPressed = event.shiftKey;
    const isBlockFocusedAndCaretAtEnd = isFocusedAndCaretAtEnd(headingRef.current);

    if (isFocusedAndCaretAtStart(headingRef.current)) {
      event.preventDefault();
      event.stopPropagation();
      splitBlockOnEnterKeyInBeginning();
      return;
    }

    if (!isBlockFocusedAndCaretAtEnd) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!isShiftKeyPressed && isBlockFocusedAndCaretAtEnd) {
      event.preventDefault();
      event.stopPropagation();
      createNewBlockOnEnterKeyInEnd();
    }
  };

  return { handleEnterKeyDown };
};

import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useEnterKeyBlockCreation } from "./useEnterKeyBlockCreation";
import { useEnterKeyInBeginningSplitBlock } from "./useEnterKeyInBeginningSplitBlock";
import {
  isFocusedAndCaretAtEnd,
  isFocusedAndCaretAtStart,
} from "@/utils/caret/caret-position-checks.utils";
import { useEnterKeyInMiddleSplitBlock } from "./useEnterKeyInMiddleSplitBlock";

export const useBlockEnterKeyDown = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { createNewBlockOnEnterKeyInEnd } = useEnterKeyBlockCreation(block);
  const { splitBlockOnEnterKeyInBeginning } = useEnterKeyInBeginningSplitBlock(
    block,
    headingRef,
  );

  const { splitBlockOnEnterKeyInMiddle } = useEnterKeyInMiddleSplitBlock(
    block,
    headingRef,
  );

  const handleEnterKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const isBlockFocusedAndCaretAtEnd = isFocusedAndCaretAtEnd(headingRef.current);

    event.preventDefault();
    event.stopPropagation();

    if (isFocusedAndCaretAtStart(headingRef.current)) {
      splitBlockOnEnterKeyInBeginning();
      return;
    }

    if (!isBlockFocusedAndCaretAtEnd) {
      splitBlockOnEnterKeyInMiddle();
      return;
    }

    if (!event.shiftKey && isBlockFocusedAndCaretAtEnd) {
      createNewBlockOnEnterKeyInEnd();
      return;
    }
  };

  return { handleEnterKeyDown };
};

import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { isFocusedAndCaretAtEnd } from "@/utils/focus-caret.utils";
import { useInsertBlock } from "../actions/useInsertBlock";

export const useEnterKeyBlockCreation = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const insertBlock = useInsertBlock();

  const handleEnterForNewBlockCreation = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (!headingRef.current) return;

    const isShiftKeyPressed = event.shiftKey;
    const isBlockFocusedAndCaretAtEnd = isFocusedAndCaretAtEnd(headingRef.current);

    if (!isBlockFocusedAndCaretAtEnd) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!isShiftKeyPressed && isBlockFocusedAndCaretAtEnd) {
      event.preventDefault();
      event.stopPropagation();

      insertBlock({
        strategy: "after",
        newBlock: {
          type: "heading",
          data: { text: "", level: block.data.level },
          id: crypto.randomUUID(),
        },
        targetId: block.id,
      });
    }
  };

  return { handleEnterForNewBlockCreation };
};

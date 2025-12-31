import type { Block, DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useUpdateBlock } from "../actions/useUpdateBlock";
import { useEffect } from "react";
import { updateContentWithCaretPreservation } from "@/utils/caret/update-caret.utils";
import { shouldSkipContentUpdate } from "@/utils/caret/caret-position-checks.utils";

/**
 * Handles inputs and caret normalization during text input.
 */
export const useBlockTextInput = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
  updateIsEmptyText: (newValue: string) => void,
) => {
  const updateBlock = useUpdateBlock();

  useEffect(() => {
    if (!headingRef.current) return;

    if (shouldSkipContentUpdate(headingRef.current, block.data.text)) {
      return;
    }

    updateContentWithCaretPreservation(headingRef.current, block.data.text);
  }, [block.data.text, headingRef]);

  const onInput = (event: React.FormEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const newValue =
      event.currentTarget.innerText === "\n" ? "" : event.currentTarget.innerText;

    updateIsEmptyText(newValue);

    if (newValue === "") {
      headingRef.current.innerText = "";
    }

    const currentBlock = block as Block;

    updateBlock({
      blockId: block.id,
      newBlock: {
        ...currentBlock,
        type: "heading",
        data: { ...block.data, text: newValue },
      },
      childrenStrategy: "drop",
    });

    updateIsEmptyText(newValue);
  };

  return onInput;
};

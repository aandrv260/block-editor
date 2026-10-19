import {
  getPlainText,
  normalizeContent,
  type Block,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
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
  const text = getPlainText(block.data.content);

  useEffect(() => {
    if (!headingRef.current) return;

    if (shouldSkipContentUpdate(headingRef.current, text)) {
      return;
    }

    updateContentWithCaretPreservation(headingRef.current, text);
  }, [text, headingRef]);

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
        data: {
          ...block.data,
          content: normalizeContent([{ text: newValue, marks: [] }]),
        },
      },
      childrenStrategy: "drop",
    });

    updateIsEmptyText(newValue);
  };

  return onInput;
};

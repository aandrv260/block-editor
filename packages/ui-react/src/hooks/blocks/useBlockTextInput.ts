import {
  getPlainText,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
import { useEditor } from "../useEditor";
import { useEffect } from "react";
import { updateContentWithCaretPreservation } from "@/utils/caret/update-caret.utils";
import { shouldSkipContentUpdate } from "@/utils/caret/caret-position-checks.utils";
import { getTextChange } from "@/utils/text/text-change.utils";

/**
 * Handles inputs and caret normalization during text input.
 */
export const useBlockTextInput = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
  updateIsEmptyText: (newValue: string) => void,
) => {
  const { editor } = useEditor();
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

    const currentBlock = editor.getBlock<HeadingBlock>(block.id);

    if (!currentBlock) return;

    const textChange = getTextChange(
      getPlainText(currentBlock.data.content),
      newValue,
    );

    if (!textChange) {
      return;
    }

    const { from, to, insertedText } = textChange;

    editor.transaction(tx => {
      if (from !== to) {
        tx.execute("deleteText", { blockId: block.id, from, to });
      }

      if (insertedText) {
        tx.execute("insertText", {
          blockId: block.id,
          offset: from,
          text: insertedText,
        });
      }
    });

    updateIsEmptyText(newValue);
  };

  return onInput;
};

import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useDeleteBlock } from "../actions/useDeleteBlock";
import { useEditor } from "../useEditor";
import { useBlockSiblings } from "./useBlockSiblings";
import { focusCaretTo } from "@/utils/caret/focus-caret.utils";

/**
 * Handles the deletion of an entire block when the Backspace key is pressed and the current block is empty.
 */
export const useBackpaceDeleteEntireBlock = (block: DeepReadonly<HeadingBlock>) => {
  const { editor } = useEditor();
  const deleteBlock = useDeleteBlock();
  const { getPreviousBlockHTMLElement } = useBlockSiblings(block);

  const handleEntireBlockDeletion = (event: React.KeyboardEvent<HTMLElement>) => {
    const isOnlyBlockInDocument = editor.isOnlyBlockInDocument(block.id);

    if (isOnlyBlockInDocument) {
      return;
    }

    // TODO: Test that this focuses exactly the previous block even when there are 3 or more blocks.

    const previousBlockHTMLElement = getPreviousBlockHTMLElement();

    if (!previousBlockHTMLElement) return;

    // Prevent the browser's default Backspace behavior. Without this, after we move focus
    // to the previous block, the browser would delete the last character in that block by default.
    event.preventDefault();

    deleteBlock({ blockId: block.id });
    focusCaretTo("end", previousBlockHTMLElement);
  };

  return { handleEntireBlockDeletion };
};

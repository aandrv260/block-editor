import { focusCaretTo } from "@/utils/focus-caret.utils";
import type {
  Block,
  DeepReadonly,
  DocumentRoot,
  HeadingBlock,
} from "@block-editor/core";
import { useDeleteBlock } from "../actions/useDeleteBlock";
import { useBlockElementMap } from "./useBlockElementMap";
import { useEditor } from "../useEditor";

export const useBackspaceBlockDeletion = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { editor } = useEditor();
  const { blockElementsMap } = useBlockElementMap();
  const deleteBlock = useDeleteBlock();

  const getPreviousBlock = (): DeepReadonly<Block | DocumentRoot> | null => {
    const parentBlock = editor.getBlock(block.parentId);
    const parentChildren = parentBlock?.children;

    if (!parentChildren) return null;

    const previousBlockIndex = parentChildren.findIndex(
      child => child.id === block.id,
    );

    if (previousBlockIndex === -1 || previousBlockIndex === 0) return null;

    return parentChildren.at(previousBlockIndex - 1) ?? null;
  };

  const getPreviousBlockHTMLElement = (): HTMLElement | null => {
    const previousBlock = getPreviousBlock();

    if (!previousBlock) return null;

    return blockElementsMap.get(previousBlock.id) ?? null;
  };

  const handleBackspaceForBlockDeletion = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (!headingRef.current || headingRef.current.innerText !== "") return;

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

  return { handleBackspaceForBlockDeletion };
};

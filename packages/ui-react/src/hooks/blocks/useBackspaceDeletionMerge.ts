import type { Block, DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useDeleteBlock } from "../actions/useDeleteBlock";
import { useUpdateBlock } from "../actions/useUpdateBlock";
import { useBlockElementMap } from "./useBlockElementMap";
import { useBlockSiblings } from "./useBlockSiblings";
import { setCaretOffset } from "@/utils/caret/caret-offset.utils";
import { isCaretAtStart } from "@/utils/caret/caret-position-checks.utils";

export const useBackspaceDeletionMerge = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();
  const { blockElementsMap } = useBlockElementMap();
  const { getPreviousBlock } = useBlockSiblings(block);

  const prepareBlockMerge = () => {
    if (!headingRef.current) return null;

    const currentBlockElement = headingRef.current;
    const currentBlockText = currentBlockElement.innerText;

    if (currentBlockText === "" || !isCaretAtStart(currentBlockElement)) return null;

    const previousBlock = getPreviousBlock();
    if (!previousBlock) return null;

    const previousBlockHTMLElement = blockElementsMap.get(previousBlock.id);
    if (!previousBlockHTMLElement) return null;

    // TODO: Later when I add UI support for other blocks, I will remove this casting. For now, leave it as is.
    const previousBlockText = (previousBlock as HeadingBlock).data.text;
    const previousBlockTextLength = previousBlockText.length;

    const mergedText = previousBlockText + currentBlockText;

    return {
      previousBlockId: previousBlock.id,
      previousBlockText,
      previousBlockTextLength,
      currentBlockText,
      mergedText,
      previousBlockHTMLElement,
      previousBlock: previousBlock as HeadingBlock,
    };
  };

  const handleBackspaceForBlockMerge = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const mergeData = prepareBlockMerge();

    if (!mergeData) return;

    const { previousBlockId, previousBlockTextLength, mergedText, previousBlock } =
      mergeData;

    event.preventDefault();
    event.stopPropagation();

    // TODO: This must be 1 command because currently, I am calling 2 separate commands that create 2 records in the history. This is not only not efficient, but it also leads to bugs and inconsistencies when undoing/redoing. Will fix it very soon when I return to the history functionality of this UI adapter.
    updateBlock({
      blockId: previousBlockId,
      newBlock: {
        ...previousBlock,
        type: "heading",
        data: {
          ...(previousBlock as HeadingBlock).data,
          text: mergedText,
        },
      } as Block,
      childrenStrategy: "drop",
    });

    deleteBlock({ blockId: block.id });

    requestAnimationFrame(() => {
      const updatedPreviousBlockElement = blockElementsMap.get(previousBlockId);

      if (updatedPreviousBlockElement) {
        setCaretOffset(updatedPreviousBlockElement, previousBlockTextLength);
      }
    });
  };

  return {
    handleBackspaceForBlockMerge,
  };
};

import {
  getPlainText,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
import { useMergeBlocks } from "../actions/useMergeBlocks";
import { useBlockElementMap } from "./useBlockElementMap";
import { useBlockSiblings } from "./useBlockSiblings";
import { setCaretOffset } from "@/utils/caret/caret-offset.utils";
import { isCaretAtStart } from "@/utils/caret/caret-position-checks.utils";

export const useBackspaceDeletionMerge = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const mergeBlocks = useMergeBlocks();
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
    const previousBlockText = getPlainText(
      (previousBlock as HeadingBlock).data.content,
    );
    const previousBlockTextLength = previousBlockText.length;

    return {
      previousBlockId: previousBlock.id,
      previousBlockText,
      previousBlockTextLength,
      currentBlockText,
      previousBlockHTMLElement,
      previousBlock: previousBlock as HeadingBlock,
    };
  };

  const handleBackspaceForBlockMerge = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const mergeData = prepareBlockMerge();

    if (!mergeData) return;

    const { previousBlockId, previousBlockTextLength } = mergeData;

    event.preventDefault();
    event.stopPropagation();

    mergeBlocks({ blockId: block.id });

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

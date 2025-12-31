import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useEditor } from "../useEditor";
import { getCaretOffset, setCaretOffset } from "@/utils/caret/caret-offset.utils";
import { useBlockSiblings } from "./useBlockSiblings";

export const useKeyboardArrowNavigation = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { editor } = useEditor();
  const { getPreviousBlockHTMLElement, getNextBlockHTMLElement } =
    useBlockSiblings(block);

  const shouldSkipNavigationHandling = () => editor.isOnlyBlockInDocument(block.id);

  const handleArrowUpNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (shouldSkipNavigationHandling()) {
      return;
    }

    if (!headingRef.current) return;

    const currentBlockOffset = getCaretOffset(headingRef.current);
    const previousBlockHTMLElement = getPreviousBlockHTMLElement();

    if (!previousBlockHTMLElement) return;

    event.preventDefault();
    event.stopPropagation();

    setCaretOffset(previousBlockHTMLElement, currentBlockOffset);
  };

  const handleArrowDownNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (shouldSkipNavigationHandling()) {
      return;
    }

    if (!headingRef.current) return;

    const currentBlockOffset = getCaretOffset(headingRef.current);
    const nextBlockHTMLElement = getNextBlockHTMLElement();

    if (!nextBlockHTMLElement) return;

    event.preventDefault();
    event.stopPropagation();

    setCaretOffset(nextBlockHTMLElement, currentBlockOffset);
  };

  return {
    handleArrowUpNavigation,
    handleArrowDownNavigation,
  };
};

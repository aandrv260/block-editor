import {
  isArrowDownKey,
  isArrowUpKey,
  isBackspaceKey,
  isEnterKey,
} from "@/common/dom-events/keyboard.utils";
import { useBlockEnterKeyDown } from "./useBlockEnterKeyDown";
import { useKeyboardArrowNavigation } from "./useKeyboardArrowNavigation";
import { useBackspaceBlockDeletion } from "./useBackspaceBlockDeletion";
import type { DeepReadonly, HeadingBlock } from "@block-editor/core";

export const useBlockKeyDown = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { handleEnterKeyDown } = useBlockEnterKeyDown(block, headingRef);

  const { handleArrowUpNavigation, handleArrowDownNavigation } =
    useKeyboardArrowNavigation(block, headingRef);

  const { handleBackspaceForBlockDeletion } = useBackspaceBlockDeletion(
    block,
    headingRef,
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (isEnterKey(event.key)) {
      handleEnterKeyDown(event);
      return;
    }

    if (isBackspaceKey(event.key)) {
      handleBackspaceForBlockDeletion(event);
      return;
    }

    if (isArrowUpKey(event.key)) {
      handleArrowUpNavigation(event);
      return;
    }

    if (isArrowDownKey(event.key)) {
      handleArrowDownNavigation(event);
      return;
    }
  };

  return onKeyDown;
};

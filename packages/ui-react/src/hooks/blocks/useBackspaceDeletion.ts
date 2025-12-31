import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useBackspaceDeletionMerge } from "./useBackspaceDeletionMerge";
import { useBackpaceDeleteEntireBlock } from "./useBackpaceDeleteEntireBlock";

/**
 * Orchestrates the deletion of a block when the Backspace key is pressed based on edge cases and specific conditions.
 */
export const useBackspaceDeletion = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { handleEntireBlockDeletion } = useBackpaceDeleteEntireBlock(block);
  const { handleBackspaceForBlockMerge } = useBackspaceDeletionMerge(
    block,
    headingRef,
  );

  const handleBackspaceForBlockDeletion = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (!headingRef.current) return;

    headingRef.current.innerText === ""
      ? handleEntireBlockDeletion(event)
      : handleBackspaceForBlockMerge(event);
  };

  return {
    handleBackspaceForBlockDeletion,
  };
};

import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useSplitBlock } from "../actions/useSplitBlock";
import { useNewBlockFocus } from "./useNewBlockFocus";

export const useEnterKeyInBeginningSplitBlock = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const splitBlock = useSplitBlock();
  const { requestBlockFocus } = useNewBlockFocus();

  const splitBlockOnEnterKeyInBeginning = () => {
    if (!headingRef.current) return;

    splitBlock({ blockId: block.id, offset: 0, newBlockId: crypto.randomUUID() });

    requestBlockFocus(block.id);
  };

  return { splitBlockOnEnterKeyInBeginning };
};

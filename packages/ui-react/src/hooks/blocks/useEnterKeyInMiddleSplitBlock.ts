import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useSplitBlock } from "../actions/useSplitBlock";
import { useNewBlockFocus } from "./useNewBlockFocus";
import { splitTextAtCaret } from "@/utils/caret/split-text.utils";

export const useEnterKeyInMiddleSplitBlock = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const splitBlock = useSplitBlock();
  const { requestBlockFocus } = useNewBlockFocus();

  const splitBlockOnEnterKeyInMiddle = () => {
    if (!headingRef.current) return;

    const textSplit = splitTextAtCaret(headingRef.current);

    if (!textSplit) return;

    const newBlockId = crypto.randomUUID();

    splitBlock({
      blockId: block.id,
      offset: textSplit.textFromStartToCaret.length,
      newBlockId,
    });

    requestBlockFocus(newBlockId);
  };

  return { splitBlockOnEnterKeyInMiddle };
};

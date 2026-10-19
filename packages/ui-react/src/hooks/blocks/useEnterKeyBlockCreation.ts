import {
  getPlainText,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
import { useSplitBlock } from "../actions/useSplitBlock";
import { useNewBlockFocus } from "./useNewBlockFocus";

export const useEnterKeyBlockCreation = (block: DeepReadonly<HeadingBlock>) => {
  const splitBlock = useSplitBlock();
  const { requestBlockFocus } = useNewBlockFocus();

  const createNewBlockOnEnterKeyInEnd = () => {
    const newBlockId = crypto.randomUUID();

    splitBlock({
      blockId: block.id,
      offset: getPlainText(block.data.content).length,
      newBlockId,
    });

    requestBlockFocus(newBlockId);
  };

  return { createNewBlockOnEnterKeyInEnd };
};

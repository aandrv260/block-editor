import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useInsertBlock } from "../actions/useInsertBlock";
import { useNewBlockFocus } from "./useNewBlockFocus";

export const useEnterKeyBlockCreation = (block: DeepReadonly<HeadingBlock>) => {
  const insertBlock = useInsertBlock();
  const { requestBlockFocus } = useNewBlockFocus();

  const createNewBlockOnEnterKeyInEnd = () => {
    const newBlockId = crypto.randomUUID();

    insertBlock({
      strategy: "after",
      newBlock: {
        id: newBlockId,
        type: "heading",
        data: { text: "", level: block.data.level },
      },
      targetId: block.id,
    });

    requestBlockFocus(newBlockId);
  };

  return { createNewBlockOnEnterKeyInEnd };
};

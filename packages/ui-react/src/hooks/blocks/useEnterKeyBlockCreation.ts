import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useInsertBlock } from "../actions/useInsertBlock";

export const useEnterKeyBlockCreation = (block: DeepReadonly<HeadingBlock>) => {
  const insertBlock = useInsertBlock();

  const createNewBlockOnEnterKeyInEnd = () => {
    insertBlock({
      strategy: "after",
      newBlock: {
        type: "heading",
        data: { text: "", level: block.data.level },
        id: crypto.randomUUID(),
      },
      targetId: block.id,
    });
  };

  return { createNewBlockOnEnterKeyInEnd };
};

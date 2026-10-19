import { useInsertBlock } from "../actions/useInsertBlock";
import { useUpdateBlock } from "../actions/useUpdateBlock";
import {
  normalizeContent,
  type Block,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
import { useNewBlockFocus } from "./useNewBlockFocus";

export const useEnterKeyInBeginningSplitBlock = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const insertBlock = useInsertBlock();
  const updateBlock = useUpdateBlock();
  const { requestBlockFocus } = useNewBlockFocus();

  const splitBlockOnEnterKeyInBeginning = () => {
    if (!headingRef.current) return;

    const newBlockId = crypto.randomUUID();

    // TODO: This must be 1 command because currently, I am calling 2 separate commands that create 2 records in the history. This is not only not efficient, but it also leads to bugs and inconsistencies when undoing/redoing. Will fix it very soon when I return to the history functionality of this UI adapter.
    insertBlock({
      strategy: "after",
      newBlock: {
        id: newBlockId,
        type: "heading",
        data: {
          content: normalizeContent([
            { text: headingRef.current.innerText, marks: [] },
          ]),
          level: block.data.level,
        },
      },
      targetId: block.id,
    });

    updateBlock({
      blockId: block.id,
      newBlock: {
        ...block,
        data: { ...block.data, content: [] },
      } as Block,
      childrenStrategy: "drop",
    });

    requestBlockFocus(newBlockId);
  };

  return { splitBlockOnEnterKeyInBeginning };
};

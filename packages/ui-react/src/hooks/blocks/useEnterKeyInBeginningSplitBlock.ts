import { useEffect, useState } from "react";
import { useBlockElementMap } from "./useBlockElementMap";
import { useInsertBlock } from "../actions/useInsertBlock";
import { useUpdateBlock } from "../actions/useUpdateBlock";
import type { Block, DeepReadonly, HeadingBlock } from "@block-editor/core";
import { focusCaretTo } from "@/utils/focus-caret.utils";

export const useEnterKeyInBeginningSplitBlock = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const [pendingNewBlockId, setPendingNewBlockId] = useState<string | null>(null);
  const insertBlock = useInsertBlock();
  const updateBlock = useUpdateBlock();
  const { blockElementsMap } = useBlockElementMap();

  useEffect(() => {
    if (!pendingNewBlockId) return;

    const newBlockElement = blockElementsMap.get(pendingNewBlockId);

    if (!newBlockElement) return;

    focusCaretTo("start", newBlockElement);
    setPendingNewBlockId(null);
  }, [blockElementsMap, pendingNewBlockId]);

  const splitBlockOnEnterKeyInBeginning = () => {
    if (!headingRef.current) return;

    const newBlockId = crypto.randomUUID();

    // TODO: This must be 1 command because currently, I am calling 2 separate commands that create 2 records in the history. This is not only not efficient, but it also leads to bugs and inconsistencies when undoing/redoing. Will fix it very soon when I return to the history functionality of this UI adapter.
    insertBlock({
      strategy: "after",
      newBlock: {
        id: newBlockId,
        type: "heading",
        data: { text: headingRef.current.innerText, level: block.data.level },
      },
      targetId: block.id,
    });

    updateBlock({
      blockId: block.id,
      newBlock: {
        ...block,
        data: { ...block.data, text: "" },
      } as Block,
      childrenStrategy: "drop",
    });

    setPendingNewBlockId(newBlockId);
  };

  return { splitBlockOnEnterKeyInBeginning };
};

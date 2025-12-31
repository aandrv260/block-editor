import { focusCaretTo } from "@/utils/focus-caret.utils";
import { useEffect, useState } from "react";
import { useBlockElementMap } from "./useBlockElementMap";

/**
 * Handles the focus of a new block after it is created. You just need to call the requestBlockFocus function and the hook will take care of focusing the new block's HTML element and will clean up the state.
 */
export const useNewBlockFocus = () => {
  const [pendingNewBlockId, setPendingNewBlockId] = useState<string | null>(null);
  const { blockElementsMap } = useBlockElementMap();

  useEffect(() => {
    if (!pendingNewBlockId) return;

    const newBlockElement = blockElementsMap.get(pendingNewBlockId);

    if (!newBlockElement) return;

    focusCaretTo("start", newBlockElement);
    setPendingNewBlockId(null);
  }, [blockElementsMap, pendingNewBlockId]);

  return { requestBlockFocus: setPendingNewBlockId };
};

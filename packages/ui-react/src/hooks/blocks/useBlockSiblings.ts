import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useBlockElementMap } from "./useBlockElementMap";
import { useEditor } from "../useEditor";
import { useCallback } from "react";

type BlockElementGetter = () => HTMLElement | null;

export const useBlockSiblings = (block: DeepReadonly<HeadingBlock>) => {
  const { editor } = useEditor();
  const { blockElementsMap } = useBlockElementMap();

  const getPreviousBlock = useCallback(
    () => editor.getPreviousSiblingBlock(block.id),
    [editor, block.id],
  );

  const getPreviousBlockHTMLElement = useCallback<BlockElementGetter>(() => {
    const previousBlock = getPreviousBlock();

    if (!previousBlock) return null;

    return blockElementsMap.get(previousBlock.id) ?? null;
  }, [blockElementsMap, getPreviousBlock]);

  const getNextBlock = useCallback(
    () => editor.getNextSiblingBlock(block.id),
    [editor, block.id],
  );

  const getNextBlockHTMLElement = useCallback<BlockElementGetter>(() => {
    const nextBlock = getNextBlock();

    if (!nextBlock) return null;

    return blockElementsMap.get(nextBlock.id) ?? null;
  }, [blockElementsMap, getNextBlock]);

  return {
    getPreviousBlock,
    getPreviousBlockHTMLElement,
    getNextBlock,
    getNextBlockHTMLElement,
  };
};

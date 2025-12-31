import type { DeepReadonly, DocumentNode, HeadingBlock } from "@block-editor/core";
import { useBlockElementMap } from "./useBlockElementMap";
import { useEditor } from "../useEditor";
import { useCallback } from "react";

type BlockElementGetter = () => HTMLElement | null;

export const useBlockSiblings = (block: DeepReadonly<HeadingBlock>) => {
  const { editor } = useEditor();
  const { blockElementsMap } = useBlockElementMap();

  // TODO: Offload to the editor class.
  const getPreviousBlock = useCallback((): DeepReadonly<DocumentNode> | null => {
    const parentBlock = editor.getBlock(block.parentId);
    const parentChildren = parentBlock?.children;

    if (!parentChildren) return null;

    const previousBlockIndex = parentChildren.findIndex(
      child => child.id === block.id,
    );

    if (previousBlockIndex === -1 || previousBlockIndex === 0) return null;

    return parentChildren.at(previousBlockIndex - 1) ?? null;
  }, [block.parentId, editor, block.id]);

  const getPreviousBlockHTMLElement = useCallback<BlockElementGetter>(() => {
    const previousBlock = getPreviousBlock();

    if (!previousBlock) return null;

    return blockElementsMap.get(previousBlock.id) ?? null;
  }, [blockElementsMap, getPreviousBlock]);

  // TODO: Offload to the editor class.
  const getNextBlock = useCallback((): DeepReadonly<DocumentNode> | null => {
    const parentBlock = editor.getBlock(block.parentId);
    const parentChildren = parentBlock?.children;

    if (!parentChildren) return null;

    const currentBlockIndex = parentChildren.findIndex(
      child => child.id === block.id,
    );

    if (currentBlockIndex === -1) return null;

    // Check if this is the last block
    if (currentBlockIndex === parentChildren.length - 1) return null;

    return parentChildren.at(currentBlockIndex + 1) ?? null;
  }, [block.parentId, editor, block.id]);

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

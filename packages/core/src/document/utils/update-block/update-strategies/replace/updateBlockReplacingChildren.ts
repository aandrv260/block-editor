import type { Block } from "@/blocks/models/block.models";
import type { ReadonlyBlockMap } from "../../../../models/document.models";
import { BlockMapBuilder } from "../../../mapping/BlockMapBuilder/BlockMapBuilder";
import {
  ChildBlockIdAlreadyExistsError,
  ChildBlockIdConflictsWithSubtreeRootError,
} from "../../../../errors/update-block";
import type { UpdateStrategy } from "../update-strategies.models";

const validateChildrenBlock = (
  blockMap: ReadonlyBlockMap,
  newBlockRoot: Block,
  child: Block,
): void | never => {
  if (blockMap.has(child.id)) {
    throw new ChildBlockIdAlreadyExistsError(child.id);
  }

  if (child.id === newBlockRoot.id) {
    throw new ChildBlockIdConflictsWithSubtreeRootError(child.id, newBlockRoot.id);
  }
};

// TODO: Remove recursion and use a generic function called traverseDocument.
const validateSubtree = (blockMap: ReadonlyBlockMap, newBlock: Block) => {
  newBlock.children?.forEach(child => {
    // TODO: This only works on up to 2 levels of nested children. This will explode easily.  Fix it ASAP.
    validateChildrenBlock(blockMap, newBlock, child);

    child.children?.forEach(child =>
      validateChildrenBlock(blockMap, newBlock, child),
    );
  });
};

export const updateBlockReplacingChildren: UpdateStrategy = ({
  blockMap,
  blockToReplace,
  newBlock,
}) => {
  validateSubtree(blockMap, newBlock);

  const newBlockMap = new BlockMapBuilder(blockMap)
    .removeSubtree(blockToReplace)
    .addSubtree(newBlock)
    .build();

  return {
    newBlockMap,
  };
};

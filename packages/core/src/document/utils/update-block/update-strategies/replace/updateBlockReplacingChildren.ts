import type { Block } from "@/blocks/models/block.models";
import type { ReadonlyBlockMap } from "../../../../models/document.models";
import { BlockMapBuilder } from "../../../mapping/BlockMapBuilder/BlockMapBuilder";
import {
  ChildBlockIdAlreadyExistsError,
  ChildBlockIdConflictsWithSubtreeRootError,
} from "../../../../errors/update-block";
import type { UpdateStrategy } from "../update-strategies.models";
import { traverse } from "@/document/utils/block-traversal.utils";

const validateChildrenBlock = (
  blockMap: ReadonlyBlockMap,
  newBlockRootId: string,
  child: Block,
): void | never => {
  if (child.id === newBlockRootId) {
    throw new ChildBlockIdConflictsWithSubtreeRootError(child.id, newBlockRootId);
  }

  if (blockMap.has(child.id)) {
    throw new ChildBlockIdAlreadyExistsError(child.id);
  }
};

const validateSubtree = (blockMap: ReadonlyBlockMap, newBlock: Block) => {
  traverse(newBlock, child => {
    validateChildrenBlock(blockMap, newBlock.id, child);
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

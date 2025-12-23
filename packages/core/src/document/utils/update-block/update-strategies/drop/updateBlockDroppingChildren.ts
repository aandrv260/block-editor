import type { UpdateStrategy } from "../update-strategies.models";
import { BlockMapBuilder } from "../../../mapping/BlockMapBuilder/BlockMapBuilder";

export const updateBlockDroppingChildren: UpdateStrategy = ({
  blockToReplace,
  newBlock,
  blockMap,
}) => {
  const newBlockMap = new BlockMapBuilder(blockMap)
    .removeSubtree(blockToReplace)
    .addBlock(newBlock)
    .build();

  return {
    newBlockMap,
  };
};

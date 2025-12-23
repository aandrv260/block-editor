import { BlockMapBuilder } from "../../../mapping/BlockMapBuilder/BlockMapBuilder";
import type { UpdateStrategy } from "../update-strategies.models";

export const updateBlockPreservingChildren: UpdateStrategy = ({
  blockMap,
  blockToReplace,
  newBlock,
}) => {
  const newBlockMap = new BlockMapBuilder(blockMap)
    .remove(blockToReplace.id)
    .addSubtree(newBlock)
    .build();

  return {
    newBlockMap,
  };
};

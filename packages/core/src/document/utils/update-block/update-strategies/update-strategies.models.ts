import type { Block } from "@/blocks/models/block.models";
import type { BlockMap, ReadonlyBlockMap } from "../../../models/document.models";

export interface UpdateStrategyContext {
  newBlock: Block;
  blockToReplace: Block;
  blockMap: ReadonlyBlockMap;
}

export interface UpdateStrategyResult {
  newBlockMap: BlockMap;
}

export type UpdateStrategy = (ctx: UpdateStrategyContext) => UpdateStrategyResult;

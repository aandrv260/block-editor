import type { Block } from "../../../../blocks/models/block.models";
import type { BlockMap, ReadonlyBlockMap } from "../../../models/document.models";

export class BlockMapBuilder {
  private readonly blockMap: BlockMap;

  constructor(blockMap?: ReadonlyBlockMap) {
    this.blockMap = new Map(blockMap);
  }

  remove(id: string): this {
    this.blockMap.delete(id);
    return this;
  }

  removeSubtree(block: Block): this {
    this.remove(block.id);
    // TODO: Later remove recursion in favor of a loop for performance reasons.
    block.children?.forEach(child => this.removeSubtree(child));

    return this;
  }

  addBlock(block: Block): this {
    this.blockMap.set(block.id, block);
    return this;
  }

  addSubtree(block: Block): this {
    this.addBlock(block);
    // TODO: Later remove recursion in favor of a loop for performance scalability reasons.
    block.children?.forEach(child => this.addSubtree(child));

    return this;
  }

  build(): BlockMap {
    return new Map(this.blockMap);
  }
}

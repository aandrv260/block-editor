import type { Block } from "@/blocks/models/block.models";
import type { UpdateStrategyContext } from "../update-strategies.models";
import {
  SAMPLE_BLOCK1,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
} from "../../../document-test.utils";
import { updateBlockPreservingChildren } from "./updateBlockPreservingChildren";

describe("updateBlockPreservingChildren()", () => {
  it("creates a deep copy of the map and updates the map replacing the old subtree with the new one while preserving the children and creates a new parent array", () => {
    // Arrange
    const blockToReplace1: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [],
    };

    const blockToReplace2Child1Child1: Block = {
      ...SAMPLE_BLOCK1,
      parentId: TOGGLE_LIST4_BLOCK.id,
    };

    const blockToReplace2Child1: Block = {
      ...TOGGLE_LIST4_BLOCK,
      parentId: TOGGLE_LIST2_BLOCK.id,
      children: [blockToReplace2Child1Child1],
    };

    const blockToReplace2: Block = {
      ...TOGGLE_LIST2_BLOCK,
      parentId: "root",
      children: [blockToReplace2Child1],
    };

    const blockToReplace3: Block = {
      ...TOGGLE_LIST3_BLOCK,
      parentId: "root",
      children: [],
    };

    const newBlock: Block = { ...TOGGLE_LIST5_BLOCK, parentId: "root" };

    const ctx: UpdateStrategyContext = {
      blockMap: new Map([
        [blockToReplace1.id, blockToReplace1],
        [blockToReplace2.id, blockToReplace2],
        [blockToReplace2Child1.id, blockToReplace2Child1],
        [blockToReplace2Child1Child1.id, blockToReplace2Child1Child1],
        [blockToReplace3.id, blockToReplace3],
        [TOGGLE_LIST5_BLOCK.id, TOGGLE_LIST5_BLOCK],
      ] as [string, Block][]),
      blockToReplace: blockToReplace2,
      newBlock,
    };

    const { newBlockMap } = updateBlockPreservingChildren(ctx);

    // Assert
    expect(newBlockMap.get(blockToReplace2.id)).toBeUndefined();

    expect(newBlockMap.get(blockToReplace1.id)).toBe(blockToReplace1);
    expect(newBlockMap.get(blockToReplace2Child1.id)).toBe(blockToReplace2Child1);
    expect(newBlockMap.get(blockToReplace2Child1Child1.id)).toBe(
      blockToReplace2Child1Child1,
    );

    expect(newBlockMap.get(blockToReplace3.id)).toBe(blockToReplace3);
    expect(newBlockMap.get(TOGGLE_LIST5_BLOCK.id)).toBe(newBlock);

    expect(newBlockMap.size).toBe(5);
  });
});

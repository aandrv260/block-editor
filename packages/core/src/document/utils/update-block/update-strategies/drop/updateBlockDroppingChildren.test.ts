import type { Block } from "@/blocks/models/block.models";
import type { UpdateStrategyContext } from "../update-strategies.models";
import {
  SAMPLE_BLOCK1,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST5_BLOCK,
} from "../../../document-test.utils";
import { updateBlockDroppingChildren } from "./updateBlockDroppingChildren";

describe("updateBlockDroppingChildren()", () => {
  it("creates a deep copy of the map and updates the map replacing the old subtree with the new one, dropping the children and creates a new parent array", () => {
    // Arrange
    const blockToReplaceChild1Child1: Block = {
      ...SAMPLE_BLOCK1,
      parentId: TOGGLE_LIST2_BLOCK.id,
    };

    const blockToReplaceChild1: Block = {
      ...TOGGLE_LIST2_BLOCK,
      parentId: TOGGLE_LIST1_BLOCK.id,
      children: [blockToReplaceChild1Child1],
    };

    const blockToReplace1: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [blockToReplaceChild1],
    };

    const blockToReplace2: Block = {
      ...TOGGLE_LIST5_BLOCK,
      parentId: "root",
      children: [],
    };

    const newBlock: Block = { ...TOGGLE_LIST3_BLOCK, parentId: "root" };

    const ctx: UpdateStrategyContext = {
      blockMap: new Map([
        [blockToReplace1.id, blockToReplace1],
        [blockToReplaceChild1.id, blockToReplaceChild1],
        [blockToReplaceChild1Child1.id, blockToReplaceChild1Child1],
        [blockToReplace2.id, blockToReplace2],
      ] as [string, Block][]),
      blockToReplace: blockToReplace1,
      newBlock,
    };

    // Act
    const { newBlockMap } = updateBlockDroppingChildren(ctx);

    // Assert
    expect(newBlockMap.size).toBe(2);
    expect(newBlockMap.get(blockToReplace1.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1Child1.id)).toBeUndefined();

    expect(newBlockMap.get(TOGGLE_LIST3_BLOCK.id)).toBe(newBlock);
    expect(newBlockMap.get(blockToReplace2.id)).toBe(blockToReplace2);
  });
});

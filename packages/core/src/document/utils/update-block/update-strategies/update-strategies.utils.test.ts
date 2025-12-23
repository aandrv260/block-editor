import type { Block } from "@/blocks/models/block.models";
import type { UpdateStrategyContext } from "./update-strategies.models";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
} from "../../document-test.utils";
import { updateSubtree } from "./update-strategies.utils";

describe("updateSubtree()", () => {
  it("updates the block and drops the subtree successfully", () => {
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

    const blockToReplace: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [blockToReplaceChild1],
    };

    const newBlock: Block = {
      ...TOGGLE_LIST3_BLOCK,
      parentId: "root",
    };

    const context: UpdateStrategyContext = {
      blockMap: new Map([
        [blockToReplace.id, blockToReplace],
        [blockToReplaceChild1.id, blockToReplaceChild1],
        [blockToReplaceChild1Child1.id, blockToReplaceChild1Child1],
      ] as [string, Block][]),
      blockToReplace,
      newBlock,
    };

    // Act
    const { newBlockMap } = updateSubtree("drop", context);

    // Assert
    expect(newBlockMap.get(blockToReplace.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1Child1.id)).toBeUndefined();

    expect(newBlockMap.get(newBlock.id)).toBe(newBlock);
    expect(newBlockMap.size).toBe(1);
  });

  it("updates the block and preserves the children successfully", () => {
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

    const blockToReplace: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [blockToReplaceChild1],
    };

    const newBlock: Block = {
      ...TOGGLE_LIST3_BLOCK,
      parentId: "root",
    };

    const context: UpdateStrategyContext = {
      blockMap: new Map([
        [blockToReplace.id, blockToReplace],
        [blockToReplaceChild1.id, blockToReplaceChild1],
        [blockToReplaceChild1Child1.id, blockToReplaceChild1Child1],
      ] as [string, Block][]),
      blockToReplace,
      newBlock,
    };

    // Act
    const { newBlockMap } = updateSubtree("preserve", context);

    // Assert
    expect(newBlockMap.get(blockToReplace.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1.id)).toBe(blockToReplaceChild1);
    expect(newBlockMap.get(blockToReplaceChild1Child1.id)).toBe(
      blockToReplaceChild1Child1,
    );

    expect(newBlockMap.get(newBlock.id)).toBe(newBlock);
    expect(newBlockMap.size).toBe(3);
  });

  it("updates the block and replaces the children successfully", () => {
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

    const blockToReplace: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [blockToReplaceChild1],
    };

    const newBlockChild1Child1: Block = {
      ...SAMPLE_BLOCK4,
      parentId: TOGGLE_LIST4_BLOCK.id,
    };

    const newBlockChild1: Block = {
      ...TOGGLE_LIST4_BLOCK,
      parentId: TOGGLE_LIST3_BLOCK.id,
      children: [newBlockChild1Child1],
    };

    const newBlock: Block = {
      ...TOGGLE_LIST3_BLOCK,
      parentId: "root",
      children: [newBlockChild1],
    };

    const context: UpdateStrategyContext = {
      blockMap: new Map([
        [blockToReplace.id, blockToReplace],
        [blockToReplaceChild1.id, blockToReplaceChild1],
        [blockToReplaceChild1Child1.id, blockToReplaceChild1Child1],
      ] as [string, Block][]),
      blockToReplace,
      newBlock,
    };

    // Act
    const { newBlockMap } = updateSubtree("replace", context);

    // Assert
    expect(newBlockMap.get(blockToReplace.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplaceChild1Child1.id)).toBeUndefined();

    expect(newBlockMap.get(newBlock.id)).toBe(newBlock);
    expect(newBlockMap.get(newBlockChild1.id)).toBe(newBlockChild1);
    expect(newBlockMap.get(newBlockChild1Child1.id)).toBe(newBlockChild1Child1);

    expect(newBlockMap.size).toBe(3);
  });
});

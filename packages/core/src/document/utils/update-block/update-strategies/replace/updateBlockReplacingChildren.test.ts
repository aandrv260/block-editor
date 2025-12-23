import type { Block } from "@/blocks/models/block.models";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  TOGGLE_LIST6_BLOCK,
} from "../../../document-test.utils";
import type { UpdateStrategyContext } from "../update-strategies.models";
import { updateBlockReplacingChildren } from "./updateBlockReplacingChildren";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import {
  ChildBlockIdAlreadyExistsError,
  ChildBlockIdConflictsWithSubtreeRootError,
} from "../../../../errors/update-block";

describe("updateBlockReplacingChildren()", () => {
  it("throws an error if any child has an ID that is already used in the tree by another block", () => {
    // Arrange
    const existingBlock: Block = {
      ...TOGGLE_LIST1_BLOCK,
      parentId: "root",
      children: [],
    };

    const blockToReplace: Block = {
      ...TOGGLE_LIST2_BLOCK,
      parentId: "root",
      children: [],
    };

    const newBlockDuplicateChild: Block = {
      ...SAMPLE_BLOCK1,
      id: existingBlock.id,
      parentId: TOGGLE_LIST3_BLOCK.id,
    };

    const newBlock: Block = {
      ...TOGGLE_LIST3_BLOCK,
      parentId: "root",
      children: [newBlockDuplicateChild],
    };

    const ctx: UpdateStrategyContext = {
      blockMap: new Map([
        [existingBlock.id, existingBlock],
        [blockToReplace.id, blockToReplace],
      ] as [string, Block][]),
      blockToReplace,
      newBlock,
    };

    // Act
    const act = () => updateBlockReplacingChildren(ctx);

    // Assert
    assertEngineError(act, {
      ExpectedErrorClass: ChildBlockIdAlreadyExistsError,
      expectedCode: "DOCUMENT:UPDATE_BLOCK_CHILD_ID_ALREADY_EXISTS",
      expectedMessage: `You are trying to insert a child with ID \`${TOGGLE_LIST1_BLOCK.id}\`when updating the block. Another block with this ID already exists in the document!`,
      expectedContext: { childId: TOGGLE_LIST1_BLOCK.id },
    });
  });

  it("throws an error if any child has an ID that is equal to the the subtree root's ID", () => {
    // Arrange
    const blockToReplace: Block = {
      ...TOGGLE_LIST4_BLOCK,
      parentId: "root",
      children: [],
    };

    const newBlock: Block = {
      ...TOGGLE_LIST5_BLOCK,
      parentId: "root",
      children: [
        {
          ...SAMPLE_BLOCK2,
          parentId: TOGGLE_LIST5_BLOCK.id,
          children: [
            {
              ...SAMPLE_BLOCK1,
              id: TOGGLE_LIST5_BLOCK.id,
              parentId: SAMPLE_BLOCK2.id,
              children: [],
            },
          ],
        },
      ],
    };

    const ctx: UpdateStrategyContext = {
      blockMap: new Map([[blockToReplace.id, blockToReplace]] as [string, Block][]),
      blockToReplace,
      newBlock,
    };

    // Act
    const act = () => updateBlockReplacingChildren(ctx);

    // Assert
    assertEngineError(act, {
      ExpectedErrorClass: ChildBlockIdConflictsWithSubtreeRootError,
      expectedCode: "DOCUMENT:UPDATE_BLOCK_CHILD_ID_EQUALS_SUBTREE_ROOT",
      expectedMessage: `Child block with ID \`${TOGGLE_LIST5_BLOCK.id}\` you are trying to insert is the same as the ID of the root of this subtree. This is an illegal operation as all IDs in the document must be unique!`,
      expectedContext: {
        childId: TOGGLE_LIST5_BLOCK.id,
        subtreeRootId: TOGGLE_LIST5_BLOCK.id,
      },
    });
  });

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

    const newBlockChild1Child1 = {
      ...SAMPLE_BLOCK2,
      parentId: TOGGLE_LIST6_BLOCK.id,
    };

    const newBlockChild1: Block = {
      ...TOGGLE_LIST6_BLOCK,
      parentId: TOGGLE_LIST5_BLOCK.id,
      children: [newBlockChild1Child1],
    };

    const newBlock: Block = {
      ...TOGGLE_LIST5_BLOCK,
      children: [newBlockChild1],
      parentId: "root",
    };

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

    const { newBlockMap } = updateBlockReplacingChildren(ctx);

    // Assert
    expect(newBlockMap.get(blockToReplace1.id)).toBe(blockToReplace1);
    expect(newBlockMap.get(blockToReplace2.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplace2Child1.id)).toBeUndefined();
    expect(newBlockMap.get(blockToReplace2Child1Child1.id)).toBeUndefined();

    expect(newBlockMap.get(newBlock.id)).toBe(newBlock);
    expect(newBlockMap.get(newBlockChild1.id)).toBe(newBlockChild1);
    expect(newBlockMap.get(newBlockChild1Child1.id)).toBe(newBlockChild1Child1);
    expect(newBlockMap.get(blockToReplace3.id)).toBe(blockToReplace3);

    expect(newBlockMap.size).toBe(5);
  });
});

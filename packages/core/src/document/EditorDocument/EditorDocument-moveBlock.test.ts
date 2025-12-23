import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  TOGGLE_LIST6_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";
import type { MoveBlockStrategy } from "../models/document.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { TargetBlockNotFoundError } from "../errors/common";
import {
  BlockToMoveNotFoundError,
  CannotMoveBlockToDescendantError,
  CannotMoveBlockToItselfError,
  CannotMoveRootError,
  CanOnlyAppendToRootError,
  InvalidMoveStrategyError,
  TargetBlockCannotHaveChildrenError,
} from "../errors/move-block";

describe("moveBlock()", () => {
  it("throws an error if the user tries to move the document root", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryMoveRoot = () =>
      document.moveBlock({
        strategy: "append",
        blockId: document.ROOT_ID,
        targetId: SAMPLE_BLOCK1.id,
      });

    // Assert
    assertEngineError(tryMoveRoot, {
      ExpectedErrorClass: CannotMoveRootError,
      expectedCode: "DOCUMENT:CANNOT_MOVE_ROOT",
      expectedMessage: "You cannot move the root! Only its descendants.",
    });
  });

  it("appends a block as last child of its parent correctly if the target is the block's parent", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK4);

    // Act
    document.moveBlock({
      strategy: "append",
      targetId: document.ROOT_ID,
      blockId: SAMPLE_BLOCK1.id,
    });

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining(SAMPLE_BLOCK2),
          expect.objectContaining(SAMPLE_BLOCK3),
          expect.objectContaining(SAMPLE_BLOCK4),
          expect.objectContaining(SAMPLE_BLOCK1),
        ],
      }),
    );
  });

  it("never removes the children of a block when moving it (with `append` strategy) and moves them along with it", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST5_BLOCK);

    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST4_BLOCK);

    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK6);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK7);

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK6.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK7.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: TOGGLE_LIST3_BLOCK.id,
                children: [],
              }),

              expect.objectContaining({
                id: TOGGLE_LIST4_BLOCK.id,
                children: [],
              }),
            ],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    //  Act
    document.moveBlock({
      strategy: "append",
      blockId: TOGGLE_LIST1_BLOCK.id,
      targetId: document.ROOT_ID,
    });

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK6.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK7.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: TOGGLE_LIST3_BLOCK.id,
                children: [],
              }),

              expect.objectContaining({
                id: TOGGLE_LIST4_BLOCK.id,
                children: [],
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("never removes the children of a block when moving it (with `before` strategy) and moves them along with it", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST3_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST4_BLOCK);

    document.appendChild(TOGGLE_LIST3_BLOCK.id, TOGGLE_LIST5_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK8);

    document.appendChild(TOGGLE_LIST5_BLOCK.id, SAMPLE_BLOCK6);
    document.appendChild(TOGGLE_LIST5_BLOCK.id, SAMPLE_BLOCK7);

    // Act
    document.moveBlock({
      strategy: "before",
      blockId: TOGGLE_LIST3_BLOCK.id,
      targetId: TOGGLE_LIST1_BLOCK.id,
    });

    // Assert
    const root = document.getRoot();

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(root.children?.[1]);
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(root.children?.[2]);
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(root.children?.[0]);
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(root.children?.[3]);
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      root.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK8.id)).toBe(
      root.children?.[0]?.children?.[1],
    );

    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBe(
      root.children?.[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBe(
      root.children?.[0]?.children?.[0]?.children?.[1],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST3_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST5_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK6.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK7.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK8.id,
              }),
            ],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST4_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("never removes the children of a block when moving it (with `after` strategy) and moves them along with it", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST3_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST4_BLOCK);

    document.appendChild(TOGGLE_LIST3_BLOCK.id, TOGGLE_LIST5_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK8);

    document.appendChild(TOGGLE_LIST5_BLOCK.id, TOGGLE_LIST6_BLOCK);
    document.appendChild(TOGGLE_LIST5_BLOCK.id, SAMPLE_BLOCK7);

    // Act
    document.moveBlock({
      strategy: "after",
      blockId: TOGGLE_LIST3_BLOCK.id,
      targetId: TOGGLE_LIST4_BLOCK.id,
    });

    // Assert
    const root = document.getRoot();

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(root.children?.[0]);
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(root.children?.[1]);
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(root.children?.[3]);
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(root.children?.[2]);
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      root.children?.[3]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK8.id)).toBe(
      root.children?.[3]?.children?.[1],
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      root.children?.[3]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBe(
      root.children?.[3]?.children?.[0]?.children?.[1],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
          }),

          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST4_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST3_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST5_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: TOGGLE_LIST6_BLOCK.id,
                    children: [],
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK7.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK8.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  test.each([["before"], ["after"]] satisfies [MoveBlockStrategy][])(
    "throws an error if the user tries to insert before or after the root",
    strategy => {
      // Arrange
      const document = new EditorDocument();
      document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

      const tryMove = () =>
        document.moveBlock({
          strategy,
          blockId: SAMPLE_BLOCK1.id,
          targetId: document.ROOT_ID,
        });

      // Assert
      assertEngineError(tryMove, {
        ExpectedErrorClass: CanOnlyAppendToRootError,
        expectedCode: "DOCUMENT:CAN_ONLY_APPEND_TO_ROOT",
        expectedMessage: "You can only append to the root!",
      });
    },
  );

  it("does not throw an error if the user tries to append to the root", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Assert
    expect(() =>
      document.moveBlock({
        strategy: "append",
        blockId: SAMPLE_BLOCK1.id,
        targetId: document.ROOT_ID,
      }),
    ).not.toThrowError();
  });

  it("throws an error if the block to move does not exist in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryMove = () =>
      document.moveBlock({
        strategy: "append",
        blockId: "some_non_existing_block",
        targetId: SAMPLE_BLOCK1.id,
      });

    // Assert
    assertEngineError(tryMove, {
      ExpectedErrorClass: BlockToMoveNotFoundError,
      expectedCode: "DOCUMENT:BLOCK_TO_MOVE_NOT_FOUND",
      expectedMessage:
        "Block with ID some_non_existing_block not found in the document!",
      expectedContext: { blockId: "some_non_existing_block" },
    });
  });

  it("throws an error if the target block does not exist in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryMove = () =>
      document.moveBlock({
        strategy: "append",
        blockId: SAMPLE_BLOCK1.id,
        targetId: "some_non_existing_block",
      });

    // Assert
    assertEngineError(tryMove, {
      ExpectedErrorClass: TargetBlockNotFoundError,
      expectedCode: "DOCUMENT:TARGET_BLOCK_NOT_FOUND",
      expectedMessage:
        "Target not found with the specified targetId `some_non_existing_block`!",
      expectedContext: { targetId: "some_non_existing_block" },
    });
  });

  it("throws an error if the user tries to move to a block to itself", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryMove = () =>
      document.moveBlock({
        strategy: "append",
        blockId: SAMPLE_BLOCK1.id,
        targetId: SAMPLE_BLOCK1.id,
      });

    // Assert
    assertEngineError(tryMove, {
      ExpectedErrorClass: CannotMoveBlockToItselfError,
      expectedCode: "DOCUMENT:CANNOT_MOVE_BLOCK_TO_ITSELF",
      expectedMessage: "You cannot move a block to itself!",
    });
  });

  it("throws an error if the strategy is invalid", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    const tryMove = () =>
      document.moveBlock({
        strategy: "some_invalid_strategy" as MoveBlockStrategy,
        blockId: SAMPLE_BLOCK1.id,
        targetId: SAMPLE_BLOCK2.id,
      });

    // Assert
    assertEngineError(tryMove, {
      ExpectedErrorClass: InvalidMoveStrategyError,
      expectedCode: "DOCUMENT:INVALID_MOVE_STRATEGY",
      expectedMessage: "Invalid strategy: `some_invalid_strategy`",
      expectedContext: { strategy: "some_invalid_strategy" },
    });
  });

  it("throws an error if the user tries to move a block appended to a block that cannot have children", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    const tryMove = () => {
      document.moveBlock({
        strategy: "append",
        blockId: SAMPLE_BLOCK1.id,
        targetId: SAMPLE_BLOCK2.id,
      });
    };

    // Assert
    assertEngineError(tryMove, {
      ExpectedErrorClass: TargetBlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:TARGET_BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: "The target block cannot have children!",
      expectedContext: { targetId: SAMPLE_BLOCK2.id },
    });
  });

  test.each([["before"], ["after"], ["append"]] satisfies [MoveBlockStrategy][])(
    "throws an error if the user tries to move a block inside themselves (as a child of itself)",
    strategy => {
      // Arrange
      const document = new EditorDocument();
      document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
      document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
      document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);

      const tryMove = () =>
        document.moveBlock({
          strategy,
          blockId: TOGGLE_LIST2_BLOCK.id,
          targetId: TOGGLE_LIST3_BLOCK.id,
        });

      // Assert
      assertEngineError(tryMove, {
        ExpectedErrorClass: CannotMoveBlockToDescendantError,
        expectedCode: "DOCUMENT:CANNOT_MOVE_BLOCK_TO_DESCENDANT",
        expectedMessage: "You cannot move a block to a descendant of itself!",
      });
    },
  );

  test.each([["before"], ["after"], ["append"]] satisfies [MoveBlockStrategy][])(
    "throws an error if the user tries to move a block and make it as a distant descendant of itself",
    strategy => {
      // Arrange
      const document = new EditorDocument();
      document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
      document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
      document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
      document.appendChild(TOGGLE_LIST3_BLOCK.id, TOGGLE_LIST4_BLOCK);
      document.appendChild(TOGGLE_LIST4_BLOCK.id, TOGGLE_LIST5_BLOCK);

      const tryMove = () =>
        document.moveBlock({
          strategy,
          blockId: TOGGLE_LIST3_BLOCK.id,
          targetId: TOGGLE_LIST5_BLOCK.id,
        });

      // Assert
      assertEngineError(tryMove, {
        ExpectedErrorClass: CannotMoveBlockToDescendantError,
        expectedCode: "DOCUMENT:CANNOT_MOVE_BLOCK_TO_DESCENDANT",
        expectedMessage: "You cannot move a block to a descendant of itself!",
      });
    },
  );

  it("moves a block to be a direct child of the root correctly", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    // Act
    document.moveBlock({
      strategy: "append",
      blockId: TOGGLE_LIST2_BLOCK.id,
      targetId: document.ROOT_ID,
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      expect.objectContaining(TOGGLE_LIST1_BLOCK),
      expect.objectContaining(TOGGLE_LIST2_BLOCK),
    ]);

    const root = document.getRoot();
    const block1 = document.getBlock(TOGGLE_LIST1_BLOCK.id);
    const block2 = document.getBlock(TOGGLE_LIST2_BLOCK.id);

    expect(block1?.children).toEqual([]);
    expect(block1?.parentId).toBe(document.ROOT_ID);

    expect(block1).toBe(root.children[0]);
    expect(block2).toBe(root.children[1]);
  });

  it("moves a block before another block correctly that is the parent's sibling", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3);

    // Act
    document.moveBlock({
      strategy: "before",
      targetId: TOGGLE_LIST1_BLOCK.id,
      blockId: SAMPLE_BLOCK3.id,
    });

    // Assert
    const root = document.getRoot();
    const block1 = document.getBlock(TOGGLE_LIST1_BLOCK.id);
    const block2 = document.getBlock(SAMPLE_BLOCK2.id);
    const block3 = document.getBlock(SAMPLE_BLOCK3.id);

    expect(root.children).toStrictEqual([
      expect.objectContaining(SAMPLE_BLOCK3),
      expect.objectContaining(TOGGLE_LIST1_BLOCK),
      expect.objectContaining(SAMPLE_BLOCK2),
    ]);

    expect(block1).toBe(root.children[1]);
    expect(block2).toBe(root.children[2]);
    expect(block3).toBe(root.children[0]);

    expect(block1?.parentId).toBe(document.ROOT_ID);
    expect(block2?.parentId).toBe(document.ROOT_ID);
    expect(block3?.parentId).toBe(document.ROOT_ID);
  });

  it("moves a block after another block that is the parent's sibling correctly", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3);

    // Act
    document.moveBlock({
      strategy: "after",
      targetId: SAMPLE_BLOCK2.id,
      blockId: SAMPLE_BLOCK3.id,
    });

    // Assert
    const root = document.getRoot();
    const block1 = document.getBlock(TOGGLE_LIST1_BLOCK.id);
    const block2 = document.getBlock(SAMPLE_BLOCK2.id);
    const block3 = document.getBlock(SAMPLE_BLOCK3.id);

    expect(root.children).toStrictEqual([
      expect.objectContaining(TOGGLE_LIST1_BLOCK),
      expect.objectContaining(SAMPLE_BLOCK2),
      expect.objectContaining(SAMPLE_BLOCK3),
    ]);

    expect(block1).toBe(root.children[0]);
    expect(block2).toBe(root.children[1]);
    expect(block3).toBe(root.children[2]);

    expect(block1?.parentId).toBe(document.ROOT_ID);
    expect(block2?.parentId).toBe(document.ROOT_ID);
    expect(block3?.parentId).toBe(document.ROOT_ID);
  });

  it("moves a block before a sibling correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);

    // Act
    document.moveBlock({
      strategy: "before",
      blockId: SAMPLE_BLOCK3.id,
      targetId: SAMPLE_BLOCK1.id,
    });

    // Assert
    const root = document.getRoot();
    const block1 = document.getBlock(SAMPLE_BLOCK1.id);
    const block2 = document.getBlock(SAMPLE_BLOCK2.id);
    const block3 = document.getBlock(SAMPLE_BLOCK3.id);

    expect(root.children).toStrictEqual([
      expect.objectContaining(SAMPLE_BLOCK3),
      expect.objectContaining(SAMPLE_BLOCK1),
      expect.objectContaining(SAMPLE_BLOCK2),
    ]);

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK1.id,
        data: SAMPLE_BLOCK1.data,
        type: SAMPLE_BLOCK1.type,
      }),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK2.id,
        data: SAMPLE_BLOCK2.data,
        type: SAMPLE_BLOCK2.type,
      }),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK3.id,
        data: SAMPLE_BLOCK3.data,
        type: SAMPLE_BLOCK3.type,
      }),
    );

    expect(block1).toBe(root.children[1]);
    expect(block2).toBe(root.children[2]);
    expect(block3).toBe(root.children[0]);

    expect(block1?.parentId).toBe(document.ROOT_ID);
    expect(block2?.parentId).toBe(document.ROOT_ID);
    expect(block3?.parentId).toBe(document.ROOT_ID);
  });

  it("moves a block after a sibling correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);

    // Act
    document.moveBlock({
      strategy: "after",
      blockId: SAMPLE_BLOCK1.id,
      targetId: SAMPLE_BLOCK3.id,
    });

    // Assert
    const root = document.getRoot();
    const block1 = document.getBlock(SAMPLE_BLOCK1.id);
    const block2 = document.getBlock(SAMPLE_BLOCK2.id);
    const block3 = document.getBlock(SAMPLE_BLOCK3.id);

    expect(root.children).toStrictEqual([
      expect.objectContaining(SAMPLE_BLOCK2),
      expect.objectContaining(SAMPLE_BLOCK3),
      expect.objectContaining(SAMPLE_BLOCK1),
    ]);

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK1.id,
        data: SAMPLE_BLOCK1.data,
        type: SAMPLE_BLOCK1.type,
      }),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK2.id,
        data: SAMPLE_BLOCK2.data,
        type: SAMPLE_BLOCK2.type,
      }),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK3.id,
        data: SAMPLE_BLOCK3.data,
        type: SAMPLE_BLOCK3.type,
      }),
    );

    expect(block1).toBe(root.children[2]);
    expect(block2).toBe(root.children[0]);
    expect(block3).toBe(root.children[1]);

    expect(block1?.parentId).toBe(document.ROOT_ID);
    expect(block2?.parentId).toBe(document.ROOT_ID);
    expect(block3?.parentId).toBe(document.ROOT_ID);
  });
});

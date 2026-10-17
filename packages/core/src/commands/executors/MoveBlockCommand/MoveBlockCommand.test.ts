import type {
  MoveBlockAction,
  MoveBlockActionPayload,
} from "../../../actions/action-types/move-block-action.models";
import { createCommand } from "../utils/commandExecutors-test.utils";
import { MoveBlockCommand } from "./MoveBlockCommand";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../../document/utils/document-test.utils";
import type { MoveBlockStrategy } from "../../../document/models/document.models";
import { EditorDocument } from "../../../document/EditorDocument";

const createMoveCommand = (payload: MoveBlockActionPayload) => {
  const { command, document, ...commandUtils } = createCommand<"block:move">({
    command: MoveBlockCommand,
    documentBlocks: [
      ["root", TOGGLE_LIST1_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
      [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
      [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4],
    ],
    payload,
  });

  const assertCorrectTreeStructure = () => {
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[1],
    );

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
                    id: SAMPLE_BLOCK3.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK4.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  };

  return {
    ...commandUtils,
    document,
    moveCommand: command,
    assertCorrectTreeStructure,
  };
};

const DEFAULT_PAYLOAD = {
  blockId: SAMPLE_BLOCK4.id,
  targetId: TOGGLE_LIST1_BLOCK.id,
  strategy: "append",
} as const satisfies MoveBlockAction["payload"];

describe("MoveBlockCommand", () => {
  it("moves a block to be a direct child of the root correctly if the strategy is 'append'", () => {
    // Arrange
    const { document, moveCommand, assertCorrectTreeStructure } = createMoveCommand({
      ...DEFAULT_PAYLOAD,
      strategy: "append",
    });

    // Assert
    assertCorrectTreeStructure();

    // Act
    moveCommand.execute();

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children[0]?.children?.[1],
    );

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
                    id: SAMPLE_BLOCK3.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("moves the block to be before the target block correctly if the strategy is 'before'", () => {
    // Arrange
    const { document, moveCommand, assertCorrectTreeStructure } = createMoveCommand({
      ...DEFAULT_PAYLOAD,
      strategy: "before",
    });

    // Assert
    assertCorrectTreeStructure();

    // Act
    moveCommand.execute();

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(document.getRoot().children[0]);

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[1]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[1]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[1],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),

          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK3.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("moves the block to be after the target block correctly if the strategy is 'after'", () => {
    // Arrange
    const { document, moveCommand, assertCorrectTreeStructure } = createMoveCommand({
      ...DEFAULT_PAYLOAD,
      strategy: "after",
    });

    // Assert
    assertCorrectTreeStructure();

    // Act
    moveCommand.execute();

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[0].children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(document.getRoot().children[1]);

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
                    id: SAMPLE_BLOCK3.id,
                  }),
                ],
              }),
            ],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("leaves a document that parses back from its JSON to the same tree", () => {
    // Arrange
    const { document, moveCommand, assertCorrectTreeStructure } = createMoveCommand({
      ...DEFAULT_PAYLOAD,
      strategy: "append",
    });

    const initialDocumentJSON = document.toJSON();

    // Assert
    assertCorrectTreeStructure();

    // Act
    moveCommand.execute();

    // Assert
    const currentDocumentJSON = document.toJSON();

    expect(initialDocumentJSON).not.toBe(currentDocumentJSON);
    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(currentDocumentJSON)).toStrictEqual(document);
  });

  test.each([["append"], ["before"], ["after"]] satisfies [MoveBlockStrategy][])(
    "returns the block:move event with the blockId of the moved block with strategy %s",
    strategy => {
      // Arrange
      const { moveCommand } = createMoveCommand({
        ...DEFAULT_PAYLOAD,
        strategy,
      });

      // Act
      const event = moveCommand.execute();

      // Assert
      expect(event).toStrictEqual({
        type: "block:move",
        blockId: SAMPLE_BLOCK4.id,
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy,
      });
    },
  );
});

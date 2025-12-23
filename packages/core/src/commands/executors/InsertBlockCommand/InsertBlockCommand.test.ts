import type { InsertBlockActionPayload } from "../../../actions/action-types/insert-block-action.models";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST3_BLOCK,
} from "../../../document/utils/document-test.utils";
import { InsertBlockCommand } from "./InsertBlockCommand";
import {
  createCommand,
  type DocumentBlocksInitialization,
} from "../utils/commandExecutors-test.utils";
import type { InsertBlockEventStrategy } from "../../../events/editor-event-bus/event-types/insert-block-event.models";

const createInsertCommand = (
  payload: InsertBlockActionPayload,
  documentBlocks?: DocumentBlocksInitialization[],
) => {
  const { command, document, ...commandUtils } = createCommand<"block:insert">({
    command: InsertBlockCommand,
    payload,
    documentBlocks: documentBlocks ?? [
      ["root", TOGGLE_LIST1_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2],
    ],
  });

  const assertCorrectTreeStructure = () => {
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
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
    insertCommand: command,
    assertCorrectTreeStructure,
  };
};

const DEFAULT_PAYLOAD = {
  targetId: SAMPLE_BLOCK2.id,
  newBlock: {
    ...TOGGLE_LIST3_BLOCK,
    children: [SAMPLE_BLOCK4, SAMPLE_BLOCK5],
  },
  strategy: "after",
} as const satisfies InsertBlockActionPayload;

describe("InsertBlockCommand", () => {
  it("inserts a block after the target block correctly", () => {
    // Arrange
    const { document, insertCommand, assertCorrectTreeStructure } =
      createInsertCommand({
        ...DEFAULT_PAYLOAD,
        strategy: "after",
      });

    // Assert
    assertCorrectTreeStructure();

    // Act
    insertCommand.execute();

    // Assert
    const newBlockRoot = document.getRoot().children?.[0]?.children?.[1];

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(newBlockRoot);
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(newBlockRoot?.children?.[0]);
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(newBlockRoot?.children?.[1]);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),

              expect.objectContaining({
                id: TOGGLE_LIST3_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK4.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK5.id,
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

  it("inserts a block before the target block correctly", () => {
    // Arrange
    const { document, insertCommand, assertCorrectTreeStructure } =
      createInsertCommand({
        ...DEFAULT_PAYLOAD,
        strategy: "before",
      });

    // Assert
    assertCorrectTreeStructure();

    // Act
    insertCommand.execute();

    // Assert
    const newBlockRoot = document.getRoot().children?.[0]?.children?.[0];

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(newBlockRoot);
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(newBlockRoot?.children?.[0]);
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(newBlockRoot?.children?.[1]);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST3_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK4.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK5.id,
                  }),
                ],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("inserts a block appending it to the target block correctly", () => {
    // Arrange
    const { document, insertCommand, assertCorrectTreeStructure } =
      createInsertCommand({
        ...DEFAULT_PAYLOAD,
        targetId: "root",
        strategy: "append",
      });

    // Assert
    assertCorrectTreeStructure();

    // Act
    insertCommand.execute();

    // Assert
    const newBlockRoot = document.getRoot().children?.[1];

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(newBlockRoot);
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(newBlockRoot?.children?.[0]);
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(newBlockRoot?.children?.[1]);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: expect.arrayContaining([
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),
            ]),
          }),

          expect.objectContaining({
            id: TOGGLE_LIST3_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK5.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("adds the new snapshot of the document after change to the history", () => {
    // Arrange
    const {
      document,
      history,
      insertCommand,
      assertCorrectTreeStructure,
      assertInitialHistoryIsCorrect,
    } = createInsertCommand({
      ...DEFAULT_PAYLOAD,
      strategy: "before",
    });

    const initialDocumentJSON = document.toJSON();

    // Assert
    assertCorrectTreeStructure();
    assertInitialHistoryIsCorrect(initialDocumentJSON);

    // Act
    insertCommand.execute();

    // Assert
    const currentDocumentJSON = document.toJSON();

    expect(history.getHistory()).toStrictEqual([
      initialDocumentJSON,
      currentDocumentJSON,
    ]);

    expect(history.getCurrent()).toBe(currentDocumentJSON);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(initialDocumentJSON).not.toBe(currentDocumentJSON);
    assertTreeIntegrity(document);
  });

  test.each([["before"], ["after"]] satisfies [InsertBlockEventStrategy][])(
    "emits an event with payload the blockId of the inserted item with strategy %s",
    strategy => {
      // Arrange
      const { eventBus, insertCommand } = createInsertCommand({
        ...DEFAULT_PAYLOAD,
        strategy,
      });

      const insertBlockEventCallback = vi.fn();
      eventBus.on("block:insert", insertBlockEventCallback);

      // Act
      insertCommand.execute();

      // Assert
      expect(insertBlockEventCallback).toHaveBeenCalledExactlyOnceWith({
        type: "block:insert",
        blockId: TOGGLE_LIST3_BLOCK.id,
        targetId: SAMPLE_BLOCK2.id,
        strategy,
      });
    },
  );

  test.each([["before"], ["after"]] satisfies [InsertBlockEventStrategy][])(
    "emits only block:insert event when the strategy is %s",
    strategy => {
      // Arrange
      const { eventBus, insertCommand } = createInsertCommand({
        ...DEFAULT_PAYLOAD,
        strategy,
      });

      const updateCallback = vi.fn();
      const deleteCallback = vi.fn();
      const moveCallback = vi.fn();

      eventBus.on("block:update", updateCallback);
      eventBus.on("block:delete", deleteCallback);
      eventBus.on("block:move", moveCallback);

      // Act
      insertCommand.execute();

      // Assert
      expect(updateCallback).not.toHaveBeenCalled();
      expect(deleteCallback).not.toHaveBeenCalled();
      expect(moveCallback).not.toHaveBeenCalled();
    },
  );
});

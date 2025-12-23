import { createCommand } from "../utils/commandExecutors-test.utils";
import { HistoryJumpCommand } from "./HistoryJumpCommand";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
} from "../../../document/utils/document-test.utils";
import { InsertBlockCommand } from "../InsertBlockCommand";
import { UpdateBlockCommand } from "../UpdateBlockCommand";
import type { InsertBlockActionPayload } from "../../../actions/action-types/insert-block-action.models";
import type { UpdateBlockActionPayload } from "../../../actions/action-types/update-block-action.models";

const insertBlock1Payload: InsertBlockActionPayload = {
  targetId: "root",
  strategy: "append",
  newBlock: SAMPLE_BLOCK1,
};

const insertBlock2Payload: InsertBlockActionPayload = {
  targetId: "root",
  strategy: "append",
  newBlock: SAMPLE_BLOCK2,
};

const updateBlock1Payload: UpdateBlockActionPayload = {
  blockId: SAMPLE_BLOCK1.id,
  childrenStrategy: "drop",
  newBlock: SAMPLE_BLOCK3,
};

const createHistoryJumpCommand = () => {
  const { eventBus, history, document, ...commandUtils } =
    createCommand<"history:jump">({
      command: HistoryJumpCommand,
      documentBlocks: [],
      payload: {
        index: 0,
      },
    });

  const insertCommand1 = new InsertBlockCommand(
    insertBlock1Payload,
    eventBus,
    history,
    document,
  );

  const insertCommand2 = new InsertBlockCommand(
    insertBlock2Payload,
    eventBus,
    history,
    document,
  );

  const updateCommand1 = new UpdateBlockCommand(
    updateBlock1Payload,
    eventBus,
    history,
    document,
  );

  const historyJump = (index: number) => {
    const historyJumpCommand = new HistoryJumpCommand(
      { index },
      eventBus,
      history,
      document,
    );

    historyJumpCommand.execute();
  };

  return {
    ...commandUtils,
    eventBus,
    history,
    document,
    insertCommand1,
    insertCommand2,
    updateCommand1,
    historyJump,
  };
};

describe("HistoryJumpCommand", () => {
  it("executes the history jump command and updates the document correctly", () => {
    // Arrange
    const { insertCommand1, insertCommand2, updateCommand1, historyJump, document } =
      createHistoryJumpCommand();

    insertCommand1.execute();
    insertCommand2.execute();
    updateCommand1.execute();

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK3.id,
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK2.id,
          }),
        ],
      }),
    );

    // Act
    historyJump(0);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [],
      }),
    );

    // Act
    historyJump(2);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(document.getRoot().children[0]);
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(document.getRoot().children[1]);
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK1.id,
          }),
          expect.objectContaining({
            id: SAMPLE_BLOCK2.id,
          }),
        ],
      }),
    );

    // Act
    historyJump(1);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(document.getRoot().children[0]);
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK1.id,
          }),
        ],
      }),
    );

    // Act
    historyJump(3);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(document.getRoot().children[1]);
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(document.getRoot().children[0]);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK3.id,
          }),
          expect.objectContaining({
            id: SAMPLE_BLOCK2.id,
          }),
        ],
      }),
    );
  });

  test.each([[-1], [4], [35], [3]])(
    "throws if if the index %s is out of bounds",
    index => {
      // Arrange
      const { historyJump, insertCommand1, insertCommand2 } =
        createHistoryJumpCommand();
      insertCommand1.execute();
      insertCommand2.execute();

      // Assert
      expect(() => historyJump(index)).toThrowError("Index out of range");
    },
  );

  it("does nothing if the index is the same as the current", () => {
    // Arrange
    const {
      document,
      historyJump,
      history,
      INITIAL_DOCUMENT_JSON,
      insertCommand1,
      insertCommand2,
    } = createHistoryJumpCommand();

    insertCommand1.execute();
    const jsonAfterInsertCommand1 = document.toJSON();

    insertCommand2.execute();
    const jsonAfterInsertCommand2 = document.toJSON();

    // Assert
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getCurrent()).toBe(jsonAfterInsertCommand2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);

    // Act
    historyJump(2);

    // Assert
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getCurrent()).toBe(jsonAfterInsertCommand2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);

    expect(document.toJSON()).toBe(jsonAfterInsertCommand2);
  });

  it("updates the current position in history correctly", () => {
    // Arrange
    const {
      document,
      historyJump,
      history,
      insertCommand1,
      insertCommand2,
      INITIAL_DOCUMENT_JSON,
    } = createHistoryJumpCommand();

    insertCommand1.execute();
    const jsonAfterInsertCommand1 = document.toJSON();

    insertCommand2.execute();
    const jsonAfterInsertCommand2 = document.toJSON();

    // Assert
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);

    // Act
    historyJump(0);

    // Assert
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);

    expect(document.toJSON()).toBe(INITIAL_DOCUMENT_JSON);

    // Act
    historyJump(2);

    // Assert
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getCurrent()).toBe(jsonAfterInsertCommand2);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);
    expect(document.toJSON()).toBe(jsonAfterInsertCommand2);

    // Act
    historyJump(1);

    // Assert
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getCurrent()).toBe(jsonAfterInsertCommand1);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      jsonAfterInsertCommand1,
      jsonAfterInsertCommand2,
    ]);
    expect(document.toJSON()).toBe(jsonAfterInsertCommand1);
  });

  it("emits the history jump event", () => {
    // Arrange
    const { historyJump, insertCommand1, insertCommand2, eventBus } =
      createHistoryJumpCommand();

    const historyJumpCallback = vi.fn();
    eventBus.on("history:jump", historyJumpCallback);

    insertCommand1.execute();
    insertCommand2.execute();

    // Asert
    expect(historyJumpCallback).not.toHaveBeenCalled();

    // Act
    historyJump(0);

    // Assert
    expect(historyJumpCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:jump",
      index: 0,
    });

    historyJumpCallback.mockClear();

    // Act
    historyJump(2);

    // Assert
    expect(historyJumpCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:jump",
      index: 2,
    });

    historyJumpCallback.mockClear();

    // Act
    historyJump(1);

    // Assert
    expect(historyJumpCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:jump",
      index: 1,
    });
  });
});

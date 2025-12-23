import { createCommand } from "../utils/commandExecutors-test.utils";
import {
  SAMPLE_BLOCK2,
  TOGGLE_LIST1_BLOCK,
} from "../../../document/utils/document-test.utils";
import { RedoCommand } from "./RedoCommand";
import type { InsertBlockActionPayload } from "../../../actions/action-types/insert-block-action.models";
import { InsertBlockCommand } from "../InsertBlockCommand";
import { UndoCommand } from "../UndoCommand/UndoCommand";

const INSERT_BLOCK_COMMAND1 = {
  newBlock: SAMPLE_BLOCK2,
  targetId: TOGGLE_LIST1_BLOCK.id,
  strategy: "append",
} as const satisfies InsertBlockActionPayload;

const createRedoCommandEnvironment = () => {
  const {
    command: redoCommand,
    eventBus,
    history,
    document,
    ...commandUtils
  } = createCommand<"history:redo">({
    command: RedoCommand,
    payload: null,
    documentBlocks: [["root", TOGGLE_LIST1_BLOCK]],
  });

  const inserBlockCommand = new InsertBlockCommand(
    INSERT_BLOCK_COMMAND1,
    eventBus,
    history,
    document,
  );

  const insertBlock = () => {
    inserBlockCommand.execute();

    return {
      documentJSONAfterInsert: document.toJSON(),
    };
  };

  return {
    redoCommand,
    undoCommand: new UndoCommand(null, eventBus, history, document),
    eventBus,
    history,
    document,
    insertBlock,
    ...commandUtils,
  };
};

describe("RedoCommand", () => {
  it("executes the redo command and updates the document correctly", () => {
    // Arrange
    const {
      document,
      insertBlock,
      undoCommand,
      redoCommand,
      INITIAL_DOCUMENT_JSON,
      assertInitialHistoryIsCorrect,
    } = createRedoCommandEnvironment();

    // Assert
    assertInitialHistoryIsCorrect(INITIAL_DOCUMENT_JSON);

    // Act
    const { documentJSONAfterInsert } = insertBlock();

    // Assert
    expect(document.toJSON()).toBe(documentJSONAfterInsert);
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
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

    // Act
    undoCommand.execute();

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    expect(document.toJSON()).toBe(INITIAL_DOCUMENT_JSON);

    // Act
    redoCommand.execute();

    // Assert
    expect(document.toJSON()).toBe(documentJSONAfterInsert);
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
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
  });

  it("does nothing if the history is empty", () => {
    // Arrange
    const {
      redoCommand,
      history,
      eventBus,
      assertInitialHistoryIsCorrect,
      INITIAL_DOCUMENT_JSON,
    } = createRedoCommandEnvironment();

    const redoEventCallback = vi.fn();
    eventBus.on("history:redo", redoEventCallback);

    // Assert
    assertInitialHistoryIsCorrect(INITIAL_DOCUMENT_JSON);

    // Act
    history.clear();

    // Assert
    expect(history.getCurrent()).toBeNull();
    expect(history.getHistory()).toEqual([]);

    // Act
    redoCommand.execute();

    // Assert
    expect(history.getCurrent()).toBeNull();
    expect(history.getHistory()).toEqual([]);
    expect(redoEventCallback).not.toHaveBeenCalled();
  });

  it("does nothing and returns null if the current is the last record in history", () => {
    // Arrange
    const { history, INITIAL_DOCUMENT_JSON, undoCommand } =
      createRedoCommandEnvironment();

    // Assert
    expect(history.getHistory()).toEqual([INITIAL_DOCUMENT_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);

    // Act
    undoCommand.execute();

    // Assert
    expect(history.getHistory()).toEqual([INITIAL_DOCUMENT_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
  });

  it("sets the current record in history to the next record", () => {
    // Arrange
    const { history, INITIAL_DOCUMENT_JSON, insertBlock, undoCommand, redoCommand } =
      createRedoCommandEnvironment();

    // Assert
    expect(history.getHistory()).toEqual([INITIAL_DOCUMENT_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    const { documentJSONAfterInsert } = insertBlock();

    // Assert
    expect(history.getCurrent()).toBe(documentJSONAfterInsert);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONAfterInsert,
    ]);

    expect(history.getCurrentPosition()).toBe(1);

    // Act
    undoCommand.execute();

    // Assert
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONAfterInsert,
    ]);

    expect(history.getCurrentPosition()).toBe(0);

    // Act
    redoCommand.execute();

    // Assert
    expect(history.getCurrent()).toBe(documentJSONAfterInsert);
    expect(history.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONAfterInsert,
    ]);

    expect(history.getCurrentPosition()).toBe(1);
  });

  it("emits a 'history:redo' event correctly", () => {
    // Arrange
    const { eventBus, insertBlock, undoCommand, redoCommand } =
      createRedoCommandEnvironment();

    const redoEventCallback = vi.fn();
    eventBus.on("history:redo", redoEventCallback);

    // Act
    redoCommand.execute();

    // Assert
    expect(redoEventCallback).not.toHaveBeenCalled();

    // Act
    insertBlock();
    undoCommand.execute();

    // Assert
    expect(redoEventCallback).not.toHaveBeenCalled();

    // Act
    redoCommand.execute();

    // Assert
    expect(redoEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:redo",
    });
  });

  it("does not emit a 'history:redo' event if the history is empty", () => {
    // Arrange
    const { eventBus, history, redoCommand } = createRedoCommandEnvironment();

    const redoEventCallback = vi.fn();
    eventBus.on("history:redo", redoEventCallback);

    // Act
    history.clear();
    redoCommand.execute();

    // Assert
    expect(history.getCurrent()).toBeNull();
    expect(history.getHistory()).toEqual([]);
    expect(redoEventCallback).not.toHaveBeenCalled();
  });
});

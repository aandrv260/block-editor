import type { InsertBlockActionPayload } from "../../../actions/action-types/insert-block-action.models";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK3,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../../document/utils/document-test.utils";
import { InsertBlockCommand } from "../InsertBlockCommand";
import { createCommand } from "../utils/commandExecutors-test.utils";
import { UndoCommand } from "./UndoCommand";
import type { CommandConstructor } from "../commandExecutors.models";

const insertPayload: InsertBlockActionPayload = {
  newBlock: {
    ...TOGGLE_LIST2_BLOCK,
  },
  targetId: TOGGLE_LIST1_BLOCK.id,
  strategy: "append",
};

const insertPayload2: InsertBlockActionPayload = {
  newBlock: {
    ...SAMPLE_BLOCK3,
  },
  targetId: TOGGLE_LIST2_BLOCK.id,
  strategy: "append",
};

const createUndoCommand = ({ limit }: { limit?: number } = {}) => {
  const {
    command: undoCommand,
    eventBus,
    history,
    document,
    ...commandUtils
  } = createCommand({
    command: UndoCommand as CommandConstructor<"history:undo">,
    payload: null,
    documentBlocks: [["root", TOGGLE_LIST1_BLOCK]],
    historyLimit: limit,
  });

  const INITIAL_DOCUMENT_JSON = document.toJSON();

  const assertInitialDocumentState = () => {
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );
  };

  const assertInitialHistoryIsCorrect = () => {
    expect(history.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(1);
  };

  const insertCommand = new InsertBlockCommand(
    insertPayload,
    eventBus,
    history,
    document,
  );

  return {
    ...commandUtils,
    insertCommand,
    document,
    history,
    eventBus,
    undoCommand,
    INITIAL_DOCUMENT_JSON,
    assertInitialDocumentState,
    assertInitialHistoryIsCorrect,
  };
};

describe("UndoCommand", () => {
  it("undoes the last action and updates the current document correctly", () => {
    // Arrange
    const {
      document,
      insertCommand,
      undoCommand,
      assertInitialDocumentState,
      assertInitialHistoryIsCorrect,
    } = createUndoCommand();

    // Assert
    assertInitialDocumentState();
    assertInitialHistoryIsCorrect();

    // Act
    insertCommand.execute();

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
                children: [],
              }),
            ],
          }),
        ],
      }),
    );

    // Act
    undoCommand.execute();

    // Assert
    assertInitialDocumentState();
    assertTreeIntegrity(document);
  });

  it("does nothing if the current is the first record in history", () => {
    // Arrange
    const {
      undoCommand,
      eventBus,
      assertInitialDocumentState,
      assertInitialHistoryIsCorrect,
    } = createUndoCommand();

    const undoEventCallback = vi.fn();
    eventBus.on("history:undo", undoEventCallback);

    // Assert
    assertInitialDocumentState();
    assertInitialHistoryIsCorrect();

    // Act
    undoCommand.execute();

    // Assert
    assertInitialDocumentState();
    assertInitialHistoryIsCorrect();
    expect(undoEventCallback).not.toHaveBeenCalled();
  });

  it("updates the history instance correctly", () => {
    // Arrange
    const { document, insertCommand, undoCommand, history, INITIAL_DOCUMENT_JSON } =
      createUndoCommand();

    // Act
    insertCommand.execute();
    const insertedDocumentJSON = document.toJSON();

    undoCommand.execute();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      insertedDocumentJSON,
    ]);

    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(2);
  });

  it("emits the correct event", () => {
    // Arrange
    const { insertCommand, undoCommand, eventBus } = createUndoCommand();
    const undoEventCallback = vi.fn();

    eventBus.on("history:undo", undoEventCallback);

    // Act
    insertCommand.execute();
    undoCommand.execute();

    // Assert
    expect(undoEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:undo",
    });
  });

  it("undoes multiple actions correctly", () => {
    // Arrange
    const {
      document,
      insertCommand,
      undoCommand,
      history,
      eventBus,
      INITIAL_DOCUMENT_JSON,
    } = createUndoCommand();

    const insertCommand2 = new InsertBlockCommand(
      insertPayload2,
      eventBus,
      history,
      document,
    );

    // Act
    insertCommand.execute();
    const insertedDocumentJSON = document.toJSON();
    insertCommand2.execute();
    const insertedDocumentJSON2 = document.toJSON();

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
                    id: SAMPLE_BLOCK3.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    expect(history.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      insertedDocumentJSON,
      insertedDocumentJSON2,
    ]);

    expect(history.getCurrent()).toBe(insertedDocumentJSON2);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getSize()).toBe(3);

    // Act
    undoCommand.execute();
    undoCommand.execute();

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
          }),
        ],
      }),
    );

    expect(history.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      insertedDocumentJSON,
      insertedDocumentJSON2,
    ]);

    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(3);
  });

  it("does nothing if the history is empty", () => {
    // Arrange
    const { undoCommand, eventBus, history } = createUndoCommand();
    const undoEventCallback = vi.fn();

    eventBus.on("history:undo", undoEventCallback);

    // Act
    history.clear();

    // Assert
    expect(history.getHistory()).toEqual([]);
    expect(history.getCurrent()).toBeNull();
    expect(history.getCurrentPosition()).toBe(-1);
    expect(history.getSize()).toBe(0);

    // Act
    undoCommand.execute();

    // Assert
    expect(history.getHistory()).toEqual([]);
    expect(history.getCurrent()).toBeNull();
    expect(history.getCurrentPosition()).toBe(-1);
    expect(history.getSize()).toBe(0);
    expect(undoEventCallback).not.toHaveBeenCalled();
  });

  test("performs correctly when the history limit is reached", () => {
    // Arrange
    const {
      document,
      insertCommand,
      undoCommand,
      history,
      assertInitialHistoryIsCorrect,
    } = createUndoCommand({ limit: 1 });

    // Assert
    assertInitialHistoryIsCorrect();

    // Act
    insertCommand.execute();

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
                children: [],
              }),
            ],
          }),
        ],
      }),
    );

    expect(history.getHistory()).toStrictEqual([document.toJSON()]);

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(1);

    // Act
    undoCommand.execute();

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
                children: [],
              }),
            ],
          }),
        ],
      }),
    );

    expect(history.getHistory()).toStrictEqual([document.toJSON()]);

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(1);
  });

  it("doesn't emit an event if the user is on the first item in history and tries to undo", () => {
    // Arrange
    const { undoCommand, eventBus, assertInitialHistoryIsCorrect } =
      createUndoCommand();
    const undoEventCallback = vi.fn();

    eventBus.on("history:undo", undoEventCallback);

    // Assert
    assertInitialHistoryIsCorrect();

    // Act
    undoCommand.execute();

    // Assert
    assertInitialHistoryIsCorrect();
    expect(undoEventCallback).not.toHaveBeenCalled();
  });
});

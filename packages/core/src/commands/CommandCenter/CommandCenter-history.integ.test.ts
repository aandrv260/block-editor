import { createCommandCenter } from "./CommandCenter-test.utils";
import {
  SAMPLE_BLOCK3,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK9,
  TOGGLE_LIST5_BLOCK,
  SAMPLE_BLOCK10,
  assertTreeIntegrity,
} from "../../document/utils/document-test.utils";
import { createTestDocument } from "../executors/utils/commandExecutors-test.utils";
import { DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS } from "./CommandCenter-test.utils";

describe("CommandCenter history", () => {
  it("undoes the last change and emits the change events", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();

    const undoEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("history:undo", undoEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK3,
      strategy: "after",
    });

    const documentJSONfterInsert = document.toJSON();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: documentJSONfterInsert,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONfterInsert,
    ]);

    expect(history.getCurrent()).toBe(documentJSONfterInsert);

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

              expect.objectContaining({
                id: SAMPLE_BLOCK3.id,
              }),
            ],
          }),
        ],
      }),
    );

    // Act
    vi.clearAllMocks();
    commandCenter.undo();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: INITIAL_HISTORY_DOC_JSON,
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "history:undo",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONfterInsert,
    ]);

    expect(history.getCurrent()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getCurrentPosition()).toBe(0);
    assertInitialDefaultDocumentStructure();

    expect(undoEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:undo",
    });

    assertTreeIntegrity(document);
  });

  it("redoes the last undone change and emits the change events", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();

    const redoEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("history:redo", redoEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);

    // Act
    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK3,
      strategy: "after",
    });

    const documentJSONAfterInsert = document.toJSON();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: documentJSONAfterInsert,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    // Act
    vi.clearAllMocks();
    commandCenter.undo();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: INITIAL_HISTORY_DOC_JSON,
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "history:undo",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONAfterInsert,
    ]);

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);

    // Act
    vi.clearAllMocks();
    commandCenter.redo();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: documentJSONAfterInsert,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "history:redo",
    });

    expect(document.toJSON()).toBe(documentJSONAfterInsert);
    expect(history.getCurrent()).toBe(documentJSONAfterInsert);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONAfterInsert,
    ]);

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
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
                children: [],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK3.id,
              }),
            ],
          }),
        ],
      }),
    );

    expect(redoEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:redo",
    });

    assertTreeIntegrity(document);
  });

  it("jumps to a point in history and emits the change events", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      INITIAL_HISTORY_DOC_JSON,
      assertInitialDefaultDocumentStructure,
    } = createCommandCenter();

    const jumpToPointInHistoryEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("history:jump", jumpToPointInHistoryEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);

    // Act
    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      newBlock: TOGGLE_LIST3_BLOCK,
      strategy: "after",
    });

    const documentJSONAfterInsert1 = document.toJSON();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: documentJSONAfterInsert1,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    // Act
    vi.clearAllMocks();
    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST3_BLOCK.id,
      newBlock: SAMPLE_BLOCK4,
      strategy: "append",
    });

    const documentJSONAfterInsert2 = document.toJSON();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: documentJSONAfterInsert2,
      history: history.getHistory(),
      currentPositionInHistory: 2,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

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

              expect.objectContaining({
                id: TOGGLE_LIST3_BLOCK.id,
                children: [
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

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONAfterInsert1,
      documentJSONAfterInsert2,
    ]);

    expect(history.getCurrent()).toBe(documentJSONAfterInsert2);
    expect(history.getCurrentPosition()).toBe(2);

    // Act - jump to the first in history
    vi.clearAllMocks();
    commandCenter.jumpTo(0);

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: INITIAL_HISTORY_DOC_JSON,
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "history:jump",
    });
    assertInitialDefaultDocumentStructure();

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONAfterInsert1,
      documentJSONAfterInsert2,
    ]);

    expect(history.getCurrent()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getCurrentPosition()).toBe(0);

    expect(jumpToPointInHistoryEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "history:jump",
      index: 0,
    });

    assertTreeIntegrity(document);
  });

  it("sets the history and emits the change events", () => {
    // Arrange
    const { commandCenter, document, eventBus, history } = createCommandCenter();

    const outerDocument = createTestDocument(DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS);
    const newDocument1 = createTestDocument([
      ["root", SAMPLE_BLOCK3],
      ["root", SAMPLE_BLOCK4],
    ]);

    const newDocument2 = createTestDocument([
      ["root", SAMPLE_BLOCK5],
      ["root", SAMPLE_BLOCK6],
    ]);

    const onHistorySet = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("history:set", onHistorySet);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    expect(history.getHistory()).toEqual([document.toJSON()]);
    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    commandCenter.setHistory([
      newDocument2.toJSON(),
      newDocument1.toJSON(),
      outerDocument.toJSON(),
    ]);

    // Assert
    expect(onHistorySet).toHaveBeenCalledExactlyOnceWith({
      type: "history:set",
      history: history.getHistory(),
      currentPosition: history.getCurrentPosition(),
      currentRecord: history.getCurrent(),
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: outerDocument.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 2,
      root: document.getRoot(),
      triggerAction: "history:set",
    });

    expect(history.getHistory()).toEqual([
      newDocument2.toJSON(),
      newDocument1.toJSON(),
      outerDocument.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(outerDocument.toJSON());
    expect(history.getCurrentPosition()).toBe(2);

    // Act -insert block1
    vi.clearAllMocks();
    commandCenter.execute("block:insert", {
      targetId: "root",
      newBlock: SAMPLE_BLOCK9,
      strategy: "append",
    });

    const DOCUMENT_JSON_AFTER_INSERT1 = document.toJSON();

    // Assert
    expect(history.getHistory()).toEqual([
      newDocument2.toJSON(),
      newDocument1.toJSON(),
      outerDocument.toJSON(),
      DOCUMENT_JSON_AFTER_INSERT1,
    ]);

    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_INSERT1);
    expect(history.getCurrentPosition()).toBe(3);

    expect(onHistorySet).not.toHaveBeenCalled();

    // Act - go back to 1st position
    vi.clearAllMocks();
    commandCenter.jumpTo(1);

    // Assert
    expect(history.getHistory()).toEqual([
      newDocument2.toJSON(),
      newDocument1.toJSON(),
      outerDocument.toJSON(),
      DOCUMENT_JSON_AFTER_INSERT1,
    ]);

    expect(history.getCurrent()).toBe(newDocument1.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(onHistorySet).not.toHaveBeenCalled();

    // Act - change the whole history again
    vi.clearAllMocks();

    const newDocument4 = createTestDocument([
      ["root", TOGGLE_LIST5_BLOCK],
      [TOGGLE_LIST5_BLOCK.id, SAMPLE_BLOCK6],
      ["root", SAMPLE_BLOCK10],
    ]);

    commandCenter.setHistory([newDocument4.toJSON(), newDocument1.toJSON()]);

    // Assert
    expect(onHistorySet).toHaveBeenCalledExactlyOnceWith({
      type: "history:set",
      history: history.getHistory(),
      currentPosition: history.getCurrentPosition(),
      currentRecord: history.getCurrent(),
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: newDocument1.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "history:set",
    });

    expect(history.getHistory()).toEqual([
      newDocument4.toJSON(),
      newDocument1.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(newDocument1.toJSON());
    expect(history.getCurrentPosition()).toBe(1);

    // Act - change history with invalid one to test throwing
    expect(() => commandCenter.setHistory([newDocument4.toJSON()])).toThrowError(
      "The last record in the history is not the same as the current document!",
    );
  });

  it("emits no history events when there is nothing to undo, redo or jump to", () => {
    // Arrange
    const { commandCenter, document, history, eventBus, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const onJump = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("history:undo", onUndo);
    eventBus.on("history:redo", onRedo);
    eventBus.on("history:jump", onJump);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.undo();
    commandCenter.redo();
    commandCenter.jumpTo(0);

    // Assert
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    expect(onJump).not.toHaveBeenCalled();
    expect(onEditorChange).toHaveBeenCalledTimes(3);

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(history.getCurrentPosition()).toBe(0);
  });

  it("does nothing on undo and redo when the history is empty", () => {
    // Arrange
    const { commandCenter, document, history, eventBus, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onUndo = vi.fn();
    const onRedo = vi.fn();

    eventBus.on("history:undo", onUndo);
    eventBus.on("history:redo", onRedo);

    history.clear();

    // Act
    commandCenter.undo();
    commandCenter.redo();

    // Assert
    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getHistory()).toStrictEqual([]);
    expect(history.getCurrent()).toBeNull();
    expect(history.getCurrentPosition()).toBe(-1);
  });

  test.each([[-1], [2], [35]])(
    "throws and changes nothing when jumping to the out of range index %s",
    index => {
      // Arrange
      const { commandCenter, document, history, eventBus } = createCommandCenter();

      commandCenter.execute("block:insert", {
        targetId: TOGGLE_LIST2_BLOCK.id,
        newBlock: SAMPLE_BLOCK3,
        strategy: "after",
      });

      const documentJSONAfterInsert = document.toJSON();
      const onJump = vi.fn();
      const onEditorChange = vi.fn();

      eventBus.on("history:jump", onJump);
      eventBus.on("editor:change", onEditorChange);

      // Act and assert
      expect(() => commandCenter.jumpTo(index)).toThrowError("Index out of range");

      expect(onJump).not.toHaveBeenCalled();
      expect(onEditorChange).not.toHaveBeenCalled();
      expect(document.toJSON()).toBe(documentJSONAfterInsert);
      expect(history.getCurrentPosition()).toBe(1);
    },
  );

  it("undoes several changes in a row and redoes them back", () => {
    // Arrange
    const { commandCenter, document, history, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK3,
      strategy: "after",
    });

    const documentJSONAfterInsert1 = document.toJSON();

    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK4,
      strategy: "append",
    });

    const documentJSONAfterInsert2 = document.toJSON();

    // Act
    commandCenter.undo();

    // Assert
    expect(document.toJSON()).toBe(documentJSONAfterInsert1);
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    commandCenter.undo();

    // Assert
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    commandCenter.redo();
    commandCenter.redo();

    // Assert
    expect(document.toJSON()).toBe(documentJSONAfterInsert2);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      documentJSONAfterInsert1,
      documentJSONAfterInsert2,
    ]);

    assertTreeIntegrity(document);
  });
});

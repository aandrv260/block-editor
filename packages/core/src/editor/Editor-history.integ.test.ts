import { createEditor, createDocumentToSwapWith } from "./Editor-test.utils";
import { insertBlock, deleteBlock, swapDocument } from "@/actions/actions";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK8,
  SAMPLE_BLOCK9,
} from "@/document/utils/document-test.utils";
import {
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "@/document/utils/document-test.utils";
import { createTestDocument } from "@/commands/executors/utils/commandExecutors-test.utils";
import { moveBlock } from "@/actions/actions";
import { historySet } from "@/actions/actions";

describe("Editor history", () => {
  test("history grows with the dispatch of actions and shifts when necessary to cover the limit", () => {
    // Arrange
    const { editor, assertHistory, INITIAL_DOCUMENT_JSON } = createEditor({
      historyLimit: 2,
    });

    const insertBlock1EventCallback = vi.fn();
    editor.subscribe("block:insert", insertBlock1EventCallback);

    const historyUndoEventCallback = vi.fn();
    editor.subscribe("history:undo", historyUndoEventCallback);

    const historyRedoEventCallback = vi.fn();
    editor.subscribe("history:redo", historyRedoEventCallback);

    const historyJumpEventCallback = vi.fn();
    editor.subscribe("history:jump", historyJumpEventCallback);

    // Assert
    assertHistory({
      expectedDocumentHistory: [editor.getDocumentJSON()],
      expectedCurrentPositionInHistory: 0,
      expectedHistorySize: 1,
    });

    // Act
    editor.dispatchAction(
      insertBlock({
        targetId: editor.getRoot().id,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    );

    const documentJSONAfterFirstInsert = editor.getDocumentJSON();

    // Assert
    assertHistory({
      expectedDocumentHistory: [INITIAL_DOCUMENT_JSON, documentJSONAfterFirstInsert],
      expectedCurrentPositionInHistory: 1,
      expectedHistorySize: 2,
    });

    expect(insertBlock1EventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.getRoot().id,
      strategy: "append",
    });

    // Act
    vi.clearAllMocks();

    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK1.id }));
    const documentJSONAfterFirstDelete = editor.getDocumentJSON();

    // Assert
    assertHistory({
      expectedDocumentHistory: [
        documentJSONAfterFirstInsert,
        documentJSONAfterFirstDelete,
      ],
      expectedCurrentPositionInHistory: 1,
      expectedHistorySize: 2,
    });

    expect(editor.getDocumentJSON()).toBe(documentJSONAfterFirstDelete);

    // Act - jump to 0
    editor.jumpToPointInHistory(0);

    // Assert
    assertHistory({
      expectedDocumentHistory: [
        documentJSONAfterFirstInsert,
        documentJSONAfterFirstDelete,
      ],
      expectedCurrentPositionInHistory: 0,
      expectedHistorySize: 2,
    });

    expect(editor.getDocumentJSON()).toBe(documentJSONAfterFirstInsert);

    // Act -redo
    editor.redo();

    // Assert
    assertHistory({
      expectedDocumentHistory: [
        documentJSONAfterFirstInsert,
        documentJSONAfterFirstDelete,
      ],
      expectedCurrentPositionInHistory: 1,
      expectedHistorySize: 2,
    });

    expect(editor.getDocumentJSON()).toBe(documentJSONAfterFirstDelete);

    // Act - redo again
    editor.redo();

    // Assert
    assertHistory({
      expectedDocumentHistory: [
        documentJSONAfterFirstInsert,
        documentJSONAfterFirstDelete,
      ],
      expectedCurrentPositionInHistory: 1,
      expectedHistorySize: 2,
    });

    expect(editor.getDocumentJSON()).toBe(documentJSONAfterFirstDelete);

    // Act - undo
    editor.undo();

    // Assert
    assertHistory({
      expectedDocumentHistory: [
        documentJSONAfterFirstInsert,
        documentJSONAfterFirstDelete,
      ],
      expectedCurrentPositionInHistory: 0,
      expectedHistorySize: 2,
    });

    expect(editor.getDocumentJSON()).toBe(documentJSONAfterFirstInsert);
  });

  test("history is cleared on swap document event when clearHistory=true", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const documentToSwapWith = createDocumentToSwapWith();

    // Act
    editor.dispatchAction(
      insertBlock({
        targetId: editor["document"].ROOT_ID,
        newBlock: SAMPLE_BLOCK1,
        strategy: "append",
      }),
    );
    const DOCUMENT_JSON_AFTER_INSERT1 = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_INSERT1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_INSERT1);
    expect(editor.getCurrentPositionInHistory()).toBe(1);

    // Act
    editor.swapDocument({
      element: documentToSwapWith,
      clearHistory: true,
    });

    const DOCUMENT_HISTORY_AFTER_SWAP = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([DOCUMENT_HISTORY_AFTER_SWAP]);
    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_HISTORY_AFTER_SWAP);
    expect(editor.getCurrentPositionInHistory()).toBe(0);
  });

  it("appends new swapped document to the history after swap event if clearHistory=false", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const documentToSwapWith = createDocumentToSwapWith();

    // Act
    editor.dispatchAction(
      insertBlock({
        targetId: editor["document"].ROOT_ID,
        newBlock: SAMPLE_BLOCK1,
        strategy: "append",
      }),
    );
    const DOCUMENT_JSON_AFTER_INSERT1 = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_INSERT1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_INSERT1);
    expect(editor.getCurrentPositionInHistory()).toBe(1);

    // Act
    editor.dispatchAction(
      swapDocument({
        element: documentToSwapWith,
        clearHistory: false,
      }),
    );

    const DOCUMENT_HISTORY_AFTER_SWAP = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_INSERT1,
      DOCUMENT_HISTORY_AFTER_SWAP,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_HISTORY_AFTER_SWAP);
    expect(editor.getCurrentPositionInHistory()).toBe(2);
  });

  it("throws an error if the last record in the history is not the same as the current document after setting the history to a new array", () => {
    // Arrange
    const initialDocument = createTestDocument([
      ["root", TOGGLE_LIST1_BLOCK],
      ["root", TOGGLE_LIST2_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3],
    ]);

    const document2 = createTestDocument([["root", SAMPLE_BLOCK1]]);

    const onHistorySet = vi.fn();

    const { editor } = createEditor({
      initialDocument,
    });

    editor.subscribe("history:set", onHistorySet);

    // Assert
    expect(() =>
      editor.setHistory([initialDocument.toJSON(), document2.toJSON()]),
    ).toThrowError(
      "The last record in the history is not the same as the current document!",
    );

    expect(() =>
      editor.dispatchAction(historySet({ history: [document2.toJSON()] })),
    ).toThrowError(
      "The last record in the history is not the same as the current document!",
    );

    expect(onHistorySet).not.toHaveBeenCalled();
  });

  it("sets the history correctly, whether the new history is empty or not, in combination with other actions", () => {
    // Arrange
    // Arrange
    const initialDocument = createTestDocument([
      ["root", TOGGLE_LIST1_BLOCK],
      ["root", TOGGLE_LIST2_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3],
    ]);

    const { editor } = createEditor({
      initialDocument,
    });

    const onHistorySet = vi.fn();
    editor.subscribe("history:set", onHistorySet);

    const onHistorySetNeverCalled = vi.fn();
    editor
      .on("history:set")
      .filter(() => false)
      .map(e => e.currentRecord)
      .subscribe(onHistorySetNeverCalled);

    // Assert
    expect(editor.getHistory()).toEqual([initialDocument.toJSON()]);
    expect(editor.getCurrentHistoryRecord()).toBe(initialDocument.toJSON());
    expect(editor.getCurrentPositionInHistory()).toBe(0);

    // Act - insert a record
    editor.dispatchAction(
      insertBlock({
        targetId: "root",
        newBlock: SAMPLE_BLOCK4,
        strategy: "append",
      }),
    );

    const DOCUMENT_HISTORY_JSON_AFTER_INSERT1 = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([
      initialDocument.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    ]);

    expect(editor.getCurrentPositionInHistory()).toBe(1);
    expect(editor.getCurrentHistoryRecord()).toBe(
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    );

    // Act - swap history
    const newDocument1 = createTestDocument([["root", SAMPLE_BLOCK1]]);
    const newDocument2 = createTestDocument([["root", SAMPLE_BLOCK5]]);

    editor.setHistory([
      newDocument1.toJSON(),
      newDocument2.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    ]);

    // Assert
    expect(editor.getHistory()).toEqual([
      newDocument1.toJSON(),
      newDocument2.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    );

    expect(editor.getCurrentPositionInHistory()).toBe(2);

    expect(onHistorySet).toHaveBeenCalledExactlyOnceWith({
      type: "history:set",
      history: editor.getHistory(),
      currentPosition: editor.getCurrentPositionInHistory(),
      currentRecord: editor.getCurrentHistoryRecord(),
    });

    // Act - move block4 to be a descendant of 2
    editor.dispatchAction(
      moveBlock({
        blockId: SAMPLE_BLOCK4.id,
        targetId: TOGGLE_LIST2_BLOCK.id,
        strategy: "append",
      }),
    );

    const DOCUMENT_JSON_AFTER_MOVE1 = editor.getDocumentJSON();

    // Assert
    expect(editor.getHistory()).toEqual([
      newDocument1.toJSON(),
      newDocument2.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
      DOCUMENT_JSON_AFTER_MOVE1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_MOVE1);

    expect(editor.getCurrentPositionInHistory()).toBe(3);

    expect(onHistorySet).toHaveBeenCalledOnce();
    expect(onHistorySetNeverCalled).not.toHaveBeenCalled();

    // Act - undo
    editor.undo();

    // Assert
    expect(editor.getHistory()).toEqual([
      newDocument1.toJSON(),
      newDocument2.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
      DOCUMENT_JSON_AFTER_MOVE1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    );

    expect(editor.getCurrentPositionInHistory()).toBe(2);

    // Act - swap history last time
    vi.clearAllMocks();
    const newDocument3 = createTestDocument([
      ["root", SAMPLE_BLOCK9],
      ["root", SAMPLE_BLOCK8],
    ]);

    editor.setHistory([newDocument3.toJSON(), DOCUMENT_HISTORY_JSON_AFTER_INSERT1]);

    expect(editor.getHistory()).toEqual([
      newDocument3.toJSON(),
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(
      DOCUMENT_HISTORY_JSON_AFTER_INSERT1,
    );

    expect(editor.getCurrentPositionInHistory()).toBe(1);

    expect(onHistorySet).toHaveBeenCalledExactlyOnceWith({
      type: "history:set",
      history: editor.getHistory(),
      currentPosition: editor.getCurrentPositionInHistory(),
      currentRecord: editor.getCurrentHistoryRecord(),
    });

    expect(onHistorySetNeverCalled).not.toHaveBeenCalled();

    // Act - erase the history now with `setHistory`
    vi.clearAllMocks();
    editor.setHistory([]);

    // Assert
    expect(editor.getHistory()).toEqual([]);
    expect(editor.getCurrentHistoryRecord()).toBeNull();
    expect(editor.getCurrentPositionInHistory()).toBe(-1);
  });
});

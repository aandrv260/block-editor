import { DocumentHistory } from "./DocumentHistory";
import { EditorDocument } from "../../document/EditorDocument";
import {
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
} from "../../document/utils/document-test.utils";
import { DOCUMENT_HISTORY_RECORDS_LIMIT } from "./DocumentHistory.utils";
import { createEditorDocument, createHistory } from "./DocumentHistory-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import {
  EmptyInitialHistoryJsonError,
  HistoryIndexOutOfRangeError,
  InvalidHistoryLimitError,
} from "../errors";

describe("DocumentHistory", () => {
  it("creates a document history object with the initialDocumentJSON", () => {
    // Arrange
    const { document, history } = createHistory();
    const historyRecords = history.getHistory();

    // Assert
    expect(historyRecords).toHaveLength(1);
    expect(history.getCurrent()).toBe(historyRecords[0]);
    expect(EditorDocument.fromJSON(historyRecords[0])).toStrictEqual(document);
  });

  it("makes the current point in history equal to the first record on construction", () => {
    // Arrange
    const { document, history } = createHistory();

    // Assert
    expect(EditorDocument.fromJSON(history.getCurrent()!)).toStrictEqual(document);
    expect(history.getCurrentPosition()).toBe(0);
  });

  it("throws an error if the limit is 0", () => {
    // Arrange
    const tryCreateHistory = () =>
      new DocumentHistory({ initialDocumentJSON: "test123", limit: 0 });

    // Assert
    assertEngineError(tryCreateHistory, {
      ExpectedErrorClass: InvalidHistoryLimitError,
      expectedCode: "HISTORY:INVALID_HISTORY_LIMIT",
      expectedMessage: "Limit must be greater than 0!",
      expectedContext: { limit: 0 },
    });
  });

  it("throws an error if the initialDocumentJSON is an empty string", () => {
    // Arrange
    const tryCreateHistory = () =>
      new DocumentHistory({ initialDocumentJSON: "", limit: 10 });

    // Assert
    assertEngineError(tryCreateHistory, {
      ExpectedErrorClass: EmptyInitialHistoryJsonError,
      expectedCode: "HISTORY:EMPTY_INITIAL_HISTORY_JSON",
      expectedMessage: "Initial document JSON cannot be an empty string!",
    });
  });
});

describe("add()", () => {
  it("cleanly adds the JSON to the history", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);

    // Act
    history.add(document2.toJSON());

    // Assert
    const historyRecords = history.getHistory();

    expect(historyRecords).toHaveLength(2);
    expect(history.getCurrent()).toBe(historyRecords[1]);

    expect(EditorDocument.fromJSON(history.getHistory()[0])).toStrictEqual(document);
    expect(EditorDocument.fromJSON(history.getCurrent()!)).toStrictEqual(document2);
  });

  it("cleans the history ahead if the current is not the last item in the history and sets the current to the last item in history", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);

    // Act
    history.add(document2.toJSON());
    history.undo();

    // Assert
    const historyRecords1 = history.getHistory();

    expect(historyRecords1).toHaveLength(2);
    expect(history.getCurrent()).toBe(historyRecords1[0]);

    // Act
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);
    history.add(document3.toJSON());

    // Assert
    const historyRecords2 = history.getHistory();

    expect(historyRecords2).toHaveLength(2);
    expect(history.getCurrent()).toBe(historyRecords2[1]);

    expect(historyRecords2).toStrictEqual([document.toJSON(), document3.toJSON()]);
    expect(EditorDocument.fromJSON(historyRecords2[0])).toStrictEqual(document);
    expect(EditorDocument.fromJSON(historyRecords2[1])).toStrictEqual(document3);
  });

  it("removes the first element in history if the current length exceeds the limit set in the constructor and the current item is latest in history", () => {
    // Arrange
    const { document, history } = createHistory({ limit: 2 });
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(document2.toJSON());

    // Act
    history.add(document3.toJSON());

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document2.toJSON(),
      document3.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(document3.toJSON());
  });

  it("removes the first element in history if the current length exceeds the limit set in the constructor and the history has items ahead of the current", () => {
    // Arrange
    const { document, history } = createHistory({ limit: 3 });
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());
    history.undo();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
      document3.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(document2.toJSON());

    // Act
    const document4 = createEditorDocument(SAMPLE_BLOCK7, SAMPLE_BLOCK8);

    // Act
    history.add(document4.toJSON());

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
      document4.toJSON(),
    ]);
  });

  it("correctly adds a new record when the history is empty", () => {
    // Arrange
    const { history, document } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);

    // Act
    history.add(document2.toJSON());

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
    ]);

    // Act
    history.clear();

    // Assert
    expect(history.getHistory()).toHaveLength(0);
    expect(history.getCurrent()).toBeNull();
    expect(history.getCurrentPosition()).toBe(-1);

    // Act
    history.add(document2.toJSON());

    // Assert
    expect(history.getHistory()).toStrictEqual([document2.toJSON()]);
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getCurrentPosition()).toBe(0);
  });
});

describe("redo()", () => {
  const setupRedoEnvironment = () => {
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    return { document, document2, document3, history };
  };

  it("returns null if the current is the last record in history and redo() is called", () => {
    // Arrange
    const { document2, document3, history } = setupRedoEnvironment(); // Has 3 docs inside.
    history.undo();

    // Assert
    expect(history.getHistory()).toHaveLength(3);
    expect(history.getCurrent()).toBe(document2.toJSON());

    // Act
    history.redo();

    // Assert
    expect(history.getCurrent()).toBe(document3.toJSON());
    expect(history.getHistory()).toHaveLength(3);
  });

  it("returns the next record in history and sets the current to the next record", () => {
    // Arrange
    const { document2, document3, history } = setupRedoEnvironment(); // Has 3 docs inside.

    history.undo();

    // Assert
    expect(history.getCurrent()).toBe(document2.toJSON());

    // Act
    const nextItem = history.redo();

    // Assert
    expect(nextItem).toBe(document3.toJSON());
    expect(history.getCurrent()).toBe(document3.toJSON());
    expect(history.getHistory()).toHaveLength(3);
  });

  it("returns null if the history is empty and redo() is called", () => {
    // Arrange
    const { history } = createHistory();

    // Assert
    expect(history.redo()).toBeNull();
  });
});

describe("undo()", () => {
  it("moves the current 1 step back in history and returns its new value ", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    const newCurrentRecord = history.undo();

    // Assert
    const historyRecords = history.getHistory();

    expect(newCurrentRecord).toBe(history.getCurrent());
    expect(historyRecords).toHaveLength(2);
    expect(EditorDocument.fromJSON(newCurrentRecord!)).toStrictEqual(document);
  });

  it("returns null and does nothing if the current is the first record in history and undo() is called", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    history.undo();
    const current = history.undo();

    // Assert
    expect(current).toBeNull();
    expect(history.getHistory()).toHaveLength(1);
  });
});

describe("jumpTo()", () => {
  it("jumps to the specified index and returns the record at the index", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Assert
    expect(history.getCurrent()).toBe(document3.toJSON());
    expect(history.getHistory()).toHaveLength(3);
    expect(EditorDocument.fromJSON(history.getCurrent()!)).toStrictEqual(document3);

    // Act
    const newCurrentRecord = history.jumpTo(0);

    // Assert
    expect(newCurrentRecord).toBe(document.toJSON());
    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getHistory()).toHaveLength(3);
    expect(EditorDocument.fromJSON(newCurrentRecord!)).toStrictEqual(document);
  });

  test.each([[-1], [1], [100]])(
    "throws an error if the index is out of range and jumpTo() is called",
    index => {
      // Arrange
      const { history } = createHistory();
      const tryJumpTo = () => history.jumpTo(index);

      // Assert
      assertEngineError(tryJumpTo, {
        ExpectedErrorClass: HistoryIndexOutOfRangeError,
        expectedCode: "HISTORY:HISTORY_INDEX_OUT_OF_RANGE",
        expectedMessage: "Index out of range",
        expectedContext: { index },
      });
    },
  );

  it("returns null if the index is the same as the current and jumpTo() is called", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);

    history.add(document2.toJSON());

    // Act
    history.jumpTo(0);

    // Assert
    expect(history.jumpTo(0)).toBeNull();
  });
});

describe("clear()", () => {
  it("clears the history", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    history.clear();

    // Assert
    expect(history.getHistory()).toHaveLength(0);
    expect(history.getCurrent()).toBeNull();
  });

  it("does nothing if the history is already empty and clear() is called", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    history.clear();

    // Assert
    expect(history.getHistory()).toHaveLength(0);
    expect(history.getCurrent()).toBeNull();

    // Act
    history.clear();

    // Assert
    expect(history.getHistory()).toHaveLength(0);
    expect(history.getCurrent()).toBeNull();
  });
});

describe("getSize()", () => {
  it("returns the correct size of the history", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);

    // Act
    history.add(document2.toJSON());

    // Assert
    expect(history.getSize()).toBe(2);
  });

  it("returns 0 if the history is empty", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    history.clear();

    // Assert
    expect(history.getSize()).toBe(0);
  });

  it("returns the correct size of the history after undo() and redo()", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    history.undo();

    // Assert
    expect(history.getSize()).toBe(2);

    // Act
    history.redo();

    // Assert
    expect(history.getSize()).toBe(2);

    // Act
    history.redo();

    // Assert
    expect(history.getSize()).toBe(2);
  });
});

describe("getCurrent()", () => {
  it("returns the current record in history", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    const current = history.getCurrent();

    // Assert
    expect(current).toBe(document2.toJSON());
  });

  it("returns null if the history is empty", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    history.clear();

    // Assert
    expect(history.getCurrent()).toBeNull();
  });

  it("returns the current record in history correctly after undo() and redo()", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Act
    history.undo();

    // Assert
    expect(history.getCurrent()).toBe(document2.toJSON());

    // Act
    history.redo();

    // Assert
    expect(history.getCurrent()).toBe(document3.toJSON());

    // Act
    history.undo();
    const newCurrent = history.undo();

    // Assert
    expect(newCurrent).toBe(document.toJSON());
    expect(history.getCurrent()).toBe(document.toJSON());
  });
});

describe("getHistory()", () => {
  it("returns the history correctly", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    const historyRecords = history.getHistory();

    // Assert
    expect(historyRecords).toHaveLength(2);
    expect(historyRecords).toStrictEqual([document.toJSON(), document2.toJSON()]);
  });

  it("returns the history correctly after undo() and redo()", () => {
    // Arrange
    const { document, history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Act
    history.undo();

    // Assert
    expect(history.getHistory()).toHaveLength(3);
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
      document3.toJSON(),
    ]);

    // Act
    history.redo();

    // Assert
    expect(history.getHistory()).toHaveLength(3);
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
      document3.toJSON(),
    ]);

    // Act
    history.redo();

    // Assert
    expect(history.getHistory()).toHaveLength(3);
    expect(history.getHistory()).toStrictEqual([
      document.toJSON(),
      document2.toJSON(),
      document3.toJSON(),
    ]);
  });

  it("returns a new array object on every call", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    const historyRecords1 = history.getHistory();
    const historyRecords2 = history.getHistory();

    // Assert
    expect(historyRecords1).not.toBe(historyRecords2);
    expect(historyRecords1).toEqual(historyRecords2);
  });
});

describe("setHistory()", () => {
  it("updates the position index correctly if the new history is empty", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    history.add(document2.toJSON());

    // Act
    const passedHistory: string[] = [];
    history.setHistory(passedHistory);

    // Assert
    expect(history.getCurrentPosition()).toBe(-1);
    expect(history.getHistory()).toEqual([]);
    expect(history.getHistory()).not.toBe(passedHistory);
    expect(history.getCurrent()).toBeNull();
  });

  it("updates the history correctly if the new history is not empty and sets the current position to the last item in the history", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);
    const document4 = createEditorDocument(SAMPLE_BLOCK7, SAMPLE_BLOCK8);

    // Act
    const passedHistory: string[] = [
      document2.toJSON(),
      document3.toJSON(),
      document4.toJSON(),
    ];

    history.setHistory(passedHistory);

    // Assert
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getHistory()).toEqual(passedHistory);
    expect(history["history"]).not.toBe(passedHistory);
    expect(history.getCurrent()).toBe(document4.toJSON());
  });

  test("set history together with mutating it", () => {
    // Arrange
    const { history, document } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    // Act
    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Assert
    expect(history.getHistory()).toEqual([
      document.toJSON(),
      document2.toJSON(),
      document3.toJSON(),
    ]);

    expect(history.getCurrent()).toBe(document3.toJSON());
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getSize()).toBe(3);

    // Act
    history.undo();

    // Assert
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(3);

    // Act
    const passedHistory1: string[] = [document.toJSON(), document3.toJSON()];
    history.setHistory(passedHistory1);

    // Assert
    expect(history.getCurrent()).toBe(document3.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(history.getHistory()).toEqual(passedHistory1);

    // Act
    history.add(document2.toJSON());

    // Assert
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getSize()).toBe(3);
    expect(history.getHistory()).toEqual([
      document.toJSON(),
      document3.toJSON(),
      document2.toJSON(),
    ]);

    // Act
    const passedHistory2: string[] = [];
    history.setHistory(passedHistory2);

    // Assert
    expect(history.getCurrentPosition()).toBe(-1);
    expect(history.getHistory()).toEqual([]);
    expect(history.getHistory()).not.toBe(passedHistory2);
    expect(history.getCurrent()).toBeNull();
  });
});

describe("getCurrentPosition()", () => {
  it("returns the current position in history", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    const currentPosition = history.getCurrentPosition();

    // Assert
    expect(currentPosition).toBe(0);
  });

  it("returns the current position correctly in history after undo() and redo()", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Act

    // Assert
    expect(history.getCurrentPosition()).toBe(2);

    // Act
    history.undo();

    // Assert
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    history.redo();

    // Assert
    expect(history.getCurrentPosition()).toBe(2);

    // Act
    history.redo();

    // Assert
    expect(history.getCurrentPosition()).toBe(2);
  });

  it("returns -1 if the history is empty", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    history.clear();

    // Assert
    expect(history.getCurrentPosition()).toBe(-1);
  });

  it("returns the current position correctly after jumpTo()", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());
    history.add(document3.toJSON());

    // Act
    history.jumpTo(0);

    // Assert
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    history.jumpTo(1);
    expect(history.getCurrentPosition()).toBe(1);
  });

  it("returns the current position correctly even after undo(), add() and redo()", () => {
    // Arrange
    const { history } = createHistory();
    const document2 = createEditorDocument(SAMPLE_BLOCK3, SAMPLE_BLOCK4);
    const document3 = createEditorDocument(SAMPLE_BLOCK5, SAMPLE_BLOCK6);

    history.add(document2.toJSON());

    // Act
    history.undo();

    // Assert
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    history.add(document3.toJSON());

    // Assert
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    history.undo();

    // Assert
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    history.redo();

    // Assert
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    history.undo();
    expect(history.getCurrentPosition()).toBe(0);
  });
});

describe("getLimit()", () => {
  it("returns default limit if no limit is set passed through the constructor", () => {
    // Arrange
    const { history } = createHistory();

    // Act
    const limit = history.getLimit();

    // Assert
    expect(limit).toBe(DOCUMENT_HISTORY_RECORDS_LIMIT);
  });

  test.each([10, 20, 30, 40, 50])(
    "returns the limit %s if it is set passed through the constructor",
    limit => {
      // Arrange
      const { history } = createHistory({ limit });

      // Act
      const currentLimit = history.getLimit();

      // Assert
      expect(currentLimit).toBe(limit);
    },
  );
});

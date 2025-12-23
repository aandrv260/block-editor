import {
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
} from "../../document/utils/document-test.utils";
import { createEditorDocument, createHistory } from "./DocumentHistory-test.utils";

describe("DocumentHistory integration", () => {
  test("a whole user flow works properly when limit is set to 1", () => {
    // Arrange
    const { document, history } = createHistory({ limit: 1 });

    // Assert correct initial state
    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);

    // Act
    const document2 = createEditorDocument(SAMPLE_BLOCK3);
    history.add(document2.toJSON());

    // Assert `document2` json replaces `document` json in the history
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(1);
    expect(history.getHistory()).toStrictEqual([document2.toJSON()]);

    // Undo to test it doesn't break the state
    const undo1Current = history.undo();

    // Assert correct state
    expect(undo1Current).toBeNull();
    expect(history.getHistory()).toEqual([document2.toJSON()]);
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);

    // Redo to test it doesn't break the state
    const redo1Current = history.redo();

    // Assert correct state
    expect(redo1Current).toBeNull();
    expect(history.getHistory()).toEqual([document2.toJSON()]);
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);

    // Clear
    history.clear();

    // Assert
    expect(history.getHistory()).toEqual([]);
    expect(history.getCurrent()).toBeNull();
    expect(history.getSize()).toBe(0);
    expect(history.getCurrentPosition()).toBe(-1);

    // Add an item
    history.add(document2.toJSON());

    // Assert
    expect(history.getHistory()).toEqual([document2.toJSON()]);
    expect(history.getCurrent()).toBe(document2.toJSON());
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);

    // Add another item
    history.add(document.toJSON());

    // Assert
    expect(history.getHistory()).toEqual([document.toJSON()]);
    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);
  });

  test("a whole user flow works properly when limit is set to 1", () => {
    // Arrange
    const { document, history } = createHistory({ limit: 3 });
    const documentJSON = document.toJSON();

    const document2 = createEditorDocument(SAMPLE_BLOCK3);
    const document2JSON = document2.toJSON();

    const document3 = createEditorDocument(SAMPLE_BLOCK4);
    const document3JSON = document3.toJSON();

    const document4 = createEditorDocument(SAMPLE_BLOCK5);
    const document4JSON = document4.toJSON();

    // Assert correct initial state
    expect(history.getHistory()).toStrictEqual([documentJSON]);
    expect(history.getCurrent()).toBe(documentJSON);
    expect(history.getSize()).toBe(1);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getLimit()).toBe(3);

    // Add an item
    history.add(document2.toJSON());

    // Assert correct state
    expect(history.getHistory()).toStrictEqual([documentJSON, document2JSON]);

    expect(history.getCurrent()).toBe(document2JSON);
    expect(history.getSize()).toBe(2);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getLimit()).toBe(3);

    // Add another one
    history.add(document3JSON);

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(history.getCurrent()).toBe(document3JSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getLimit()).toBe(3);

    // Undo first time
    const undo1Result = history.undo();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(undo1Result).toBe(document2JSON);
    expect(history.getCurrent()).toBe(document2JSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getLimit()).toBe(3);

    // Undo second time
    const undo2Result = history.undo();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(undo2Result).toBe(documentJSON);
    expect(history.getCurrent()).toBe(documentJSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getLimit()).toBe(3);

    // Undo third time
    const undo3Result = history.undo();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(undo3Result).toBeNull();
    expect(history.getCurrent()).toBe(documentJSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getLimit()).toBe(3);

    // Redo first time
    const redo1Result = history.redo();

    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(redo1Result).toBe(document2JSON);
    expect(history.getCurrent()).toBe(document2JSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getLimit()).toBe(3);

    // Redo second time
    const redo2Result = history.redo();

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(redo2Result).toBe(document3JSON);
    expect(history.getCurrent()).toBe(document3JSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getLimit()).toBe(3);

    // Jump to first item
    const jumpTo1Result = history.jumpTo(0);

    // Assert
    expect(history.getHistory()).toStrictEqual([
      documentJSON,
      document2JSON,
      document3JSON,
    ]);

    expect(jumpTo1Result).toBe(documentJSON);
    expect(history.getCurrent()).toBe(documentJSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getLimit()).toBe(3);

    // Add a 4th item
    history.add(document4JSON);

    // Assert
    expect(history.getHistory()).toStrictEqual([documentJSON, document4JSON]);

    expect(history.getCurrent()).toBe(document4JSON);
    expect(history.getSize()).toBe(2);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getLimit()).toBe(3);

    // Jump to the current index
    const jumpTo2Result = history.jumpTo(1);

    // Assert
    expect(history.getHistory()).toStrictEqual([documentJSON, document4JSON]);

    expect(jumpTo2Result).toBeNull(); // Nothing happened because I jumped to the current index.
    expect(history.getCurrent()).toBe(document4JSON);
    expect(history.getSize()).toBe(2);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getLimit()).toBe(3);

    // Add 2 items
    history.add(document3JSON);
    history.add(document2JSON);

    // Assert
    expect(history.getHistory()).toStrictEqual([
      document4JSON,
      document3JSON,
      document2JSON,
    ]);

    expect(history.getCurrent()).toBe(document2JSON);
    expect(history.getSize()).toBe(3);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getLimit()).toBe(3);
  });
});

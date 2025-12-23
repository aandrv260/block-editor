import { createCommandCenter } from "./CommandCenter-test.utils";
import { insertBlock } from "../../actions/actions";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";

describe("CommandCenter insert block", () => {
  it("executes correctly the insert block command with `before` strategy based on the insert block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();
    const insertBlockEventCallback = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:insert", insertBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      insertBlock({
        targetId: TOGGLE_LIST2_BLOCK.id,
        strategy: "before",
        newBlock: SAMPLE_BLOCK4,
      }),
    );

    const DOCUMENT_JSON_AFTER_INSERT1 = document.toJSON();

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
      history: history.getHistory(),
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
                id: SAMPLE_BLOCK4.id,
              }),

              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [],
              }),
            ],
          }),
        ],
      }),
    );

    expect(insertBlockEventCallback).toHaveBeenCalledWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK4.id,
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "before",
    });

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("executes correctly the insert block command with `after` strategy based on the insert block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();
    const insertBlockEventCallback = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:insert", insertBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      insertBlock({
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "after",
        newBlock: SAMPLE_BLOCK4,
      }),
    );

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
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
            ],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),
        ],
      }),
    );

    expect(insertBlockEventCallback).toHaveBeenCalledWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK4.id,
      targetId: TOGGLE_LIST1_BLOCK.id,
      strategy: "after",
    });

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });
});

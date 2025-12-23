import { createCommandCenter } from "./CommandCenter-test.utils";
import { moveBlock } from "../../actions/actions";
import {
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST1_BLOCK,
  assertTreeIntegrity,
} from "../../document/utils/document-test.utils";

describe("CommandCenter move block", () => {
  it("executes correctly the move block command with `append` strategy based on the move block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();

    const onPersist = vi.fn();
    const moveBlockEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:move", moveBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      moveBlock({
        blockId: TOGGLE_LIST2_BLOCK.id,
        targetId: document.ROOT_ID,
        strategy: "append",
      }),
    );

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:move",
    });

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "block:move",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    expect(moveBlockEventCallback).toHaveBeenCalledWith({
      type: "block:move",
      blockId: TOGGLE_LIST2_BLOCK.id,
      targetId: document.ROOT_ID,
      strategy: "append",
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

  it("executes correctly the move block command with `before` strategy based on the move block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();
    const moveBlockEventCallback = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:move", moveBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      moveBlock({
        blockId: TOGGLE_LIST2_BLOCK.id,
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "before",
      }),
    );

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:move",
    });

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "block:move",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    expect(moveBlockEventCallback).toHaveBeenCalledWith({
      type: "block:move",
      blockId: TOGGLE_LIST2_BLOCK.id,
      targetId: TOGGLE_LIST1_BLOCK.id,
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

  it("executes correctly the move block command with `after` strategy based on the move block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();

    const moveBlockEventCallback = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:move", moveBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      moveBlock({
        blockId: TOGGLE_LIST2_BLOCK.id,
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "after",
      }),
    );

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:move",
    });

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "block:move",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [],
          }),
        ],
      }),
    );

    expect(moveBlockEventCallback).toHaveBeenCalledWith({
      type: "block:move",
      blockId: TOGGLE_LIST2_BLOCK.id,
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

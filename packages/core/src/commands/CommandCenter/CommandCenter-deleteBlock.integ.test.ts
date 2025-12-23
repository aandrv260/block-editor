import {
  assertTreeIntegrity,
  TOGGLE_LIST1_BLOCK,
} from "../../document/utils/document-test.utils";
import { createCommandCenter } from "./CommandCenter-test.utils";
import { deleteBlock } from "../../actions/actions";

describe("CommandCenter delete block", () => {
  it("executes the delete block command based on the delete block action input", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      commandCenter,
      assertInitialDefaultDocumentStructure,
      INITIAL_HISTORY_DOC_JSON,
    } = createCommandCenter();

    const deleteBlockEventCallback = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:delete", deleteBlockEventCallback);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.processAction(
      deleteBlock({
        blockId: TOGGLE_LIST1_BLOCK.id,
      }),
    );

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "block:delete",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:delete",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [],
      }),
    );

    expect(deleteBlockEventCallback).toHaveBeenCalledWith({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
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

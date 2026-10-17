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
    const onEditorChange = vi.fn();

    eventBus.on("block:delete", deleteBlockEventCallback);
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

  it("records no history and emits no events when the command throws", () => {
    // Arrange
    const { commandCenter, document, history, eventBus, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onDelete = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:delete", onDelete);
    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    expect(() =>
      commandCenter.processAction(deleteBlock({ blockId: "not_existing_block" })),
    ).toThrowError("The block you're trying to delete does not exist!");

    expect(onDelete).not.toHaveBeenCalled();
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it("emits the command event after the history is recorded", () => {
    // Arrange
    const { commandCenter, document, history, eventBus } = createCommandCenter();

    let currentRecordWhenEmitted: string | null = null;

    eventBus.on("block:delete", () => {
      currentRecordWhenEmitted = history.getCurrent();
    });

    // Act
    commandCenter.processAction(deleteBlock({ blockId: TOGGLE_LIST1_BLOCK.id }));

    // Assert
    expect(currentRecordWhenEmitted).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
  });
});

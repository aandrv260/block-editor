import {
  assertTreeIntegrity,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import { createDeleteBlockEvent } from "../../events/editor-event-bus/editorEvent.emits";
import { EventBus } from "../../events/event-bus/EventBus";
import { DocumentHistory } from "../../history/DocumentHistory";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockToDeleteNotFoundError } from "../errors/delete-block/BlockToDeleteNotFoundError";
import type { CommandContext } from "../executors/commandExecutors.models";
import { DEFAULT_COMMANDS } from "../executors/defaultCommands";
import { createTestDocument } from "../executors/utils/commandExecutors-test.utils";
import { CommandCenter } from "./CommandCenter";
import {
  createCommandCenter,
  DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS,
} from "./CommandCenter-test.utils";

const deleteFirstBlockCommand = ({ document }: CommandContext<void>) => {
  const firstBlockId = document.getRoot().children[0].id;

  document.remove(firstBlockId);

  return createDeleteBlockEvent({ blockId: firstBlockId });
};

const COMMANDS_WITH_CUSTOM_COMMAND = {
  ...DEFAULT_COMMANDS,
  "test:delete-first-block": deleteFirstBlockCommand,
};

const createCommandCenterWithCustomCommand = () => {
  const eventBus: EditorEventBus = new EventBus();
  const document = createTestDocument(DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS);

  const history = new DocumentHistory({
    initialDocumentJSON: document.toJSON(),
  });

  const commandCenter = new CommandCenter({
    document,
    eventBus,
    history,
    commands: COMMANDS_WITH_CUSTOM_COMMAND,
  });

  return {
    commandCenter,
    document,
    eventBus,
    history,
    INITIAL_HISTORY_DOC_JSON: document.toJSON(),
  };
};

describe("CommandCenter execute", () => {
  it("executes the registered command, records one history entry and emits its events", () => {
    // Arrange
    const {
      commandCenter,
      document,
      eventBus,
      history,
      INITIAL_HISTORY_DOC_JSON,
      assertInitialDefaultDocumentStructure,
    } = createCommandCenter();

    const onInsert = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:insert", onInsert);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "after",
      newBlock: SAMPLE_BLOCK3,
    });

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[0]?.children?.[1],
    );

    expect(onInsert).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK3.id,
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "after",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("executes a custom command without a payload from its own registry", () => {
    // Arrange
    const { commandCenter, document, eventBus, history, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenterWithCustomCommand();

    const onDelete = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:delete", onDelete);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("test:delete-first-block");

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();

    expect(onDelete).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ triggerAction: "test:delete-first-block" }),
    );

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("clears the history before recording it when the document is swapped with clearHistory", () => {
    // Arrange
    const { commandCenter, document, eventBus, history } = createCommandCenter();
    const documentToSwapWith = createTestDocument([["root", SAMPLE_BLOCK4]]);
    const onSwap = vi.fn();

    eventBus.on("document:swap", onSwap);

    commandCenter.execute("block:insert", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "after",
      newBlock: SAMPLE_BLOCK3,
    });

    // Assert
    expect(history.getSize()).toBe(2);

    // Act
    commandCenter.execute("document:swap", {
      element: documentToSwapWith.toJSON(),
      clearHistory: true,
    });

    // Assert
    expect(document.toJSON()).toBe(documentToSwapWith.toJSON());
    expect(history.getHistory()).toStrictEqual([documentToSwapWith.toJSON()]);
    expect(history.getCurrentPosition()).toBe(0);

    expect(onSwap).toHaveBeenCalledExactlyOnceWith({
      type: "document:swap",
      element: documentToSwapWith.toJSON(),
      historyCleared: true,
    });

    assertTreeIntegrity(document);
  });

  it("records no history and emits no events when the command throws", () => {
    // Arrange
    const { commandCenter, document, eventBus, history, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onDelete = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:delete", onDelete);
    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () => commandCenter.execute("block:delete", { blockId: "not_existing_block" }),
      {
        ExpectedErrorClass: BlockToDeleteNotFoundError,
        expectedCode: "COMMAND:BLOCK_TO_DELETE_NOT_FOUND",
        expectedMessage: "The block you're trying to delete does not exist!",
        expectedContext: { blockId: "not_existing_block" },
      },
    );

    expect(onDelete).not.toHaveBeenCalled();
    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });
});

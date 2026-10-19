import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import type {
  EditorEvent,
  EditorEventBus,
} from "../../events/editor-event-bus/editorEvent.models";
import { createEvent } from "../../events/editor-event-bus/createEvent";
import { EventBus } from "../../events/event-bus/EventBus";
import { DocumentHistory } from "../../history/DocumentHistory";
import { DEFAULT_HISTORY_GROUP_DELAY } from "../../history/HistoryManager/HistoryManager.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockToDeleteNotFoundError } from "../errors/delete-block/BlockToDeleteNotFoundError";
import type {
  CommandContext,
  CommandResult,
} from "../executors/commandExecutors.models";
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

  return createEvent("block:delete", { blockId: firstBlockId });
};

const insertAfterFirstBlockAndDeleteItCommand = ({
  document,
}: CommandContext<void>): CommandResult => {
  const firstBlockId = document.getRoot().children[0].id;

  document.insertAfter(firstBlockId, SAMPLE_BLOCK3);
  document.remove(firstBlockId);

  return [
    createEvent("block:insert", {
      blockId: SAMPLE_BLOCK3.id,
      targetId: firstBlockId,
      strategy: "after",
    }),
    createEvent("block:delete", { blockId: firstBlockId }),
  ];
};

const deleteFirstBlockAndSwapDocumentCommand = ({
  document,
}: CommandContext<void>): CommandResult => {
  const firstBlockId = document.getRoot().children[0].id;
  const element = createTestDocument([["root", SAMPLE_BLOCK4]]).toJSON();

  document.remove(firstBlockId);
  document.swap(element);

  return [
    createEvent("block:delete", { blockId: firstBlockId }),
    createEvent("document:swap", { element, historyCleared: true }),
  ];
};

const appendBlockAndFailCommand = ({ document }: CommandContext<void>) => {
  document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

  throw new Error("The command failed after changing the document!");
};

const COMMANDS_WITH_CUSTOM_COMMAND = {
  ...DEFAULT_COMMANDS,
  deleteFirstBlock: deleteFirstBlockCommand,
  insertAfterFirstBlockAndDeleteIt: insertAfterFirstBlockAndDeleteItCommand,
  deleteFirstBlockAndSwapDocument: deleteFirstBlockAndSwapDocumentCommand,
  appendBlockAndFail: appendBlockAndFailCommand,
};

const createCommandCenterWithCustomCommand = () => {
  const eventBus: EditorEventBus = new EventBus();
  const document = createTestDocument(DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS);

  const history = new DocumentHistory({
    initialDocumentJSON: document.toJSON(),
  });

  const commandCenter = new CommandCenter<typeof COMMANDS_WITH_CUSTOM_COMMAND>({
    document,
    eventBus,
    history,
    commands: COMMANDS_WITH_CUSTOM_COMMAND,
    historyGroupDelay: DEFAULT_HISTORY_GROUP_DELAY,
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
    commandCenter.execute("insertBlock", {
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
      trigger: "insertBlock",
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
    commandCenter.execute("deleteFirstBlock");

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();

    expect(onDelete).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: "deleteFirstBlock" }),
    );

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("emits every event a command returns in order, then records one history entry and emits one change event", () => {
    // Arrange
    const { commandCenter, document, eventBus, history, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenterWithCustomCommand();

    const emittedEvents: EditorEvent[] = [];
    const onEvent = (event: EditorEvent) => emittedEvents.push(event);

    eventBus.on("block:insert", onEvent);
    eventBus.on("block:delete", onEvent);
    eventBus.on("editor:change", onEvent);

    // Act
    commandCenter.execute("insertAfterFirstBlockAndDeleteIt");

    // Assert
    expect(emittedEvents).toStrictEqual([
      {
        type: "block:insert",
        blockId: SAMPLE_BLOCK3.id,
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "after",
      },
      { type: "block:delete", blockId: TOGGLE_LIST1_BLOCK.id },
      {
        type: "editor:change",
        documentJSON: document.toJSON(),
        history: history.getHistory(),
        currentPositionInHistory: 1,
        root: document.getRoot(),
        trigger: "insertAfterFirstBlockAndDeleteIt",
      },
    ]);

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(document.getRoot().children[0]);
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("clears the history when one of the returned events is a document swap with a cleared history", () => {
    // Arrange
    const { commandCenter, document, history } =
      createCommandCenterWithCustomCommand();

    commandCenter.execute("insertBlock", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "after",
      newBlock: SAMPLE_BLOCK3,
    });

    // Assert
    expect(history.getSize()).toBe(2);

    // Act
    commandCenter.execute("deleteFirstBlockAndSwapDocument");

    // Assert
    expect(history.getHistory()).toStrictEqual([document.toJSON()]);
    expect(history.getCurrentPosition()).toBe(0);
  });

  it("clears the history before recording it when the document is swapped with clearHistory", () => {
    // Arrange
    const { commandCenter, document, eventBus, history } = createCommandCenter();
    const documentToSwapWith = createTestDocument([["root", SAMPLE_BLOCK4]]);
    const onSwap = vi.fn();

    eventBus.on("document:swap", onSwap);

    commandCenter.execute("insertBlock", {
      targetId: TOGGLE_LIST2_BLOCK.id,
      strategy: "after",
      newBlock: SAMPLE_BLOCK3,
    });

    // Assert
    expect(history.getSize()).toBe(2);

    // Act
    commandCenter.execute("swapDocument", {
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
      () => commandCenter.execute("deleteBlock", { blockId: "not_existing_block" }),
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

  it("rolls back the changes of a command that fails after it already changed the document", () => {
    // Arrange
    const { commandCenter, document, eventBus, history, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenterWithCustomCommand();

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    expect(() => commandCenter.execute("appendBlockAndFail")).toThrow(
      "The command failed after changing the document!",
    );

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: "rollback" }),
    );

    assertTreeIntegrity(document);
  });

  it("turns the document into JSON only once per command", () => {
    // Arrange
    const { commandCenter, document } = createCommandCenter();
    const toJSON = vi.spyOn(document, "toJSON");

    // Act
    commandCenter.execute("deleteBlock", { blockId: TOGGLE_LIST2_BLOCK.id });

    // Assert
    expect(toJSON).toHaveBeenCalledOnce();
  });
});

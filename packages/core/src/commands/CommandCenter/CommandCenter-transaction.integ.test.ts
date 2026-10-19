import { BlockToDeleteNotFoundError } from "../errors/delete-block/BlockToDeleteNotFoundError";
import { AsyncTransactionError } from "../errors/transaction/AsyncTransactionError";
import { TransactionClosedError } from "../errors/transaction/TransactionClosedError";
import { TransactionInProgressError } from "../errors/transaction/TransactionInProgressError";
import type { DefaultCommands } from "../executors/defaultCommands";
import type { Transaction } from "../transaction/transaction.models";
import { CommandCenter } from "./CommandCenter";
import { createCommandCenter } from "./CommandCenter-test.utils";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK3,
  TOGGLE_LIST1_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";

const runTransactionWithoutTypes = (
  commandCenter: CommandCenter<DefaultCommands>,
  callback: (transaction: Transaction<DefaultCommands>) => unknown,
) =>
  (
    commandCenter as unknown as {
      transaction: (
        callback: (transaction: Transaction<DefaultCommands>) => unknown,
      ) => void;
    }
  ).transaction(callback);

describe("CommandCenter transaction", () => {
  it("commits every command as one history record and emits their events in order with one change event", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onBlockEvent = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:delete", onBlockEvent);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.transaction(transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.execute("deleteBlock", { blockId: TOGGLE_LIST1_BLOCK.id });
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      { ...SAMPLE_BLOCK1, parentId: document.ROOT_ID },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: SAMPLE_BLOCK1.id,
          targetId: document.ROOT_ID,
          strategy: "append",
        },
      ],
      [{ type: "block:delete", blockId: TOGGLE_LIST1_BLOCK.id }],
    ]);

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "transaction",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("lets a command see the changes of the commands before it", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter();

    // Act
    commandCenter.transaction(transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.execute("insertText", {
        blockId: SAMPLE_BLOCK1.id,
        offset: 9,
        text: "!",
      });
    });

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)?.data).toStrictEqual({
      content: [{ text: "some_text!", marks: [] }],
      level: 1,
    });
  });

  it("rolls back every change, stops the callback and records nothing when the transaction is aborted", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onBlockEvent = vi.fn();
    const onEditorChange = vi.fn();
    let isCodeAfterAbortReached = false;

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.transaction(transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.abort();
      isCodeAfterAbortReached = true;
    });

    // Assert
    expect(isCodeAfterAbortReached).toBe(false);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(onBlockEvent).not.toHaveBeenCalled();

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: INITIAL_HISTORY_DOC_JSON,
      history: [INITIAL_HISTORY_DOC_JSON],
      currentPositionInHistory: 0,
      root: document.getRoot(),
      trigger: "rollback",
    });

    assertTreeIntegrity(document);
  });

  it("rolls back an aborted transaction even when the callback catches the abort", () => {
    // Arrange
    const { document, history, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    // Act
    commandCenter.transaction(transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      try {
        transaction.abort();
      } catch {
        return;
      }
    });

    // Assert
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
  });

  it("does not emit a rollback change when nothing changed before the abort", () => {
    // Arrange
    const { eventBus, commandCenter } = createCommandCenter();
    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.transaction(transaction => {
      transaction.abort();
    });

    // Assert
    expect(onEditorChange).not.toHaveBeenCalled();
  });

  it("records nothing and emits nothing when no command runs", () => {
    // Arrange
    const { history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.transaction(() => {});

    // Assert
    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
  });

  it("rolls back every change and throws the error when a command fails", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onBlockEvent = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:delete", onBlockEvent);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.transaction(transaction => {
          transaction.execute("insertBlock", {
            targetId: document.ROOT_ID,
            strategy: "append",
            newBlock: SAMPLE_BLOCK1,
          });

          transaction.execute("deleteBlock", { blockId: "not_existing_block" });
        }),
      {
        ExpectedErrorClass: BlockToDeleteNotFoundError,
        expectedCode: "COMMAND:BLOCK_TO_DELETE_NOT_FOUND",
        expectedMessage: "The block you're trying to delete does not exist!",
        expectedContext: { blockId: "not_existing_block" },
      },
    );

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(onBlockEvent).not.toHaveBeenCalled();
    assertTreeIntegrity(document);
  });

  it("rolls back every change and throws the error when the callback throws", () => {
    // Arrange
    const { document, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();
    const error = new Error("The callback failed!");

    // Act and assert
    expect(() =>
      commandCenter.transaction(transaction => {
        transaction.execute("insertBlock", {
          targetId: document.ROOT_ID,
          strategy: "append",
          newBlock: SAMPLE_BLOCK1,
        });

        throw error;
      }),
    ).toThrow(error);

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it("rolls back and throws an error when the callback returns a promise", async () => {
    // Arrange
    const { document, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();
    let pendingCallback: Promise<void> | null = null;

    const asyncCallback = async (transaction: Transaction<DefaultCommands>) => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      await Promise.resolve();

      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK3,
      });
    };

    // Act and assert
    assertEngineError(
      () =>
        runTransactionWithoutTypes(commandCenter, transaction => {
          pendingCallback = asyncCallback(transaction);

          return pendingCallback;
        }),
      {
        ExpectedErrorClass: AsyncTransactionError,
        expectedCode: "COMMAND:ASYNC_TRANSACTION",
        expectedMessage:
          "A transaction must be synchronous and cannot return a promise!",
      },
    );

    await expect(pendingCallback).rejects.toThrow(TransactionClosedError);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it.each<[string, (commandCenter: CommandCenter<DefaultCommands>) => void]>([
    [
      "deleteBlock",
      commandCenter =>
        commandCenter.execute("deleteBlock", { blockId: TOGGLE_LIST1_BLOCK.id }),
    ],
    ["transaction", commandCenter => commandCenter.transaction(() => {})],
    ["undo", commandCenter => commandCenter.undo()],
    ["redo", commandCenter => commandCenter.redo()],
    ["jumpTo", commandCenter => commandCenter.jumpTo(0)],
    ["setHistory", commandCenter => commandCenter.setHistory([])],
  ])(
    "throws an error and rolls back when %s runs while a transaction is open",
    (operation, runOperation) => {
      // Arrange
      const { document, commandCenter, INITIAL_HISTORY_DOC_JSON } =
        createCommandCenter();

      // Act and assert
      assertEngineError(
        () =>
          commandCenter.transaction(transaction => {
            transaction.execute("insertBlock", {
              targetId: document.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK1,
            });

            runOperation(commandCenter);
          }),
        {
          ExpectedErrorClass: TransactionInProgressError,
          expectedCode: "COMMAND:TRANSACTION_IN_PROGRESS",
          expectedMessage: `You can't run "${operation}" while a transaction is open!`,
          expectedContext: { operation },
        },
      );

      expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    },
  );

  it("lets event handlers run commands after the transaction commits", () => {
    // Arrange
    const { document, history, eventBus, commandCenter } = createCommandCenter();

    eventBus.on("block:insert", event => {
      commandCenter.execute("deleteBlock", { blockId: event.blockId });
    });

    // Act
    commandCenter.transaction(transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });
    });

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(history.getSize()).toBe(3);
  });
});

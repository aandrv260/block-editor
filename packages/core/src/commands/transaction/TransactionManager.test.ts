import {
  SAMPLE_BLOCK1,
  TOGGLE_LIST1_BLOCK,
} from "../../document/utils/document-test.utils";
import { DocumentHistory } from "../../history/DocumentHistory";
import { BlockToDeleteNotFoundError } from "../errors/delete-block/BlockToDeleteNotFoundError";
import { AsyncTransactionError } from "../errors/transaction/AsyncTransactionError";
import { TransactionInProgressError } from "../errors/transaction/TransactionInProgressError";
import {
  DEFAULT_COMMANDS,
  type DefaultCommands,
} from "../executors/defaultCommands";
import { createTestDocument } from "../executors/utils/commandExecutors-test.utils";
import { EventBus } from "../../events/event-bus/EventBus";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import { ExtensionManager } from "../../extensions/ExtensionManager/ExtensionManager";
import type { Extension } from "../../extensions/models/extension.models";
import { TransactionManager } from "./TransactionManager";

const createTransactionManager = (extensions: Extension[] = []) => {
  const document = createTestDocument([["root", TOGGLE_LIST1_BLOCK]]);
  const initialDocumentJSON = document.toJSON();
  const history = new DocumentHistory({ initialDocumentJSON });
  const eventBus: EditorEventBus = new EventBus();

  const transactionManager = new TransactionManager<DefaultCommands>({
    document,
    history,
    commands: DEFAULT_COMMANDS,
    extensionManager: new ExtensionManager({ extensions, document, eventBus }),
  });

  return { transactionManager, document, initialDocumentJSON };
};

describe("TransactionManager", () => {
  it("returns the events of every command in order when the callback finishes", () => {
    // Arrange
    const { transactionManager, document } = createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.execute("deleteBlock", { blockId: TOGGLE_LIST1_BLOCK.id });
    });

    // Assert
    expect(result).toStrictEqual({
      status: "committed",
      events: [
        {
          type: "block:insert",
          blockId: SAMPLE_BLOCK1.id,
          targetId: document.ROOT_ID,
          strategy: "append",
        },
        { type: "block:delete", blockId: TOGGLE_LIST1_BLOCK.id },
      ],
    });
  });

  it("restores the document and reports it when the callback aborts after a change", () => {
    // Arrange
    const { transactionManager, document, initialDocumentJSON } =
      createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.abort();
    });

    // Assert
    expect(result).toStrictEqual({ status: "aborted", isDocumentRestored: true });
    expect(document.toJSON()).toBe(initialDocumentJSON);
  });

  it("does not restore the document when the callback aborts before any change", () => {
    // Arrange
    const { transactionManager } = createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", transaction => {
      transaction.abort();
    });

    // Assert
    expect(result).toStrictEqual({ status: "aborted", isDocumentRestored: false });
  });

  it("restores the document and returns the error when a command fails", () => {
    // Arrange
    const { transactionManager, document, initialDocumentJSON } =
      createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.execute("deleteBlock", { blockId: "not_existing_block" });
    });

    // Assert
    expect(result).toStrictEqual({
      status: "failed",
      error: expect.any(BlockToDeleteNotFoundError),
      isDocumentRestored: true,
    });

    expect(document.toJSON()).toBe(initialDocumentJSON);
  });

  it("fails with an async transaction error when the callback returns a promise", () => {
    // Arrange
    const { transactionManager } = createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", () => Promise.resolve());

    // Assert
    expect(result).toStrictEqual({
      status: "failed",
      error: expect.any(AsyncTransactionError),
      isDocumentRestored: false,
    });
  });

  it("fails with a transaction in progress error when a transaction runs inside another one", () => {
    // Arrange
    const { transactionManager } = createTransactionManager();

    // Act
    const result = transactionManager.run("transaction", () => {
      transactionManager.run("insertBlock", () => {});
    });

    // Assert
    expect(result).toStrictEqual({
      status: "failed",
      error: expect.any(TransactionInProgressError),
      isDocumentRestored: false,
    });
  });

  it("allows a new transaction after the previous one finished", () => {
    // Arrange
    const { transactionManager } = createTransactionManager();

    transactionManager.run("transaction", transaction => {
      transaction.abort();
    });

    // Act and assert
    expect(() => transactionManager.ensureNoOpenTransaction("undo")).not.toThrow();
  });

  it("runs the before commit hooks once with every command and event of the transaction", () => {
    // Arrange
    const beforeCommit = vi.fn();
    const { transactionManager, document } = createTransactionManager([
      { name: "FirstExtension", beforeCommit },
    ]);

    // Act
    transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      transaction.execute("deleteBlock", { blockId: TOGGLE_LIST1_BLOCK.id });
    });

    // Assert
    expect(beforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        commands: [
          {
            type: "insertBlock",
            payload: {
              targetId: document.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK1,
            },
          },
          { type: "deleteBlock", payload: { blockId: TOGGLE_LIST1_BLOCK.id } },
        ],
        events: [
          {
            type: "block:insert",
            blockId: SAMPLE_BLOCK1.id,
            targetId: document.ROOT_ID,
            strategy: "append",
          },
          { type: "block:delete", blockId: TOGGLE_LIST1_BLOCK.id },
        ],
      }),
    );
  });

  it("leaves a failed command out of the before commit commands when the callback catches its error", () => {
    // Arrange
    const beforeCommit = vi.fn();
    const { transactionManager, document } = createTransactionManager([
      { name: "FirstExtension", beforeCommit },
    ]);

    // Act
    transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      try {
        transaction.execute("deleteBlock", { blockId: "not_existing_block" });
      } catch {
        return;
      }
    });

    // Assert
    expect(beforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        commands: [
          {
            type: "insertBlock",
            payload: {
              targetId: document.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK1,
            },
          },
        ],
      }),
    );
  });

  it("does not run the before commit hooks when the callback aborts", () => {
    // Arrange
    const beforeCommit = vi.fn();
    const { transactionManager } = createTransactionManager([
      { name: "FirstExtension", beforeCommit },
    ]);

    // Act
    transactionManager.run("transaction", transaction => {
      try {
        transaction.abort();
      } catch {
        return;
      }
    });

    // Assert
    expect(beforeCommit).not.toHaveBeenCalled();
  });

  it("restores the document and reports an abort when a before commit hook aborts", () => {
    // Arrange
    const { transactionManager, document, initialDocumentJSON } =
      createTransactionManager([
        { name: "FirstExtension", beforeCommit: ({ abort }) => abort() },
      ]);

    // Act
    const result = transactionManager.run("transaction", transaction => {
      transaction.execute("insertBlock", {
        targetId: document.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });
    });

    // Assert
    expect(result).toStrictEqual({ status: "aborted", isDocumentRestored: true });
    expect(document.toJSON()).toBe(initialDocumentJSON);
  });
});

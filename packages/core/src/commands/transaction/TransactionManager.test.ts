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
import { TransactionManager } from "./TransactionManager";

const createTransactionManager = () => {
  const document = createTestDocument([["root", TOGGLE_LIST1_BLOCK]]);
  const initialDocumentJSON = document.toJSON();
  const history = new DocumentHistory({ initialDocumentJSON });

  const transactionManager = new TransactionManager<DefaultCommands>({
    document,
    history,
    commands: DEFAULT_COMMANDS,
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
});

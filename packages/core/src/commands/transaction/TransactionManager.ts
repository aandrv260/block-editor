import type { EditorDocument } from "../../document/EditorDocument";
import type { DocumentHistory } from "../../history/DocumentHistory";
import { AsyncTransactionError } from "../errors/transaction/AsyncTransactionError";
import { isTransactionAbortedError } from "../errors/transaction/TransactionAbortedError";
import { TransactionInProgressError } from "../errors/transaction/TransactionInProgressError";
import type { AnyCommands } from "../executors/commandExecutors.models";
import type { ExtensionManager } from "../../extensions/ExtensionManager/ExtensionManager";
import { EditorTransaction } from "./EditorTransaction";
import type { TransactionCallback, TransactionResult } from "./transaction.models";

interface TransactionManagerConfig {
  document: EditorDocument;
  history: DocumentHistory;
  commands: AnyCommands;
  extensionManager: ExtensionManager;
}

export class TransactionManager<TCommands extends AnyCommands> {
  private readonly document: EditorDocument;
  private readonly history: DocumentHistory;
  private readonly commands: AnyCommands;
  private readonly extensionManager: ExtensionManager;
  private activeTransaction: EditorTransaction<TCommands> | null = null;

  constructor({
    document,
    history,
    commands,
    extensionManager,
  }: TransactionManagerConfig) {
    this.document = document;
    this.history = history;
    this.commands = commands;
    this.extensionManager = extensionManager;
  }

  public run(
    operation: string,
    callback: TransactionCallback<TCommands, unknown>,
  ): TransactionResult {
    this.ensureNoOpenTransaction(operation);

    const snapshot = this.history.getCurrent() ?? this.document.toJSON();

    const transaction = new EditorTransaction({
      document: this.document,
      commands: this.commands,
      extensionManager: this.extensionManager,
      getActiveTransaction: () => this.activeTransaction,
    });

    this.activeTransaction = transaction;

    try {
      const result = callback(transaction);

      if (result instanceof Promise) {
        throw new AsyncTransactionError();
      }

      if (!transaction.isAborted()) {
        transaction.runBeforeCommit();
      }
    } catch (error) {
      this.activeTransaction = null;

      const isDocumentRestored = this.restoreDocument(snapshot);

      return isTransactionAbortedError(error)
        ? { status: "aborted", isDocumentRestored }
        : { status: "failed", error, isDocumentRestored };
    }

    this.activeTransaction = null;

    if (transaction.isAborted()) {
      return {
        status: "aborted",
        isDocumentRestored: this.restoreDocument(snapshot),
      };
    }

    return {
      status: "committed",
      events: transaction.getEvents(),
    };
  }

  public ensureNoOpenTransaction(operation: string): void {
    if (this.activeTransaction) {
      throw new TransactionInProgressError(operation);
    }
  }

  private restoreDocument(snapshot: string): boolean {
    if (this.document.toJSON() === snapshot) {
      return false;
    }

    this.document.swap(snapshot);
    return true;
  }
}

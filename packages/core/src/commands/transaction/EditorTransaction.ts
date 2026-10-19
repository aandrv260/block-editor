import type { EditorDocument } from "../../document/EditorDocument";
import type { CommandEvent } from "../../events/editor-event-bus/editorEvent.models";
import { toCommandEvents } from "../CommandCenter/CommandCenter.utils";
import { TransactionAbortedError } from "../errors/transaction/TransactionAbortedError";
import { TransactionClosedError } from "../errors/transaction/TransactionClosedError";
import { UnknownCommandError } from "../errors/unknown-command/UnknownCommandError";
import type {
  CommandArgsOf,
  CommandContext,
  CommandResult,
  Commands,
} from "../executors/commandExecutors.models";
import type { Transaction } from "./transaction.models";

interface EditorTransactionConfig<TCommands extends Commands> {
  document: EditorDocument;
  commands: TCommands;
  getActiveTransaction: () => EditorTransaction<TCommands> | null;
}

export class EditorTransaction<
  TCommands extends Commands,
> implements Transaction<TCommands> {
  private readonly document: EditorDocument;
  private readonly commands: TCommands;
  private readonly getActiveTransaction: () => EditorTransaction<TCommands> | null;
  private readonly events: CommandEvent[] = [];
  private aborted = false;

  constructor({
    document,
    commands,
    getActiveTransaction,
  }: EditorTransactionConfig<TCommands>) {
    this.document = document;
    this.commands = commands;
    this.getActiveTransaction = getActiveTransaction;
  }

  public execute<TType extends keyof TCommands & string>(
    type: TType,
    ...args: CommandArgsOf<TCommands[TType]>
  ): void {
    this.ensureIsActive();

    const command = this.getCommand(type);

    this.events.push(
      ...toCommandEvents(command({ payload: args[0], document: this.document })),
    );
  }

  public abort(): never {
    this.ensureIsActive();
    this.aborted = true;

    throw new TransactionAbortedError();
  }

  public getEvents(): CommandEvent[] {
    return this.events;
  }

  public isAborted(): boolean {
    return this.aborted;
  }

  private ensureIsActive(): void {
    if (this.getActiveTransaction() !== this) {
      throw new TransactionClosedError();
    }
  }

  private getCommand(
    type: string,
  ): (context: CommandContext<unknown>) => CommandResult {
    if (!Object.hasOwn(this.commands, type)) {
      throw new UnknownCommandError(type);
    }

    return this.commands[type] as (
      context: CommandContext<unknown>,
    ) => CommandResult;
  }
}

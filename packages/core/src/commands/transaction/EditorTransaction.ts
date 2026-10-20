import type { EditorDocument } from "../../document/EditorDocument";
import type {
  AnyCustomEvents,
  CommandEvent,
} from "../../events/editor-event-bus/editorEvent.models";
import { toCommandEvents } from "../CommandCenter/CommandCenter.utils";
import { TransactionAbortedError } from "../errors/transaction/TransactionAbortedError";
import { TransactionClosedError } from "../errors/transaction/TransactionClosedError";
import { UnknownCommandError } from "../errors/unknown-command/UnknownCommandError";
import type {
  AnyCommands,
  CommandArgsOf,
  CommandContext,
  CommandResult,
  ExecutableCommand,
} from "../executors/commandExecutors.models";
import { createCommandEvent } from "../../events/editor-event-bus/createCommandEvent";
import type { Transaction } from "./transaction.models";
import type { ExtensionManager } from "../../extensions/ExtensionManager/ExtensionManager";
import type {
  CommandSource,
  ExecutedCommand,
  ExtensionHookActions,
} from "../../extensions/models/extension.models";

interface EditorTransactionConfig<TCommands extends AnyCommands> {
  document: EditorDocument;
  commands: AnyCommands;
  extensionManager: ExtensionManager;
  getActiveTransaction: () => EditorTransaction<TCommands> | null;
}

export class EditorTransaction<
  TCommands extends AnyCommands,
> implements Transaction<TCommands> {
  private readonly document: EditorDocument;
  private readonly commands: AnyCommands;
  private readonly extensionManager: ExtensionManager;
  private readonly hookActions: ExtensionHookActions;
  private readonly getActiveTransaction: () => EditorTransaction<TCommands> | null;
  private readonly executedCommands: ExecutedCommand[] = [];
  private readonly events: CommandEvent<AnyCustomEvents>[] = [];
  private aborted = false;

  constructor({
    document,
    commands,
    extensionManager,
    getActiveTransaction,
  }: EditorTransactionConfig<TCommands>) {
    this.document = document;
    this.commands = commands;
    this.extensionManager = extensionManager;
    this.getActiveTransaction = getActiveTransaction;

    this.hookActions = {
      document,
      createExecute:
        source =>
        (type, ...args) =>
          this.executeCommand({ type, payload: args[0] }, source),
      abort: () => this.abort(),
    };
  }

  public execute<TType extends keyof TCommands & string>(
    type: TType,
    ...args: CommandArgsOf<TCommands[TType]>
  ): void {
    this.executeCommand({ type, payload: args[0] }, { type: "editor" });
  }

  public runBeforeCommit(): void {
    this.ensureIsActive();
    this.extensionManager.runBeforeCommit(
      this.executedCommands,
      this.events,
      this.hookActions,
    );
  }

  public abort(): never {
    this.ensureIsActive();
    this.aborted = true;

    throw new TransactionAbortedError();
  }

  public getEvents(): CommandEvent<AnyCustomEvents>[] {
    return this.events;
  }

  public isAborted(): boolean {
    return this.aborted;
  }

  private executeCommand(command: ExecutableCommand, source: CommandSource): void {
    this.ensureIsActive();

    this.extensionManager.runWithLoopGuard(() => {
      const finalCommand = this.extensionManager.runBeforeCommand(
        command,
        source,
        this.hookActions,
      );

      const events = this.runCommand(finalCommand);

      this.executedCommands.push({ ...finalCommand, source });
      this.events.push(...events);
      this.extensionManager.runAfterCommand(
        finalCommand,
        source,
        events,
        this.hookActions,
      );
    });
  }

  private runCommand({
    type,
    payload,
  }: ExecutableCommand): CommandEvent<AnyCustomEvents>[] {
    const command = this.getCommand(type);

    return toCommandEvents(
      command({
        payload,
        document: this.document,
        createEvent: createCommandEvent,
      }),
    );
  }

  private ensureIsActive(): void {
    if (this.getActiveTransaction() !== this) {
      throw new TransactionClosedError();
    }
  }

  private getCommand(
    type: string,
  ): (
    context: CommandContext<unknown, AnyCustomEvents>,
  ) => CommandResult<AnyCustomEvents> {
    if (!Object.hasOwn(this.commands, type)) {
      throw new UnknownCommandError(type);
    }

    return this.commands[type] as (
      context: CommandContext<unknown, AnyCustomEvents>,
    ) => CommandResult<AnyCustomEvents>;
  }
}

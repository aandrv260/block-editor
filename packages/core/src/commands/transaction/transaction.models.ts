import type { NotPromise } from "@/common/types/utility.types";
import type {
  AnyCustomEvents,
  CommandEvent,
} from "@/events/editor-event-bus/editorEvent.models";
import type {
  CommandArgsOf,
  AnyCommands,
} from "../executors/commandExecutors.models";

export type Transaction<TCommands extends AnyCommands> = {
  execute<TType extends keyof TCommands & string>(
    type: TType,
    ...args: CommandArgsOf<TCommands[TType]>
  ): void;

  abort(): never;
};

export type TransactionCallback<TCommands extends AnyCommands, TReturn> = (
  transaction: Transaction<TCommands>,
) => NotPromise<TReturn>;

export type TransactionResult =
  | { status: "committed"; events: CommandEvent<AnyCustomEvents>[] }
  | { status: "aborted"; isDocumentRestored: boolean }
  | { status: "failed"; error: unknown; isDocumentRestored: boolean };

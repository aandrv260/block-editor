export type ErrorContext = Record<string, unknown> | void;
export type ErrorNamespace = "document" | "history" | "event" | "command";

export abstract class EngineError<TContext extends ErrorContext> extends Error {
  public readonly code: string;
  public readonly context: TContext;
  public readonly namespace: ErrorNamespace;

  constructor(
    code: string,
    message: string,
    namespace: ErrorNamespace,
    ...[context]: TContext extends void ? [] : [TContext]
  ) {
    super(message);
    this.code = code;
    this.namespace = namespace;
    this.context = context as TContext;
  }
}

// TODO: Since the engine will support web workers by default (because it's pure and can run anywhere), I need to consider if there are enough good arguments to optimize the error handling for web workers. Because web workers are isolated and the prototype chain gets lost. So if I decide to support them, `instanceof` won't be enough for the utils below. And I must expose a reliable public API so it's easy for the users to handle errors with type guards.

export const isEngineError = (error: unknown): error is EngineError<void> => {
  return error instanceof EngineError;
};

export const isDocumentError = (error: unknown): error is EngineError<void> => {
  return error instanceof EngineError && error.namespace === "document";
};

export const isHistoryError = (error: unknown): error is EngineError<void> => {
  return error instanceof EngineError && error.namespace === "history";
};

export const isEventError = (error: unknown): error is EngineError<void> => {
  return error instanceof EngineError && error.namespace === "event";
};

export const isCommandError = (error: unknown): error is EngineError<void> => {
  return error instanceof EngineError && error.namespace === "command";
};

export const DOCUMENT_ERROR_NAMESPACE = "document";
export const HISTORY_ERROR_NAMESPACE = "history";
export const EVENT_ERROR_NAMESPACE = "event";
export const COMMAND_ERROR_NAMESPACE = "command";

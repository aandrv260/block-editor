import { EngineError, EVENT_ERROR_NAMESPACE } from "../../errors/EngineError";
import { EventErrorCodes } from "./EventErrorCodes";

export class DuplicateEventHandlerError extends EngineError<{ event: string }> {
  constructor(event: string) {
    super(
      EventErrorCodes.DUPLICATE_EVENT_HANDLER,
      "You cannot add the same callback multiple times for the same event!",
      EVENT_ERROR_NAMESPACE,
      { event },
    );
  }
}

export const isDuplicateEventHandlerError = (
  error: unknown,
): error is DuplicateEventHandlerError => {
  return error instanceof DuplicateEventHandlerError;
};

import { COMMAND_ERROR_NAMESPACE, EngineError } from "../../../errors/EngineError";
import { CommandErrorCodes } from "../CommandErrorCodes";

export class InvalidTextRangeError extends EngineError<{
  blockId: string;
  from: number;
  to: number;
  textLength: number;
}> {
  constructor(blockId: string, from: number, to: number, textLength: number) {
    super(
      CommandErrorCodes.INVALID_TEXT_RANGE,
      "The text range does not fit inside the block's text!",
      COMMAND_ERROR_NAMESPACE,
      { blockId, from, to, textLength },
    );
  }
}

export const isInvalidTextRangeError = (
  error: unknown,
): error is InvalidTextRangeError => {
  return error instanceof InvalidTextRangeError;
};

import type { EngineError } from "../EngineError";
import type { ErrorCode } from "../ErrorCodes";

type ExtractEngineErrorContext<T> = T extends EngineError<infer M> ? M : never;

type EngineErrorConstructor<T extends EngineError<any>> = abstract new (
  ...args: any[]
) => T;

type AssertEngineErrorOptionsBase<TErrorClass extends EngineError<any>> = {
  ExpectedErrorClass: EngineErrorConstructor<TErrorClass>;
  expectedCode: ErrorCode;
  expectedMessage: string;
};

type AssertEngineErrorOptions<TErrorClass extends EngineError<any>> =
  ExtractEngineErrorContext<TErrorClass> extends void
    ? AssertEngineErrorOptionsBase<TErrorClass> & {
        expectedContext?: void;
      }
    : AssertEngineErrorOptionsBase<TErrorClass> & {
        expectedContext: ExtractEngineErrorContext<TErrorClass>;
      };

export const assertEngineError = <TErrorClass extends EngineError<any>>(
  fn: () => unknown,
  {
    ExpectedErrorClass,
    expectedCode,
    expectedMessage,
    expectedContext,
  }: AssertEngineErrorOptions<TErrorClass>,
): void => {
  try {
    fn();
    throw new Error("Expected engine error, but nothing was thrown!");
  } catch (error) {
    expect(error).toBeInstanceOf(ExpectedErrorClass);

    const engineError = error as TErrorClass;

    expect(engineError.code).toBe(expectedCode);
    expect(engineError.message).toBe(expectedMessage);

    if (expectedContext) {
      expect(engineError.context).toEqual(expectedContext);
    }
  }
};

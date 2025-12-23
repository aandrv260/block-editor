import type { ErrorNamespace } from "./EngineError";
import { DocumentErrorCode } from "../document/errors/DocumentErrorCode";

export const ErrorCodes = {
  document: DocumentErrorCode,
  history: {},
  command: {},
  event: {},
} as const satisfies Record<ErrorNamespace, Record<string, string>>;

type ErrorCodesMap = typeof ErrorCodes;

export type ErrorCode = {
  [K in ErrorNamespace]: ErrorCodesMap[K][keyof ErrorCodesMap[K]];
}[ErrorNamespace];

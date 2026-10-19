import { CommandErrorCodes } from "@/commands/errors/CommandErrorCodes";
import type { ErrorNamespace } from "./EngineError";
import { DocumentErrorCode } from "@/document/errors/DocumentErrorCode";
import { EventErrorCodes } from "@/events/errors/EventErrorCodes";
import { ExtensionErrorCodes } from "@/extensions/errors/ExtensionErrorCodes";
import { HistoryErrorCodes } from "@/history/errors/HistoryErrorCodes";

export const ErrorCodes = {
  document: DocumentErrorCode,
  history: HistoryErrorCodes,
  command: CommandErrorCodes,
  event: EventErrorCodes,
  extension: ExtensionErrorCodes,
} as const satisfies Record<ErrorNamespace, Record<string, string>>;

type ErrorCodesMap = typeof ErrorCodes;

export type ErrorCode = {
  [K in ErrorNamespace]: ErrorCodesMap[K][keyof ErrorCodesMap[K]];
}[ErrorNamespace];

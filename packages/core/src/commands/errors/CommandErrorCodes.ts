import { getObjectKeys } from "@/common/object.utils";

export const CommandErrorCodes = {
  BLOCK_TO_DELETE_NOT_FOUND: "COMMAND:BLOCK_TO_DELETE_NOT_FOUND",
  HISTORY_RECORD_MISMATCH: "COMMAND:HISTORY_RECORD_MISMATCH",
} as const;

export const ALL_COMMAND_ERROR_TYPES = Object.freeze(
  getObjectKeys(CommandErrorCodes),
);

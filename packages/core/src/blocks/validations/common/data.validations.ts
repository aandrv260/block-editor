import { getObjectKeys } from "@/common/object.utils";
import type { Block } from "../../models/block.models";

export const hasDataProperty = (block: object): boolean => {
  return "data" in block && typeof block.data === "object" && block.data !== null;
};

export const hasValidDataFieldCount = (
  block: Block,
  targetAllowedNumberOfDataFields: number,
): boolean => {
  return getObjectKeys(block.data).length === targetAllowedNumberOfDataFields;
};

export const hasValidTotalFieldCount = (
  block: Block,
  targetAllowedNumberOfFields: number,
): boolean => {
  return getObjectKeys(block).length === targetAllowedNumberOfFields;
};

export const hasValidText = (block: Block): boolean => {
  return "text" in block.data && typeof block.data.text === "string";
};

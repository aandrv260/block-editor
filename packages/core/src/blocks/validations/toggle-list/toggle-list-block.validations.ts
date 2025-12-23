import type { Block, ToggleListBlock } from "../../models/block.models";
import { hasValidChildren } from "../common/children.validations";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidTotalFieldCount,
} from "../common/data.validations";

const ALLOWED_NUMBER_OF_DATA_FIELDS = 1;
const ALLOWED_TOTAL_NUMBER_OF_FIELDS = 5;

const hasValidOpenField = (block: Block): boolean => {
  return "open" in block.data && typeof block.data.open === "boolean";
};

const isDataValid = (block: Block): boolean => {
  return (
    hasDataProperty(block) &&
    hasValidDataFieldCount(block, ALLOWED_NUMBER_OF_DATA_FIELDS) &&
    hasValidOpenField(block)
  );
};

export const isToggleListBlock = (block: Block): block is ToggleListBlock => {
  return (
    block.type === "toggle-list" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    isDataValid(block) &&
    hasValidChildren(block)
  );
};

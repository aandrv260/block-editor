import type { Block, TextBlock } from "../../models/block.models";
import { hasChildren } from "../common/children.validations";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidText,
  hasValidTotalFieldCount,
} from "../common/data.validations";

const ALLOWED_TOTAL_NUMBER_OF_FIELDS = 4;
const ALLOWED_NUMBER_OF_DATA_FIELDS = 1;

const isDataValid = (block: Block) => {
  return (
    hasDataProperty(block) &&
    hasValidDataFieldCount(block, ALLOWED_NUMBER_OF_DATA_FIELDS) &&
    hasValidText(block)
  );
};

export const isTextBlock = (block: Block): block is TextBlock => {
  return (
    block.type === "text" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    isDataValid(block) &&
    !hasChildren(block)
  );
};

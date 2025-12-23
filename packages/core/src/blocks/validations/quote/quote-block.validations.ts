import type { Block, QuoteBlock } from "../../models/block.models";
import { hasChildren } from "../common/children.validations";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidText,
  hasValidTotalFieldCount,
} from "../common/data.validations";

const ALLOWED_TOTAL_NUMBER_OF_FIELDS = 4;
const ALLOWED_NUMBER_OF_DATA_FIELDS = 1;

const isDataValid = (block: Block): boolean => {
  return (
    hasDataProperty(block) &&
    hasValidDataFieldCount(block, ALLOWED_NUMBER_OF_DATA_FIELDS) &&
    hasValidText(block)
  );
};

export const isQuoteBlock = (block: Block): block is QuoteBlock => {
  return (
    block.type === "quote" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    isDataValid(block) &&
    !hasChildren(block)
  );
};

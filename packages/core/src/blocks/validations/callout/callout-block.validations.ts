// TODO: Some of the validations are duplicated with the text block validations. This is because each block's validation logic is very similar but has to evolve differently. This is done on purpose. This will be reviewed once more when I add more block types and eventually marks (for bold, italic styling, etc.). I first want to add more block types, see the patterns that repeat and then be able to refactor better.
import type { Block, CalloutBlock } from "../../models/block.models";
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

export const isCalloutBlock = (block: Block): block is CalloutBlock => {
  return (
    block.type === "callout" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    isDataValid(block) &&
    !hasChildren(block)
  );
};

import type { Block, HeadingBlock } from "../../models/block.models";
import { HEADING_BLOCK_LEVELS } from "../../models/variants/heading/heading-block.models";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidText,
  hasValidTotalFieldCount,
} from "../common/data.validations";
import { hasChildren } from "../common/children.validations";

const ALLOWED_NUMBER_OF_DATA_FIELDS = 2;
const ALLOWED_TOTAL_NUMBER_OF_FIELDS = 4;

const hasValidHeadingLevel = (block: Block): boolean => {
  return "level" in block.data && HEADING_BLOCK_LEVELS.includes(block.data.level);
};

const isDataValid = (block: Block): boolean => {
  return (
    hasDataProperty(block) &&
    hasValidDataFieldCount(block, ALLOWED_NUMBER_OF_DATA_FIELDS) &&
    hasValidHeadingLevel(block) &&
    hasValidText(block)
  );
};

export const isHeadingBlock = (block: Block): block is HeadingBlock => {
  return (
    block.type === "heading" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    isDataValid(block) &&
    !hasChildren(block)
  );
};

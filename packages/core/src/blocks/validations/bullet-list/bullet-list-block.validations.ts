import type { Block, BulletListBlock } from "../../models/block.models";
import { hasValidChildren } from "../common/children.validations";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidTotalFieldCount,
} from "../common/data.validations";

const ALLOWED_TOTAL_NUMBER_OF_FIELDS = 5;
const ALLOWED_NUMBER_OF_DATA_FIELDS = 0;

const hasValidData = (block: Block): boolean => {
  return (
    hasDataProperty(block) &&
    hasValidDataFieldCount(block, ALLOWED_NUMBER_OF_DATA_FIELDS)
  );
};

export const isBulletListBlock = (block: Block): block is BulletListBlock => {
  return (
    block.type === "bullet-list" &&
    hasValidTotalFieldCount(block, ALLOWED_TOTAL_NUMBER_OF_FIELDS) &&
    hasValidData(block) &&
    hasValidChildren(block)
  );
};

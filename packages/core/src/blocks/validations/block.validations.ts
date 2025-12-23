import { getObjectKeys } from "@/common/object.utils";
import type { Block } from "../models/block.models";
import type { BlockType } from "../models/block-type.models";
import { isTextBlock } from "./text/text-block.validations";
import { isHeadingBlock } from "./heading/heading-block.validations";
import { isToggleListBlock } from "./toggle-list/toggle-list-block.validations";
import { isQuoteBlock } from "./quote/quote-block.validations";
import { isCalloutBlock } from "./callout/callout-block.validations";
import { isBulletListBlock } from "./bullet-list/bullet-list-block.validations";

export const BLOCK_VALIDATION_MAPPING = {
  text: isTextBlock,
  heading: isHeadingBlock,
  "toggle-list": isToggleListBlock,
  quote: isQuoteBlock,
  callout: isCalloutBlock,
  "bullet-list": isBulletListBlock,
} as const satisfies Record<BlockType, (block: Block) => boolean>;

export const ALL_BLOCK_TYPES = Object.freeze(
  getObjectKeys(BLOCK_VALIDATION_MAPPING),
);

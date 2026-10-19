import * as v from "valibot";
import { BulletListItemBlockSchema } from "./bullet-list-item/bullet-list-item-block.schema";
import { CalloutBlockSchema } from "./callout/callout-block.schema";
import { HeadingBlockSchema } from "./heading/heading-block.schema";
import { QuoteBlockSchema } from "./quote/quote-block.schema";
import { TextBlockSchema } from "./text/text-block.schema";
import { ToggleListBlockSchema } from "./toggle-list/toggle-list-block.schema";

export const BLOCK_SCHEMAS = {
  heading: HeadingBlockSchema,
  text: TextBlockSchema,
  "toggle-list": ToggleListBlockSchema,
  quote: QuoteBlockSchema,
  callout: CalloutBlockSchema,
  "bullet-list-item": BulletListItemBlockSchema,
};

export type BlockSchemas = typeof BLOCK_SCHEMAS;

export const BlockSchema = v.variant("type", [
  HeadingBlockSchema,
  TextBlockSchema,
  ToggleListBlockSchema,
  QuoteBlockSchema,
  CalloutBlockSchema,
  BulletListItemBlockSchema,
]);

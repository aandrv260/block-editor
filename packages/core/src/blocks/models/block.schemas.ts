import { BulletListBlockSchema } from "./bullet-list/bullet-list-block.schema";
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
  "bullet-list": BulletListBlockSchema,
};

export type BlockSchemas = typeof BLOCK_SCHEMAS;

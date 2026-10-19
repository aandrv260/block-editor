import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";
import { ContentSchema } from "../content/content.schema";

export const QuoteBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("quote"),
  data: v.strictObject({ content: ContentSchema }),
});

export type QuoteBlock = v.InferOutput<typeof QuoteBlockSchema> & DocumentNode;

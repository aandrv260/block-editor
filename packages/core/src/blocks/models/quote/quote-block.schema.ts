import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";

export const QuoteBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("quote"),
  data: v.strictObject({ text: v.string() }),
});

export type QuoteBlock = v.InferOutput<typeof QuoteBlockSchema> & DocumentNode;

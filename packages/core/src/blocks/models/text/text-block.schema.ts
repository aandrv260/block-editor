import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";

export const TextBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("text"),
  data: v.strictObject({ text: v.string() }),
});

export type TextBlock = v.InferOutput<typeof TextBlockSchema> & DocumentNode;

import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";

export const CalloutBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("callout"),
  data: v.strictObject({
    text: v.string(),
  }),
});

export type CalloutBlock = v.InferOutput<typeof CalloutBlockSchema> & DocumentNode;

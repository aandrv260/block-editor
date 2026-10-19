import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";
import { ContentSchema } from "../content/content.schema";

export const CalloutBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("callout"),
  data: v.strictObject({
    content: ContentSchema,
  }),
});

export type CalloutBlock = v.InferOutput<typeof CalloutBlockSchema> & DocumentNode;

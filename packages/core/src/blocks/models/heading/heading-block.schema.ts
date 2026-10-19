import * as v from "valibot";
import type { DocumentNode } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";
import { ContentSchema } from "../content/content.schema";

export const HEADING_BLOCK_LEVELS = [1, 2, 3] as const;

export const HeadingBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("heading"),
  data: v.strictObject({
    content: ContentSchema,
    level: v.picklist(HEADING_BLOCK_LEVELS),
  }),
});

export type HeadingBlock = v.InferOutput<typeof HeadingBlockSchema> & DocumentNode;

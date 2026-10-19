import * as v from "valibot";
import type { Block } from "../block.models";
import { BlockBaseSchema } from "../common/block-schema.models";
import { ContentSchema } from "../content/content.schema";

export const BulletListItemBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("bullet-list-item"),
  data: v.strictObject({ content: ContentSchema }),
  children: v.array(
    v.lazy(
      (): v.GenericSchema<Block> => v.variant("type", [BulletListItemBlockSchema]),
    ),
  ),
});

export interface BulletListItemBlock extends v.InferOutput<
  typeof BulletListItemBlockSchema
> {}

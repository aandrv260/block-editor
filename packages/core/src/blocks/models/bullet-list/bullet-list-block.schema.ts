import * as v from "valibot";
import { BlockBaseSchema, BlockChildrenSchema } from "../common/block-schema.models";

export const BulletListBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("bullet-list"),
  data: v.strictObject({}),
  children: BlockChildrenSchema,
});

export interface BulletListBlock extends v.InferOutput<
  typeof BulletListBlockSchema
> {}

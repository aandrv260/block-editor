import * as v from "valibot";
import { BlockBaseSchema, BlockChildrenSchema } from "../common/block-schema.models";

export const ToggleListBlockSchema = v.strictObject({
  ...BlockBaseSchema.entries,
  type: v.literal("toggle-list"),
  data: v.strictObject({ open: v.boolean() }),
  children: BlockChildrenSchema,
});

export interface ToggleListBlock extends v.InferOutput<
  typeof ToggleListBlockSchema
> {}

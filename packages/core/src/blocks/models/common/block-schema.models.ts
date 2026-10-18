import * as v from "valibot";
import type { Block } from "../block.models";

export const BlockBaseSchema = v.strictObject({
  id: v.string(),
  parentId: v.string(),
});

export const BlockChildrenSchema: v.GenericSchema<Block[]> = v.array(
  v.custom<Block>(() => true),
);

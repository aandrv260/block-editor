import * as v from "valibot";
import type { Block } from "../block.models";
import { BlockSchema } from "../block.schemas";

export const BlockBaseSchema = v.strictObject({
  id: v.string(),
  parentId: v.string(),
});

export const BlockChildrenSchema: v.ArraySchema<
  v.GenericSchema<Block>,
  undefined
> = v.array(v.lazy(() => BlockSchema));

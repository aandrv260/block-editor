import { getObjectKeys } from "@/common/object.utils";
import { BLOCK_SCHEMAS, type BlockSchemas } from "./block.schemas";

export type BlockType = keyof BlockSchemas;

export const ALL_BLOCK_TYPES = Object.freeze(getObjectKeys(BLOCK_SCHEMAS));

export const blockTypeCanHaveChildren = (type: BlockType): boolean =>
  "children" in BLOCK_SCHEMAS[type].entries;

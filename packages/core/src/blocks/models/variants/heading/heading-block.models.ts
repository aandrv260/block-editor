import type { UnwrapArray } from "@/common/types/array.types";
import type { BlockVariantBase } from "../block-variant.models";

export const HEADING_BLOCK_LEVELS = [1, 2, 3] as const satisfies number[];
export type HeadingBlockLevel = UnwrapArray<typeof HEADING_BLOCK_LEVELS>;

export interface HeadingVariantData {
  text: string;
  level: HeadingBlockLevel;
}

export type HeadingVariant = BlockVariantBase<"heading", HeadingVariantData>;

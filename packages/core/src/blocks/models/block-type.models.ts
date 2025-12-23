import type { UnwrapArray } from "@/common/types/array.types";

export const ALL_BLOCK_TYPES = [
  "heading",
  "text",
  "toggle-list",
  "quote",
  "callout",
  "bullet-list",
] as const satisfies string[];

export type BlockType = UnwrapArray<typeof ALL_BLOCK_TYPES>;

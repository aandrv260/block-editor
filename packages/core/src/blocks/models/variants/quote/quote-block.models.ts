import type { BlockVariantBase } from "../block-variant.models";

export interface QuoteVariantData {
  text: string;
}

export type QuoteVariant = BlockVariantBase<"quote", QuoteVariantData>;

import type { BlockVariantBase } from "../block-variant.models";

export interface CalloutVariantData {
  text: string;
}

export type CalloutVariant = BlockVariantBase<"callout", CalloutVariantData>;

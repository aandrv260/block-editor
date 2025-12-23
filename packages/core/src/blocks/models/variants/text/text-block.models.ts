import type { BlockVariantBase } from "../block-variant.models";

export interface TextVariantData {
  text: string;
}

export type TextVariant = BlockVariantBase<"text", TextVariantData>;

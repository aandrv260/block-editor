import type { BlockVariantBase } from "../block-variant.models";

interface ToggleListVariantData {
  open: boolean;
}

export type ToggleListVariant = BlockVariantBase<
  "toggle-list",
  ToggleListVariantData
>;

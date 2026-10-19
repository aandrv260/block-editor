import type { BlockRendererMap } from "@/models/block-ui.models";
import HeadingBlock from "@/components/blocks/HeadingBlock";
import TextBlock from "@/components/blocks/TextBlock";
import ToggleListBlock from "@/components/blocks/ToggleListBlock";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import CalloutBlock from "@/components/blocks/CalloutBlock";
import BulletListItemBlock from "@/components/blocks/BulletListItemBlock";

export const DEFAULT_BLOCK_RENDER_MAP = {
  heading: HeadingBlock,
  text: TextBlock,
  "toggle-list": ToggleListBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  "bullet-list-item": BulletListItemBlock,
} as const satisfies BlockRendererMap;

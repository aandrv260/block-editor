import type { BlockRendererMap } from "@/models/block-ui.models";
import HeadingBlock from "@/components/blocks/HeadingBlock";
import TextBlock from "@/components/blocks/TextBlock";
import ToggleListBlock from "@/components/blocks/ToggleListBlock";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import CalloutBlock from "@/components/blocks/CalloutBlock";
import BulletListBlock from "@/components/blocks/BulletListBlock";

export const DEFAULT_BLOCK_RENDER_MAP = {
  heading: HeadingBlock,
  text: TextBlock,
  "toggle-list": ToggleListBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  "bullet-list": BulletListBlock,
} as const satisfies BlockRendererMap;

import type { DeepReadonly } from "@block-editor/core";
import type { BlockType } from "@block-editor/core";
import type {
  BulletListBlock,
  CalloutBlock,
  HeadingBlock,
  QuoteBlock,
  TextBlock,
  ToggleListBlock,
} from "@block-editor/core";

export interface BlockRendererPropsMapping {
  heading: HeadingBlock;
  text: TextBlock;
  "toggle-list": ToggleListBlock;
  quote: QuoteBlock;
  callout: CalloutBlock;
  "bullet-list": BulletListBlock;
}

export type BlockRendererProps<T extends BlockType> = {
  block: DeepReadonly<BlockRendererPropsMapping[T]>;
};

export type BlockRenderer<T extends BlockType> = (
  props: BlockRendererProps<T>,
) => React.ReactNode;

export type BlockRendererMap = {
  [K in BlockType]: BlockRenderer<K>;
};

export type BlockRendererOverrides = Partial<BlockRendererMap>;

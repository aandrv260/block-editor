import type { DeepReadonly, Block } from "@block-editor/core";

import { useEditorContext } from "../context/useEditorContext";

interface RenderBlockProps {
  block: DeepReadonly<Block>;
}

export default function RenderBlock({ block }: RenderBlockProps) {
  const { blockRendererMap } = useEditorContext();
  const Block = blockRendererMap[block.type];

  return <Block block={block as never} />;
}

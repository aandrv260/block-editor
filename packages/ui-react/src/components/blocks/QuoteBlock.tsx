import type { QuoteBlock, DeepReadonly } from "@block-editor/core";

interface Props {
  block: DeepReadonly<QuoteBlock>;
}

export default function QuoteBlock({ block }: Props) {
  return <div>{block.type}</div>;
}

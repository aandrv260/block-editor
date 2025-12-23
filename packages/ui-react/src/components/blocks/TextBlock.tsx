import type { TextBlock, DeepReadonly } from "@block-editor/core";

interface Props {
  block: DeepReadonly<TextBlock>;
}

export default function TextBlock({ block }: Props) {
  return <p>Some text {block.data.text}</p>;
}

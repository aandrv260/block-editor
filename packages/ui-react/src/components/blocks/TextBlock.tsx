import { getPlainText, type TextBlock, type DeepReadonly } from "@block-editor/core";

interface Props {
  block: DeepReadonly<TextBlock>;
}

export default function TextBlock({ block }: Props) {
  return <p>Some text {getPlainText(block.data.content)}</p>;
}

import type { ToggleListBlock, DeepReadonly } from "@block-editor/core";

interface Props {
  block: DeepReadonly<ToggleListBlock>;
}

export default function ToggleListBlock({ block }: Props) {
  return <div>{block.type}</div>;
}

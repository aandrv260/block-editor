import type { DeepReadonly, BulletListBlock } from "@block-editor/core";

interface Props {
  block: DeepReadonly<BulletListBlock>;
}

export default function BulletListBlock({ block }: Props) {
  return <div>{block.type}</div>;
}

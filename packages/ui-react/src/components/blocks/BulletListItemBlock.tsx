import type { DeepReadonly, BulletListItemBlock } from "@block-editor/core";

interface Props {
  block: DeepReadonly<BulletListItemBlock>;
}

export default function BulletListItemBlock({ block }: Props) {
  return <div>{block.type}</div>;
}

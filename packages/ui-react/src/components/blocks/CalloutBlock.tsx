import type { DeepReadonly, CalloutBlock } from "@block-editor/core";

interface Props {
  block: DeepReadonly<CalloutBlock>;
}

export default function CalloutBlock({ block }: Props) {
  return <div>{block.type}</div>;
}

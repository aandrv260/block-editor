import type { DeepReadonly } from "@/common/types/object.types";
import type { BlockPayload } from "../../../document/models/document-payload.models";
import type { TextRun } from "../content/content.schema";

export type BlockSplitPosition = "empty" | "start" | "middle" | "end";

export type BlockSplitPlacement = "before" | "after" | "first-child";

export type BlockSplitContext<TBlock> = {
  block: DeepReadonly<TBlock>;
  newBlockId: string;
  splitPosition: BlockSplitPosition;
  contentBefore: TextRun[];
  contentAfter: TextRun[];
};

export type BlockSplitResult = {
  blockContent: TextRun[];
  newBlock: BlockPayload;
  placement: BlockSplitPlacement;
};

/**
 * Decides which text the block keeps, which new block is created and where it goes.

 * Without a rule, or when the rule returns `undefined`, the default split is used.

 * At the start, the default inserts an empty text block before the block.

 * Anywhere else, it moves the text after the split into a new text block after the block.
 */
export type BlockSplitRule<TBlock> = (
  context: BlockSplitContext<TBlock>,
) => BlockSplitResult | undefined;

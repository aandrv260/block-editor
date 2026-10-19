import type { ContentBlock } from "../../../blocks/models/block.models";
import type { TextRun } from "../../../blocks/models/content/content.schema";
import { getPlainText, isContentBlock } from "../../../blocks/utils/content.utils";
import type { EditorDocument } from "../../../document/EditorDocument";
import { BlockHasNoContentError } from "../../errors/edit-text/BlockHasNoContentError";
import { BlockToEditNotFoundError } from "../../errors/edit-text/BlockToEditNotFoundError";
import { InvalidTextRangeError } from "../../errors/edit-text/InvalidTextRangeError";

interface TextRange {
  blockId: string;
  from: number;
  to: number;
}

export const getBlockToEdit = (
  document: EditorDocument,
  { blockId, from, to }: TextRange,
): ContentBlock => {
  const block = document.getBlock(blockId);

  if (!block) {
    throw new BlockToEditNotFoundError(blockId);
  }

  if (!isContentBlock(block)) {
    throw new BlockHasNoContentError(blockId);
  }

  const textLength = getPlainText(block.data.content).length;

  const isRangeInsideText =
    Number.isInteger(from) &&
    Number.isInteger(to) &&
    from >= 0 &&
    from <= to &&
    to <= textLength;

  if (!isRangeInsideText) {
    throw new InvalidTextRangeError(blockId, from, to, textLength);
  }

  return block;
};

export const updateBlockContent = (
  document: EditorDocument,
  block: ContentBlock,
  content: TextRun[],
): void => {
  const newBlock = { ...block };

  newBlock.data = { ...block.data, content };
  document.updateBlock(block.id, newBlock, {
    childrenStrategy: "preserve",
  });
};

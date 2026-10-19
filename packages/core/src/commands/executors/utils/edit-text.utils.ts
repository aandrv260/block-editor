import type { Block } from "../../../blocks/models/block.models";
import type { TextRun } from "../../../blocks/models/content/content.schema";
import { getPlainText } from "../../../blocks/utils/content.utils";
import type { EditorDocument } from "../../../document/EditorDocument";
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
): Block => {
  const block = document.getBlock(blockId);

  if (!block) {
    throw new BlockToEditNotFoundError(blockId);
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
  block: Block,
  content: TextRun[],
): Block => {
  const newBlock = { ...block };

  newBlock.data = { ...block.data, content };
  return document.updateBlock(block.id, newBlock, {
    childrenStrategy: "preserve",
  });
};

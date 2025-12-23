import type { Block } from "../../../blocks/models/block.models";
import { BlockToUpdateHasNoParentError } from "../../errors/update-block";
import type { ReadonlyBlockMap } from "../../models/document.models";

export const isUpdatePayloadIdInvalid = (
  idOfBlockToReplace: string,
  payloadId: string,
  blockMap: ReadonlyBlockMap,
) => {
  return idOfBlockToReplace !== payloadId && blockMap.has(payloadId);
};

export const getIndexOfBlockToUpdateInParent = (
  parentChilren: Block[] | undefined,
  blockToReplaceId: string,
  parentId: string,
): number => {
  const indexOfBlockToRemoveInParent =
    parentChilren?.findIndex(child => child.id === blockToReplaceId) ?? -1;

  if (indexOfBlockToRemoveInParent === -1) {
    throw new BlockToUpdateHasNoParentError(blockToReplaceId, parentId);
  }

  return indexOfBlockToRemoveInParent;
};

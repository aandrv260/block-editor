import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { BLOCK_VARIANT_HAS_CHILDREN_MAPPING } from "../../blocks/models/variants/block-variant.models";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import type { BlockPayload } from "../models/document-payload.models";

export const blockCanHaveChildren = (
  block: Block | DocumentRoot,
): block is Block & { children: Block[] } => {
  return (
    block instanceof DocumentRoot || BLOCK_VARIANT_HAS_CHILDREN_MAPPING[block.type]
  );
};

export const blockPayloadCanHaveChildren = (block: BlockPayload): boolean => {
  return BLOCK_VARIANT_HAS_CHILDREN_MAPPING[block.type];
};

export const getUpdatedBlockParentChildren = (
  parentChildren: Block[],
  newDocumentBlock: Block,
  indexOfBlockToRemoveInParent: number,
): Block[] => {
  if (indexOfBlockToRemoveInParent < 0) {
    throw new Error("Index cannot be less than 0!");
  }

  if (indexOfBlockToRemoveInParent >= parentChildren.length) {
    throw new Error(
      "Index cannot be greater than the length of the parent children array!",
    );
  }

  const currentChildren = [...parentChildren];
  currentChildren[indexOfBlockToRemoveInParent] = newDocumentBlock;

  return currentChildren;
};

// TODO: Consider updating the children as well in this function or remove entirely after the refactor before releasing the first stable version.
/**
 * Updates the parent ID of the top-level children only.
 */
export const getUpdatedBlockChildren = (
  blockChildren: BlockPayload[],
  newParentId: string,
  keepChildren: boolean,
): Block[] => {
  if (!keepChildren) {
    // TODO: This is not tested properly. Fix the test.
    return [];
  }

  return blockChildren.map(child => ({
    ...child,
    parentId: newParentId,
  })) as Block[];
};

/**
 * Get the children of the node or an empty array by default.
 */
export const getChildren = (node: DocumentNode | null | undefined): Block[] =>
  node?.children ?? [];

export const getPayloadChildren = (node: BlockPayload | null | undefined) => {
  return node?.children ?? [];
};

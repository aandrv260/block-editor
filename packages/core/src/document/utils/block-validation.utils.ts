import { ALL_BLOCK_TYPES } from "../../blocks/models/block-type.models";
import type { BlockType } from "../../blocks/models/block-type.models";
import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { getChildren } from "./block-children.utils";
import { BLOCK_VALIDATION_MAPPING } from "../../blocks/validations/block.validations";
import { BlockIsNotAnObjectError, ParentBlockNotFoundError } from "../errors/common";
import {
  InvalidBlockIDError,
  InvalidBlockParentIDError,
  InvalidBlockTypeError,
  InvalidBlockVariantError,
  InvalidDocumentRootIDError,
  InvalidDocumentStructureError,
} from "../errors/factories";
import { DEFAULT_DOCUMENT_ROOT_ID } from "../DocumentRoot/DocumentRoot";
import { isObject } from "@/common/object.utils";

export const isBlockTypeValid = (blockType: unknown): blockType is BlockType =>
  ALL_BLOCK_TYPES.includes(blockType as BlockType);

/**
 * Validates only structure and not if it is the `DocumentRoot` class itself. If it doesn't match the structure of a document root, throws an error.
 */
export const validateDocumentRootStructure = (documentObject: unknown) => {
  if (
    typeof documentObject !== "object" ||
    documentObject === null ||
    !("id" in documentObject) ||
    !("children" in documentObject) ||
    !Array.isArray(documentObject.children)
  ) {
    throw new InvalidDocumentStructureError();
  }

  if (
    typeof documentObject.id !== "string" ||
    documentObject.id !== DEFAULT_DOCUMENT_ROOT_ID
  ) {
    throw new InvalidDocumentRootIDError(documentObject.id);
  }
};

/**
 * Throws an error if the ID property is missing or is invalid.
 */
export const validateBlockHasId = (block: unknown) => {
  if (!isObject(block)) {
    throw new BlockIsNotAnObjectError(block);
  }

  const noIdInBlock = !("id" in block) || typeof block.id !== "string";

  if (noIdInBlock) {
    const blockParentId =
      "parentId" in block && typeof block.parentId === "string"
        ? block.parentId
        : "[UNKNOWN_PARENT_ID]";

    const typedBlock = block as typeof block & { id?: unknown };

    throw new InvalidBlockIDError(blockParentId, typedBlock.id);
  }
};

export const validateBlockParentId = (block: unknown) => {
  if (!isObject(block)) {
    throw new BlockIsNotAnObjectError(block);
  }

  const noParentIdInBlock =
    !("parentId" in block) || typeof block.parentId !== "string";

  if (noParentIdInBlock) {
    const blockId =
      "id" in block && typeof block.id === "string"
        ? block.id
        : "[UNKNOWN_BLOCK_ID]";

    const parentId = (block as typeof block & { parentId?: unknown }).parentId;

    throw new InvalidBlockParentIDError(parentId, blockId);
  }
};

export const validateBlockType = (block: unknown) => {
  if (!isObject(block)) {
    throw new BlockIsNotAnObjectError(block);
  }

  const blockId =
    "id" in block && typeof block.id === "string" ? block.id : "[UNKNOWN_BLOCK_ID]";

  const blockDoesNotHaveType = !("type" in block) || typeof block.type !== "string";

  const typedBlock = block as typeof block & { type?: unknown };

  if (!isBlockTypeValid(typedBlock?.type) || blockDoesNotHaveType) {
    throw new InvalidBlockTypeError(blockId, typedBlock.type);
  }
};

/**
 * Make sure the parentId points to the block's direct parent in the document
 */
export const validateBlockParentLink = (
  parent: DocumentNode | null,
  blockId: string,
) => {
  const isParentOfCurrent = getChildren(parent).some(child => child.id === blockId);

  if (!isParentOfCurrent) {
    throw new ParentBlockNotFoundError(parent?.id, blockId);
  }
};

export const validateBlockVariant = (block: Block) => {
  const blockId = block.id;
  const blockType = block.type;

  if (!ALL_BLOCK_TYPES.includes(blockType)) {
    throw new InvalidBlockTypeError(blockId, blockType);
  }

  const validateBlockVariant = BLOCK_VALIDATION_MAPPING[blockType];

  if (!validateBlockVariant(block)) {
    throw new InvalidBlockVariantError(blockId, blockType);
  }
};

export const validateBlockStructure = (block: unknown) => {
  if (!isObject(block)) {
    throw new BlockIsNotAnObjectError(block);
  }

  validateBlockHasId(block);
  validateBlockParentId(block);
};

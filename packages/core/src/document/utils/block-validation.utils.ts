import * as v from "valibot";
import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { BLOCK_SCHEMAS } from "../../blocks/models/block.schemas";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { getChildren } from "./block-children.utils";
import {
  InvalidBlockError,
  ParentBlockNotFoundError,
  type DocumentIssue,
} from "../errors/common";
import { InvalidDocumentError } from "../errors/factories";
import { DocumentSchema } from "../models/document.schema";

const toDocumentIssues = (issues: v.GenericIssue[]): DocumentIssue[] =>
  issues.map(issue => ({
    path: v.getDotPath(issue) ?? "",
    message: issue.message,
  }));

export const validateDocumentStructure: (
  document: unknown,
) => asserts document is v.InferOutput<typeof DocumentSchema> = document => {
  const result = v.safeParse(DocumentSchema, document);

  if (!result.success) {
    throw new InvalidDocumentError(toDocumentIssues(result.issues));
  }
};

const getChildBlockSchema = (
  parent: Block | DocumentRoot,
): v.GenericSchema<Block> => {
  if (parent instanceof DocumentRoot) {
    return DocumentSchema.entries.children.item;
  }

  const { entries } = BLOCK_SCHEMAS[parent.type];

  return "children" in entries ? entries.children.item : v.never();
};

export const validateBlockStructure: (
  block: unknown,
  parent: Block | DocumentRoot,
) => asserts block is Block = (block, parent) => {
  const result = v.safeParse(getChildBlockSchema(parent), block);

  if (!result.success) {
    throw new InvalidBlockError(toDocumentIssues(result.issues));
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

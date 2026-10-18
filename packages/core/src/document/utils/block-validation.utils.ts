import * as v from "valibot";
import type { DocumentNode } from "../../blocks/models/block.models";
import { getChildren } from "./block-children.utils";
import { ParentBlockNotFoundError } from "../errors/common";
import { InvalidDocumentError } from "../errors/factories";
import { DocumentSchema } from "../models/document.schema";

export const validateDocumentStructure: (
  document: unknown,
) => asserts document is v.InferOutput<typeof DocumentSchema> = document => {
  const result = v.safeParse(DocumentSchema, document);

  if (!result.success) {
    throw new InvalidDocumentError(
      result.issues.map(issue => ({
        path: v.getDotPath(issue) ?? "",
        message: issue.message,
      })),
    );
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

import {
  blockCanHaveChildren,
  blockPayloadCanHaveChildren,
} from "../../../block-children.utils";
import {
  CannotPreserveChildrenOnTargetBlockError,
  CannotPreserveFromChildlessSourceBlockError,
} from "../../../../errors/update-block";
import type {
  GetUpdatedChildrenContext,
  GetUpdatedChildrenStrategy,
} from "../update-block-children.models";

const validateChildren = ({
  payload,
  blockToReplace,
}: GetUpdatedChildrenContext): void | never => {
  const blockToReplaceCanHaveChildren = blockCanHaveChildren(blockToReplace);
  const newBlockCanHaveChildren = blockPayloadCanHaveChildren(payload);

  if (blockToReplaceCanHaveChildren && !newBlockCanHaveChildren) {
    throw new CannotPreserveChildrenOnTargetBlockError();
  }

  if (!blockToReplaceCanHaveChildren && newBlockCanHaveChildren) {
    throw new CannotPreserveFromChildlessSourceBlockError();
  }
};

export const getUpdatedBlockChildrenWithPreserveStrategy: GetUpdatedChildrenStrategy =
  ctx => {
    validateChildren(ctx);
    return structuredClone(ctx.blockToReplace.children);
  };

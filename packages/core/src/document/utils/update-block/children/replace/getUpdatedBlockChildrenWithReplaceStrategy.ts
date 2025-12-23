import {
  blockCanHaveChildren,
  blockPayloadCanHaveChildren,
} from "../../../block-children.utils";
import {
  ReplaceStrategyMissingNewChildrenError,
  ReplaceStrategyNotApplicableError,
  ReplaceStrategySourceHasNoChildrenError,
  ReplaceStrategyTargetCannotHaveChildrenError,
} from "../../../../errors/update-block";
import type {
  GetUpdatedChildrenContext,
  GetUpdatedChildrenStrategy,
} from "../update-block-children.models";

const validateChildren = ({
  blockToReplace,
  payload,
}: GetUpdatedChildrenContext) => {
  const currentBlockCanHaveChildren = blockCanHaveChildren(blockToReplace);
  const canNewBlockHaveChildren = blockPayloadCanHaveChildren(payload);

  if (!currentBlockCanHaveChildren && !canNewBlockHaveChildren) {
    throw new ReplaceStrategyNotApplicableError();
  }

  if (currentBlockCanHaveChildren && !canNewBlockHaveChildren) {
    throw new ReplaceStrategyTargetCannotHaveChildrenError();
  }

  if (!currentBlockCanHaveChildren && canNewBlockHaveChildren) {
    throw new ReplaceStrategySourceHasNoChildrenError();
  }

  if (!payload.children) {
    throw new ReplaceStrategyMissingNewChildrenError();
  }
};

export const getUpdatedBlockChildrenWithReplaceStrategy: GetUpdatedChildrenStrategy =
  ctx => {
    validateChildren(ctx);
    return structuredClone(ctx.payload.children);
  };

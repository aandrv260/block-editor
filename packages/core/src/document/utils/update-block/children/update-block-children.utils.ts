import type { UpdateBlockChildrenStrategy } from "../../../models/document.models";
import type {
  GetUpdatedChildrenContext,
  GetUpdatedChildrenStrategy,
} from "./update-block-children.models";
import { getUpdatedBlockChildrenWithDropStrategy } from "./drop/getUpdatedBlockChildrenWithDropStrategy";
import { getUpdatedBlockChildrenWithPreserveStrategy } from "./preserve/getUpdatedBlockChildrenWithPreserveStrategy";
import { getUpdatedBlockChildrenWithReplaceStrategy } from "./replace/getUpdatedBlockChildrenWithReplaceStrategy";

const UPDATE_CHILDREN_STRATEGIES: Record<
  UpdateBlockChildrenStrategy,
  GetUpdatedChildrenStrategy
> = {
  drop: getUpdatedBlockChildrenWithDropStrategy,
  preserve: getUpdatedBlockChildrenWithPreserveStrategy,
  replace: getUpdatedBlockChildrenWithReplaceStrategy,
};

export const resolveChildren = (
  strategy: UpdateBlockChildrenStrategy,
  ctx: GetUpdatedChildrenContext,
) => {
  const getChildren = UPDATE_CHILDREN_STRATEGIES[strategy];
  return getChildren(ctx);
};

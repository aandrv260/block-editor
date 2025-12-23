import type { UpdateBlockChildrenStrategy } from "../../../models/document.models";
import type {
  UpdateStrategy,
  UpdateStrategyContext,
  UpdateStrategyResult,
} from "./update-strategies.models";
import { updateBlockPreservingChildren } from "./preserve/updateBlockPreservingChildren";
import { updateBlockReplacingChildren } from "./replace/updateBlockReplacingChildren";

const UPDATE_HANDLING_STRATEGIES: Record<
  UpdateBlockChildrenStrategy,
  UpdateStrategy
> = {
  drop: updateBlockReplacingChildren,
  preserve: updateBlockPreservingChildren,
  replace: updateBlockReplacingChildren,
};

export const updateSubtree = (
  strategy: UpdateBlockChildrenStrategy,
  ctx: UpdateStrategyContext,
): UpdateStrategyResult => {
  const updateHandler = UPDATE_HANDLING_STRATEGIES[strategy];
  return updateHandler(ctx);
};

import { blockPayloadCanHaveChildren } from "../../../block-children.utils";
import type { GetUpdatedChildrenStrategy } from "../update-block-children.models";

export const getUpdatedBlockChildrenWithDropStrategy: GetUpdatedChildrenStrategy =
  ctx => {
    return blockPayloadCanHaveChildren(ctx.payload) ? [] : undefined;
  };

import type { Block } from "@/blocks/models/block.models";
import type { BlockPayload } from "../../../models/document-payload.models";

export interface GetUpdatedChildrenContext {
  payload: BlockPayload;
  blockToReplace: Block;
}

export type GetUpdatedChildrenStrategy = (
  ctx: GetUpdatedChildrenContext,
) => BlockPayload[] | undefined;

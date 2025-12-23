import type { MoveBlockStrategy } from "../../document/models/document.models";
import type { ActionBase } from "./action-base.models";

export interface MoveBlockActionPayload {
  blockId: string;
  targetId: string;
  strategy: MoveBlockStrategy;
}

export interface MoveBlockAction extends ActionBase<
  "block:move",
  MoveBlockActionPayload
> {}

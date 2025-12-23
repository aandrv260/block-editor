import type { EditorActionType } from "../actions.models";

export interface ActionBase<TActionType extends EditorActionType, TPayload> {
  type: TActionType;
  payload: TPayload;
}

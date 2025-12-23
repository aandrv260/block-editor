export type MoveBlockEventStrategy = "before" | "after" | "append";

export interface MoveBlockEvent {
  type: "block:move";
  blockId: string;
  targetId: string;
  strategy: MoveBlockEventStrategy;
}

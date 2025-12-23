export type InsertBlockEventStrategy = "before" | "after" | "append";

export interface InsertBlockEvent {
  type: "block:insert";
  blockId: string;
  targetId?: string;
  strategy: InsertBlockEventStrategy;
}

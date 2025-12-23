export interface HistorySetEvent {
  type: "history:set";
  history: readonly string[];
  currentPosition: number;
  currentRecord: string | null;
}

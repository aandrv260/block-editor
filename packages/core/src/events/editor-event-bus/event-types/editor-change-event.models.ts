import type { DeepReadonly } from "@/common/types/object.types";
import type { DefaultCommands } from "../../../commands/executors/defaultCommands";
import type { DocumentRoot } from "../../../document/DocumentRoot/DocumentRoot";
import type { HistoryOperationType } from "../../../history/models/history-operation.models";

export interface EditorChangeEvent<
  TTrigger extends string = keyof DefaultCommands | HistoryOperationType,
> {
  type: "editor:change";
  documentJSON: string;
  history: string[];
  currentPositionInHistory: number;
  root: DeepReadonly<DocumentRoot>;
  triggerAction: TTrigger;
}

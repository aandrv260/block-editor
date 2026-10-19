import type { BoldMark } from "./bold-mark.schema";
import type { CodeMark } from "./code-mark.schema";
import type { ItalicMark } from "./italic-mark.schema";
import type { LinkMark } from "./link-mark.schema";
import type { StrikeMark } from "./strike-mark.schema";
import type { UnderlineMark } from "./underline-mark.schema";

export type Mark =
  | BoldMark
  | ItalicMark
  | UnderlineMark
  | StrikeMark
  | CodeMark
  | LinkMark;

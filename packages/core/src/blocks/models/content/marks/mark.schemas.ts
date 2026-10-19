import * as v from "valibot";
import { BoldMarkSchema } from "./bold-mark.schema";
import { CodeMarkSchema } from "./code-mark.schema";
import { ItalicMarkSchema } from "./italic-mark.schema";
import { LinkMarkSchema } from "./link-mark.schema";
import { StrikeMarkSchema } from "./strike-mark.schema";
import { UnderlineMarkSchema } from "./underline-mark.schema";

export const MARK_SCHEMAS = {
  bold: BoldMarkSchema,
  italic: ItalicMarkSchema,
  underline: UnderlineMarkSchema,
  strike: StrikeMarkSchema,
  code: CodeMarkSchema,
  link: LinkMarkSchema,
};

export type MarkSchemas = typeof MARK_SCHEMAS;

export const MarkSchema = v.variant("type", [
  BoldMarkSchema,
  ItalicMarkSchema,
  UnderlineMarkSchema,
  StrikeMarkSchema,
  CodeMarkSchema,
  LinkMarkSchema,
]);

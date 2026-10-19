import * as v from "valibot";
import { MarkSchema } from "./marks/mark.schemas";

export const TextRunSchema = v.strictObject({
  text: v.string(),
  marks: v.array(MarkSchema),
});

export type TextRun = v.InferOutput<typeof TextRunSchema>;

export const ContentSchema = v.array(TextRunSchema);

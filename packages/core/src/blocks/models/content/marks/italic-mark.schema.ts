import * as v from "valibot";

export const ItalicMarkSchema = v.strictObject({
  type: v.literal("italic"),
});

export type ItalicMark = v.InferOutput<typeof ItalicMarkSchema>;

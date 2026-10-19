import * as v from "valibot";

export const BoldMarkSchema = v.strictObject({
  type: v.literal("bold"),
});

export type BoldMark = v.InferOutput<typeof BoldMarkSchema>;

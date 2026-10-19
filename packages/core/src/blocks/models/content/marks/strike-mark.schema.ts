import * as v from "valibot";

export const StrikeMarkSchema = v.strictObject({
  type: v.literal("strike"),
});

export type StrikeMark = v.InferOutput<typeof StrikeMarkSchema>;

import * as v from "valibot";

export const UnderlineMarkSchema = v.strictObject({
  type: v.literal("underline"),
});

export type UnderlineMark = v.InferOutput<typeof UnderlineMarkSchema>;

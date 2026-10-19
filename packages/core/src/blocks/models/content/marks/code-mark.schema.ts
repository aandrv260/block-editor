import * as v from "valibot";

export const CodeMarkSchema = v.strictObject({
  type: v.literal("code"),
});

export type CodeMark = v.InferOutput<typeof CodeMarkSchema>;

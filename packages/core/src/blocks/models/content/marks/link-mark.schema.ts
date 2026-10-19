import * as v from "valibot";

export const LinkMarkSchema = v.strictObject({
  type: v.literal("link"),
  href: v.pipe(
    v.string(),
    v.check(
      href => /^(https?:|mailto:|tel:|[/#?])/i.test(href),
      "Invalid link: Expected an http, https, mailto or tel address, or one that starts with /, # or ?",
    ),
  ),
});

export type LinkMark = v.InferOutput<typeof LinkMarkSchema>;

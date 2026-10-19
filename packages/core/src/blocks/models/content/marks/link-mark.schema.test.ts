import * as v from "valibot";
import { LinkMarkSchema } from "./link-mark.schema";

describe("LinkMarkSchema", () => {
  test.each([
    ["https://example.com"],
    ["http://example.com"],
    ["HTTPS://EXAMPLE.COM"],
    ["mailto:hello@example.com"],
    ["tel:+359888123456"],
    ["/docs/intro"],
    ["#section"],
    ["?page=2"],
  ])("accepts the safe address %s", href => {
    // Assert
    expect(v.is(LinkMarkSchema, { type: "link", href })).toBe(true);
  });

  test.each([
    ["javascript:alert(1)"],
    ["JavaScript:alert(1)"],
    [" javascript:alert(1)"],
    ["java\tscript:alert(1)"],
    ["data:text/html,<script>alert(1)</script>"],
    ["vbscript:msgbox(1)"],
    ["file:///etc/passwd"],
    ["example.com"],
    [""],
  ])("rejects the address %s", href => {
    // Assert
    expect(v.is(LinkMarkSchema, { type: "link", href })).toBe(false);
  });
});

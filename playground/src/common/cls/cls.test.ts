import { describe, it, expect } from "vitest";
import { cls } from "./cls";

describe("cls()", () => {
  it("returns empty string when no arguments", () => {
    expect(cls()).toBe("");
  });

  it("merges string arguments", () => {
    expect(cls("bg-red", "text-white")).toBe("bg-red text-white");
  });

  it("merges number arguments", () => {
    expect(cls(42, "px-4")).toBe("42 px-4");
  });

  it("ignores falsy values", () => {
    expect(cls("", null, undefined, false as any, 0)).toBe("");
  });

  it("includes keys from truthy object entries", () => {
    expect(cls({ "bg-red": true, "text-white": false, rounded: 1 as any })).toBe(
      "bg-red rounded",
    );
  });

  it("ignores keys from falsy object entries", () => {
    expect(
      cls({
        "bg-red": false,
        "text-white": null,
        "font-bold": 0 as any,
        rounded: undefined,
      }),
    ).toBe("");
  });

  it("merges strings and objects together", () => {
    expect(cls("px-4", { "bg-red": true, hidden: false }, "text-lg")).toBe(
      "px-4 bg-red text-lg",
    );
  });

  it("handles mixed numbers, strings, and objects", () => {
    expect(cls(5, "m-2", { border: true, shadow: false }, 99, "p-4")).toBe(
      "5 m-2 border 99 p-4",
    );
  });

  it("trims extra spaces at the beginning and the end", () => {
    expect(cls("  mx-2  ", "", { "bg-red": true }, " ")).toBe("mx-2   bg-red");
  });
});

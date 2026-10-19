import type { Mark } from "../models/content/marks/mark.models";
import { areMarksEqual, normalizeMarks } from "./mark.utils";

const bold: Mark = { type: "bold" };
const italic: Mark = { type: "italic" };
const code: Mark = { type: "code" };

describe("normalizeMarks()", () => {
  it("sorts the marks in the order of the mark types", () => {
    // Arrange
    const link: Mark = { type: "link", href: "https://example.com" };

    // Assert
    expect(normalizeMarks([link, code, italic, bold])).toStrictEqual([
      bold,
      italic,
      code,
      link,
    ]);
  });

  it("keeps only the last mark when the same type appears more than once", () => {
    // Arrange
    const firstLink: Mark = { type: "link", href: "https://first.com" };
    const lastLink: Mark = { type: "link", href: "https://last.com" };

    // Assert
    expect(normalizeMarks([firstLink, bold, lastLink, bold])).toStrictEqual([
      bold,
      lastLink,
    ]);
  });

  it("returns an empty array when there are no marks", () => {
    // Assert
    expect(normalizeMarks([])).toStrictEqual([]);
  });
});

describe("areMarksEqual()", () => {
  it("returns true when both lists have the same marks in the same order", () => {
    // Assert
    expect(
      areMarksEqual([bold, italic], [{ type: "bold" }, { type: "italic" }]),
    ).toBe(true);
  });

  it("returns true when both lists are empty", () => {
    // Assert
    expect(areMarksEqual([], [])).toBe(true);
  });

  it("returns false when the lists have a different number of marks", () => {
    // Assert
    expect(areMarksEqual([bold], [bold, italic])).toBe(false);
  });

  it("returns false when the lists have different marks", () => {
    // Assert
    expect(areMarksEqual([bold], [italic])).toBe(false);
  });

  it("returns true when two links point to the same address", () => {
    // Assert
    expect(
      areMarksEqual(
        [{ type: "link", href: "https://example.com" }],
        [{ type: "link", href: "https://example.com" }],
      ),
    ).toBe(true);
  });

  it("returns false when two links point to different addresses", () => {
    // Assert
    expect(
      areMarksEqual(
        [{ type: "link", href: "https://first.com" }],
        [{ type: "link", href: "https://second.com" }],
      ),
    ).toBe(false);
  });
});

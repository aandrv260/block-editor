import type { TextRun } from "../models/content/content.schema";
import type { Mark } from "../models/content/marks/mark.models";
import {
  addMark,
  getPlainText,
  joinContent,
  normalizeContent,
  removeMark,
  splitContent,
} from "./content.utils";

const bold: Mark = { type: "bold" };
const italic: Mark = { type: "italic" };
const link: Mark = { type: "link", href: "https://example.com" };

describe("normalizeContent()", () => {
  it("removes the runs without text", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "", marks: [bold] },
      { text: "Hello", marks: [] },
      { text: "", marks: [] },
    ];

    // Assert
    expect(normalizeContent(content)).toStrictEqual([{ text: "Hello", marks: [] }]);
  });

  it("returns an empty array when no run has text", () => {
    // Assert
    expect(normalizeContent([{ text: "", marks: [] }])).toStrictEqual([]);
  });

  it("merges neighbouring runs with the same marks", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [bold, italic] },
      { text: "world", marks: [italic, bold] },
      { text: "!", marks: [] },
    ];

    // Assert
    expect(normalizeContent(content)).toStrictEqual([
      { text: "Hello world", marks: [bold, italic] },
      { text: "!", marks: [] },
    ]);
  });

  it("keeps neighbouring runs separate when their links point to different addresses", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "first", marks: [{ type: "link", href: "https://first.com" }] },
      { text: "second", marks: [{ type: "link", href: "https://second.com" }] },
    ];

    // Assert
    expect(normalizeContent(content)).toStrictEqual(content);
  });

  it("merges runs that become neighbours after an empty run between them is removed", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [bold] },
      { text: "", marks: [] },
      { text: "world", marks: [bold] },
    ];

    // Assert
    expect(normalizeContent(content)).toStrictEqual([
      { text: "Hello world", marks: [bold] },
    ]);
  });

  it("sorts the marks of each run and keeps one mark per type", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello", marks: [link, italic, bold, italic] },
    ];

    // Assert
    expect(normalizeContent(content)).toStrictEqual([
      { text: "Hello", marks: [bold, italic, link] },
    ]);
  });

  it("does not change the content passed to it", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [bold] },
      { text: "world", marks: [bold] },
    ];

    const contentCopy = structuredClone(content);

    // Act
    normalizeContent(content);

    // Assert
    expect(content).toStrictEqual(contentCopy);
  });
});

describe("getPlainText()", () => {
  it("joins the text of every run and drops the marks", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [] },
      { text: "world", marks: [bold, link] },
      { text: "!", marks: [italic] },
    ];

    // Assert
    expect(getPlainText(content)).toBe("Hello world!");
  });

  it("returns an empty string for empty content", () => {
    // Assert
    expect(getPlainText([])).toBe("");
  });
});

describe("splitContent()", () => {
  const content: TextRun[] = [
    { text: "Hello ", marks: [] },
    { text: "world", marks: [bold, italic] },
    { text: "!", marks: [link] },
  ];

  it("splits a run in two and keeps its marks on both halves", () => {
    // Assert
    expect(splitContent(content, 8)).toStrictEqual([
      [
        { text: "Hello ", marks: [] },
        { text: "wo", marks: [bold, italic] },
      ],
      [
        { text: "rld", marks: [bold, italic] },
        { text: "!", marks: [link] },
      ],
    ]);
  });

  it("splits between two runs without cutting either of them", () => {
    // Assert
    expect(splitContent(content, 6)).toStrictEqual([
      [{ text: "Hello ", marks: [] }],
      [
        { text: "world", marks: [bold, italic] },
        { text: "!", marks: [link] },
      ],
    ]);
  });

  it("puts all of the content in the second part when the offset is at the start", () => {
    // Assert
    expect(splitContent(content, 0)).toStrictEqual([[], content]);
  });

  it("puts all of the content in the first part when the offset is at the end", () => {
    // Assert
    expect(splitContent(content, 12)).toStrictEqual([content, []]);
  });

  it("keeps the link address on both halves when it splits a link", () => {
    // Arrange
    const linkContent: TextRun[] = [{ text: "example", marks: [link] }];

    // Assert
    expect(splitContent(linkContent, 3)).toStrictEqual([
      [{ text: "exa", marks: [link] }],
      [{ text: "mple", marks: [link] }],
    ]);
  });

  it("returns two empty parts for empty content", () => {
    // Assert
    expect(splitContent([], 0)).toStrictEqual([[], []]);
  });
});

describe("joinContent()", () => {
  it("merges the touching runs when they have the same marks", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [] },
      { text: "wo", marks: [bold] },
    ];

    const otherContent: TextRun[] = [
      { text: "rld", marks: [bold] },
      { text: "!", marks: [] },
    ];

    // Assert
    expect(joinContent(content, otherContent)).toStrictEqual([
      { text: "Hello ", marks: [] },
      { text: "world", marks: [bold] },
      { text: "!", marks: [] },
    ]);
  });

  it("keeps the touching runs separate when they have different marks", () => {
    // Arrange
    const content: TextRun[] = [{ text: "Hello ", marks: [bold] }];
    const otherContent: TextRun[] = [{ text: "world", marks: [italic] }];

    // Assert
    expect(joinContent(content, otherContent)).toStrictEqual([
      { text: "Hello ", marks: [bold] },
      { text: "world", marks: [italic] },
    ]);
  });

  it("gives back the original content after splitting it", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [] },
      { text: "world", marks: [bold, link] },
    ];

    // Act
    const [contentBeforeOffset, contentAfterOffset] = splitContent(content, 8);

    // Assert
    expect(joinContent(contentBeforeOffset, contentAfterOffset)).toStrictEqual(
      content,
    );
  });
});

describe("addMark()", () => {
  it("adds the mark only to the text in the range", () => {
    // Arrange
    const content: TextRun[] = [{ text: "Hello world", marks: [] }];

    // Assert
    expect(addMark(content, 6, 11, bold)).toStrictEqual([
      { text: "Hello ", marks: [] },
      { text: "world", marks: [bold] },
    ]);
  });

  it("keeps the marks the text already has", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [italic] },
      { text: "world", marks: [] },
    ];

    // Assert
    expect(addMark(content, 3, 8, bold)).toStrictEqual([
      { text: "Hel", marks: [italic] },
      { text: "lo ", marks: [bold, italic] },
      { text: "wo", marks: [bold] },
      { text: "rld", marks: [] },
    ]);
  });

  it("merges the text with its neighbours when they already have the mark", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [bold] },
      { text: "big", marks: [] },
      { text: " world", marks: [bold] },
    ];

    // Assert
    expect(addMark(content, 6, 9, bold)).toStrictEqual([
      { text: "Hello big world", marks: [bold] },
    ]);
  });

  it("replaces the address of a link that is already in the range", () => {
    // Arrange
    const content: TextRun[] = [{ text: "example", marks: [link] }];
    const newLink: Mark = { type: "link", href: "https://new.com" };

    // Assert
    expect(addMark(content, 0, 7, newLink)).toStrictEqual([
      { text: "example", marks: [newLink] },
    ]);
  });
});

describe("removeMark()", () => {
  it("removes the mark only from the text in the range", () => {
    // Arrange
    const content: TextRun[] = [{ text: "Hello world", marks: [bold, italic] }];

    // Assert
    expect(removeMark(content, 6, 11, "bold")).toStrictEqual([
      { text: "Hello ", marks: [bold, italic] },
      { text: "world", marks: [italic] },
    ]);
  });

  it("removes a link no matter which address it points to", () => {
    // Arrange
    const content: TextRun[] = [{ text: "example", marks: [link] }];

    // Assert
    expect(removeMark(content, 0, 7, "link")).toStrictEqual([
      { text: "example", marks: [] },
    ]);
  });

  it("leaves the content as it is when the text in the range does not have the mark", () => {
    // Arrange
    const content: TextRun[] = [
      { text: "Hello ", marks: [] },
      { text: "world", marks: [italic] },
    ];

    // Assert
    expect(removeMark(content, 0, 11, "bold")).toStrictEqual(content);
  });
});

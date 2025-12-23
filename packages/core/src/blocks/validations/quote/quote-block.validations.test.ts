import type { Block } from "../../models/block.models";
import { isQuoteBlock } from "./quote-block.validations";

describe("isQuoteBlock()", () => {
  test.each([
    ["text-block", { id: "1", type: "text", data: { text: "some_text" } }],
    [
      "heading-block",
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
      },
    ],
    [
      "toggle-list-block",
      { id: "1", type: "toggle-list", data: { open: true }, children: [] },
    ],
    ["quote1-block", { id: "1", type: "quote1", data: { text: "some_text" } }],
  ])("returns false if the block type is not `quote` - %s", (_, block) => {
    // Arrange
    const typedBlock = block as unknown as Block;

    // Assert
    expect(isQuoteBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "quote",
    } as unknown as Block;

    // Assert
    expect(isQuoteBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], ["some_data"]])(
    "returns false if the block's data property is not an object but `%s`",
    data => {
      // Arrange
      const block = {
        id: "1",
        type: "quote",
        data,
      } as unknown as Block;

      // Assert
      expect(isQuoteBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object is empty", () => {
    // Arrange
    const block = {
      id: "1",
      type: "quote",
      data: {},
    } as unknown as Block;

    // Assert
    expect(isQuoteBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have a text property inside it", () => {
    // Arrange
    const block = {
      id: "1",
      type: "quote",
      data: { other: "some_text" },
    } as unknown as Block;

    // Assert
    expect(isQuoteBlock(block)).toBe(false);
  });

  it("returns false if the data object has more than 1 property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "quote",
      data: { text: "some_text", extra: "extra" },
    } as unknown as Block;

    // Assert
    expect(isQuoteBlock(block)).toBe(false);
  });

  it("returns false if the block has children", () => {
    // Arrange
    const block = {
      id: "1",
      type: "quote",
      data: { text: "some_text" },
      parentId: "root",
      children: [],
    } as unknown as Block;

    // Assert
    expect(isQuoteBlock(block)).toBe(false);
  });

  it("returns true if the block is valid", () => {
    // Arrange
    const block: Block = {
      id: "1",
      type: "quote",
      data: { text: "some_text" },
      parentId: "root",
    };

    // Assert
    expect(isQuoteBlock(block)).toBe(true);
  });
});

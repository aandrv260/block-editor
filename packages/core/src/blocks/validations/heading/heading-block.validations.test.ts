import type { Block, HeadingBlock } from "../../models/block.models";
import { isHeadingBlock } from "./heading-block.validations";

describe("isHeadingBlock()", () => {
  test.each([
    [
      "text-block",
      { id: "1", type: "text", data: { text: "some_text" }, children: [] },
    ],

    [
      "toggle-list-block",
      { id: "1", type: "toggle-list", data: { open: true }, children: [] },
    ],

    [
      "heading1-block",
      { id: "1", type: "heading1", data: { text: "some_text", level: 1 } },
    ],
  ])("returns false if the block type is not `heading` - %s", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    // Assert
    expect(isHeadingBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
    } as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], ["some_data"]])(
    "returns false if the block's data property is not an object but `%s`",
    data => {
      // Arrange
      const block = {
        id: "1",
        type: "heading",
        data: data,
      } as unknown as Block;

      // Assert
      expect(isHeadingBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object is empty", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
      data: {},
    } as unknown as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have a level property inside it", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
      data: { text: "some_text" },
    } as unknown as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have a text property inside it", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
      data: { level: 1 },
    } as unknown as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  test.each([[0], [4], [5], [6]])(
    "returns false if the heading level is not equal to one of the allowed numbers",
    level => {
      // Arrange
      const block = {
        id: "1",
        type: "heading",
        data: { text: "some_text", level },
      } as unknown as Block;

      // Assert
      expect(isHeadingBlock(block)).toBe(false);
    },
  );

  test.each([[1], [true], [null], [{}]])(
    "returns false if the heading text is not a string - `%s`",
    text => {
      // Arrange
      const block = {
        id: "1",
        type: "heading",
        data: { text, level: 1 },
      } as unknown as Block;

      // Assert
      expect(isHeadingBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object has more than 2 properties", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
      data: { text: "some_text", level: 1, extra: "extra" },
    } as unknown as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  test.each([
    [3, { id: "1", type: "heading", data: { text: "some_text", level: 1 } }],
    [
      5,
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
        extraField: "extra_field",
      },
    ],
  ])(
    "returns false if the total number of fields in the block is not 4 but `%s`",
    (_, block) => {
      // Assert
      expect(isHeadingBlock(block as Block)).toBe(false);
    },
  );

  it("returns false if the block has children", () => {
    // Arrange
    const block = {
      id: "1",
      type: "heading",
      data: { text: "some_text", level: 1 },
      parentId: "root",
      children: [],
    } as Block;

    // Assert
    expect(isHeadingBlock(block)).toBe(false);
  });

  test.each([
    [
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
      },
    ],

    [
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
      },
    ],

    [
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
      },
    ],
  ] satisfies [HeadingBlock][])("returns true if the block is valid", block => {
    expect(isHeadingBlock(block)).toBe(true);
  });
});

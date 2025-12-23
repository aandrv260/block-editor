import type {
  Block,
  HeadingBlock,
  TextBlock,
  ToggleListBlock,
} from "../../models/block.models";
import { isTextBlock } from "./text-block.validations";

describe("isTextBlock()", () => {
  test.each([
    [
      "heading-block",
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
      } satisfies HeadingBlock,
    ],
    [
      "toggle-list-block",
      {
        id: "1",
        type: "toggle-list",
        data: { open: true },
        parentId: "root",
        children: [],
      } satisfies ToggleListBlock,
    ],
    ["text1-block", { id: "1", type: "text1", data: { text: "some_text" } }],
  ])("returns false if the block type is not `text` but `%s`", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    // Assert
    expect(isTextBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      parentId: "parent",
    } as Block;

    // Assert
    expect(isTextBlock(block)).toBe(false);
  });

  test.each([
    [1, { id: "id", type: "text", data: 1, parentId: "parent" }],
    [true, { id: "id", type: "text", data: true, parentId: "parent" }],
    [null, { id: "id", type: "text", data: null, parentId: "parent" }],
  ])(
    "returns false if the block's data property is not an object but `%s`",
    (_, block) => {
      // Arrange
      const typedBlock = block as unknown as Block;

      // Assert
      expect(isTextBlock(typedBlock)).toBe(false);
    },
  );

  it("returns false if the data object is empty", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      data: {},
      parentId: "parent",
    } as Block;

    // Assert
    expect(isTextBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have a text property inside it", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      data: { text1: "some_text" },
      parentId: "parent",
    } as unknown as Block;

    // Assert
    expect(isTextBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block text is not a string but `%s`",
    text => {
      // Arrange
      const block = {
        id: "id",
        type: "text",
        data: { text },
        parentId: "parent",
      } as unknown as Block;

      // Assert
      expect(isTextBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object has more than 1 property", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      data: { text: "some_text", extra: "extra" },
      parentId: "parent",
    } as Block;

    // Assert
    expect(isTextBlock(block)).toBe(false);
  });

  it("returns false if the block has children", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
      children: [],
    };

    // Assert
    expect(isTextBlock(block)).toBe(false);
  });

  test.each([
    [3, { id: "id", type: "text", data: { text: "some_text" } }],
    [
      5,
      {
        id: "id",
        type: "text",
        data: { text: "some_text" },
        parentId: "parent",
        extraField: "extra_field",
      },
    ],
  ])(
    "returns false if the total number of fields in the block is not 4 but `%s`",
    (_, block) => {
      // Assert
      expect(isTextBlock(block as Block)).toBe(false);
    },
  );

  it("returns true if the block is valid", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
    };

    // Assert
    expect(isTextBlock(block)).toBe(true);
  });
});

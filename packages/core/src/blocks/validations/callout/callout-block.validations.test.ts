import type { Block, CalloutBlock, HeadingBlock } from "../../models/block.models";
import { isCalloutBlock } from "./callout-block.validations";

describe("isCalloutBlock()", () => {
  test.each([
    [
      "text-block",
      {
        id: "1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
    ],
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
      },
    ],
    [
      "callout1-block",
      { id: "1", type: "callout1", data: { text: "some_text" }, parentId: "root" },
    ],
  ])("returns false if the block type is not `callout` - %s", (_, block) => {
    // Arrange
    const typedBlock = block as unknown as Block;

    // Assert
    expect(isCalloutBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "callout",
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isCalloutBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null]])(
    "returns false if the block's data property is not an object but `%s`",
    data => {
      // Arrange
      const typedBlock = {
        id: "1",
        type: "callout",
        data,
        parentId: "root",
      } as unknown as Block;

      // Assert
      expect(isCalloutBlock(typedBlock)).toBe(false);
    },
  );

  it("returns false if the data object is empty", () => {
    // Arrange
    const block = {
      id: "1",
      type: "callout",
      data: {},
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isCalloutBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have a text property inside it", () => {
    // Arrange
    const block = {
      id: "1",
      type: "callout",
      data: { text1: "some_text" },
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isCalloutBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block text is not a string but `%s`",
    text => {
      // Arrange
      const block = {
        id: "1",
        type: "callout",
        data: { text },
        parentId: "root",
      } as unknown as Block;

      // Assert
      expect(isCalloutBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object has more than 1 property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "callout",
      data: { text: "some_text", extra: "extra" },
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isCalloutBlock(block)).toBe(false);
  });

  it("returns false if the block has children", () => {
    // Arrange
    const block: CalloutBlock = {
      id: "1",
      type: "callout",
      data: { text: "some_text" },
      parentId: "root",
      children: [],
    };

    // Assert
    expect(isCalloutBlock(block)).toBe(false);
  });

  test.each([
    [
      3,
      {
        id: "1",
        type: "callout",
        data: { text: "some_text" },
      },
    ],
    [
      5,
      {
        id: "1",
        type: "callout",
        data: { text: "some_text" },
        parentId: "root",
        extraField: "extra_field",
      },
    ],
  ])(
    "returns false if the total number of fields in the block is not 4 but `%s`",
    (_, block) => {
      // Assert
      expect(isCalloutBlock(block as Block)).toBe(false);
    },
  );

  it("returns true if the block is valid", () => {
    // Arrange
    const block: CalloutBlock = {
      id: "1",
      type: "callout",
      data: { text: "some_text" },
      parentId: "root",
    };

    // Assert
    expect(isCalloutBlock(block)).toBe(true);
  });
});

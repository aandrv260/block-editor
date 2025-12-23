import type {
  Block,
  BulletListBlock,
  HeadingBlock,
  TextBlock,
  ToggleListBlock,
} from "../../models/block.models";
import { isBulletListBlock } from "./bullet-list-block.validations";

describe("isBulletListBlock()", () => {
  test.each([
    [
      "text-block",
      {
        id: "1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      } satisfies TextBlock,
    ],
    [
      "heading-block",
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "root",
        children: [],
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
    [
      "bullet-list1-block",
      { id: "1", type: "bullet-list1", data: { text: "some_text" } },
    ],
  ])("returns false if the block type is not `bullet-list` but `%s`", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    // Assert
    expect(isBulletListBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "bullet-list",
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isBulletListBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block's data property is not an object but `%s`",
    data => {
      // Arrange
      const block = {
        id: "1",
        type: "bullet-list",
        data,
        parentId: "root",
      } as unknown as Block;

      // Assert
      expect(isBulletListBlock(block)).toBe(false);
    },
  );

  test.each([
    [{ extra: "extra" }],
    [{ text: "some_text" }],
    [{ field1: "value1", field2: "value2" }],
  ])("returns false if the data object has any properties - %s", data => {
    // Arrange
    const block = {
      id: "1",
      type: "bullet-list",
      data,
      parentId: "root",
      children: [],
    } as unknown as Block;

    // Assert
    expect(isBulletListBlock(block)).toBe(false);
  });

  it("returns false if the block has no children", () => {
    // Arrange
    const block = {
      id: "1",
      type: "bullet-list",
      data: {},
      parentId: "root",
    } as unknown as Block;

    // Assert
    expect(isBulletListBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block has invalid children",
    children => {
      // Arrange
      const block = {
        id: "1",
        type: "bullet-list",
        data: {},
        parentId: "root",
        children,
      } as unknown as Block;

      // Assert
      expect(isBulletListBlock(block)).toBe(false);
    },
  );

  test.each([
    [3, { id: "1", type: "bullet-list", data: {} }],
    [
      6,
      {
        id: "1",
        type: "bullet-list",
        data: {},
        parentId: "root",
        children: [],
        extraField: "extra_field",
      },
    ],
  ])(
    "returns false if the total number of fields in the block is not 5 but `%s`",
    (_, block) => {
      // Assert
      expect(isBulletListBlock(block as unknown as Block)).toBe(false);
    },
  );

  it("returns true if the block is valid", () => {
    // Arrange
    const block: BulletListBlock = {
      id: "1",
      type: "bullet-list",
      data: {},
      parentId: "root",
      children: [],
    };

    // Assert
    expect(isBulletListBlock(block)).toBe(true);
  });
});

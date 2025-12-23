import type { Block, ToggleListBlock } from "../../models/block.models";
import { isToggleListBlock } from "./toggle-list-block.validations";

describe("isToggleListBlock()", () => {
  test.each([
    ["text-block", { id: "1", type: "text", data: { text: "some_text" } }],
    [
      "heading-block",
      {
        id: "1",
        type: "heading",
        data: { text: "some_text", level: 1 },
        children: [],
      },
    ],
    [
      "toggle-list1-block",
      { id: "1", type: "toggle-list1", data: { open: true }, children: [] },
    ],
  ])("returns false if the block type is not `text` - %s", (_, block) => {
    // Arrange
    const typedBlock = block as unknown as Block;

    // Assert
    expect(isToggleListBlock(typedBlock)).toBe(false);
  });

  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "toggle-list",
      children: [],
    } as unknown as Block;

    // Assert
    expect(isToggleListBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block's data property is not an object but `%s`",
    data => {
      // Arrange
      const block = {
        id: "1",
        type: "toggle-list",
        data,
        children: [],
      } as unknown as Block;

      // Assert
      expect(isToggleListBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object is empty", () => {
    // Arrange
    const block = {
      id: "1",
      type: "toggle-list",
      data: {},
      children: [],
    } as unknown as Block;

    // Assert
    expect(isToggleListBlock(block)).toBe(false);
  });

  it("returns false if the data object does not have an `open` property inside it", () => {
    // Arrange
    const block = {
      id: "1",
      type: "toggle-list",
      data: { closed: true },
      children: [],
    } as unknown as Block;

    // Assert
    expect(isToggleListBlock(block)).toBe(false);
  });

  test.each([[1], [{}]])(
    "returns false if the block's open property is not a boolean",
    open => {
      // Arrange
      const block = {
        id: "1",
        type: "toggle-list",
        data: { open },
        children: [],
      } as unknown as Block;

      // Assert
      expect(isToggleListBlock(block)).toBe(false);
    },
  );

  it("returns false if the data object has more than 1 property", () => {
    // Arrange
    const block = {
      id: "1",
      type: "toggle-list",
      data: { open: true, extra: "extra" },
      children: [],
    } as unknown as Block;

    // Assert
    expect(isToggleListBlock(block)).toBe(false);
  });

  it("returns false if the block has no children", () => {
    // Arrange
    const block = {
      id: "1",
      type: "toggle-list",
      data: { open: true },
    } as unknown as Block;

    // Assert
    expect(isToggleListBlock(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the block has invalid children",
    children => {
      // Arrange
      const block = {
        id: "1",
        type: "toggle-list",
        data: { open: true },
        children,
      } as unknown as Block;

      // Assert
      expect(isToggleListBlock(block)).toBe(false);
    },
  );

  test.each([
    [4, { id: "1", type: "toggle-list", data: { open: true }, children: [] }],
    [
      6,
      {
        id: "1",
        type: "toggle-list",
        data: { open: true },
        parentId: "root",
        children: [],
        extraField: "extra_field",
      },
    ],
  ])(
    "returns false if the total number of fields in the block is not 5 but `%s`",
    (_, block) => {
      // Assert
      expect(isToggleListBlock(block as unknown as Block)).toBe(false);
    },
  );

  it("returns true if the block is valid", () => {
    // Arrange
    const block: ToggleListBlock = {
      id: "1",
      type: "toggle-list",
      data: { open: true },
      parentId: "root",
      children: [],
    };

    // Assert
    expect(isToggleListBlock(block)).toBe(true);
  });
});

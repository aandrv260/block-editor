import type { TextBlock } from "../../models/block.models";
import { hasChildren, hasValidChildren } from "./children.validations";

describe("hasValidChildren()", () => {
  it("returns false if the block has no children property", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
    };

    // Assert
    expect(hasValidChildren(block)).toBe(false);
  });

  test.each([[1], [true], [{}], [undefined]])(
    "returns false if the children property is not an array - %s",
    children => {
      // Arrange
      const block = {
        id: "id",
        type: "text",
        data: { text: "some_text" },
        parentId: "parent",
        children,
      } as TextBlock;

      // Assert
      expect(hasValidChildren(block)).toBe(false);
    },
  );

  it("returns true if the block has a children property", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
      children: [],
    };

    // Assert
    expect(hasValidChildren(block)).toBe(true);
  });
});

describe("hasChildren()", () => {
  it("returns true if the block has a children property", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
      children: [],
    };

    // Assert
    expect(hasChildren(block)).toBe(true);
  });

  it("returns false if the block has no children property", () => {
    // Arrange
    const block: TextBlock = {
      id: "id",
      type: "text",
      data: { text: "some_text" },
      parentId: "parent",
    };

    // Assert
    expect(hasChildren(block)).toBe(false);
  });
});

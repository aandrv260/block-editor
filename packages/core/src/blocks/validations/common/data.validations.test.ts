import type { Block } from "../../models/block.models";
import {
  hasDataProperty,
  hasValidDataFieldCount,
  hasValidTotalFieldCount,
  hasValidText,
} from "./data.validations";

describe("hasDataProperty()", () => {
  it("returns false if the block has no data property", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      parentId: "parent",
    } as Block;

    // Assert
    expect(hasDataProperty(block)).toBe(false);
  });

  test.each([[1], [true], [null], [undefined], ["some_string"]])(
    "returns false if the block has a data property that is not an object but `%s`",
    data => {
      // Arrange
      const block = {
        data,
      };

      // Assert
      expect(hasDataProperty(block)).toBe(false);
    },
  );

  it("returns true if the block has a data property that is an object", () => {
    // Arrange
    const block = {
      data: { text: "some_text" },
    };

    // Assert
    expect(hasDataProperty(block)).toBe(true);
  });
});

describe("hasValidDataFieldCount()", () => {
  it("returns true if the data has the correct number of fields", () => {
    // Arrange
    const block = {
      data: {
        text: "some_text",
      },
    } as Block;

    // Assert
    expect(hasValidDataFieldCount(block, 1)).toBe(true);
  });

  test.each([[0], [2]])(
    "returns false if the data has the incorrect number of fields - %s",
    numberOfFields => {
      // Arrange
      const block = {
        data: { text: "some_text" },
      } as Block;

      // Assert
      expect(hasValidDataFieldCount(block, numberOfFields)).toBe(false);
    },
  );
});

describe("hasValidTotalFieldCount()", () => {
  it("returns true if the data has the correct number of fields", () => {
    // Arrange
    const block = {
      id: "id",
      type: "text",
      parentId: "parent",
    } as Block;

    // Assert
    expect(hasValidTotalFieldCount(block, 3)).toBe(true);
  });

  test.each([[0], [2]])(
    "returns false if the data has the incorrect number of fields - %s",
    numberOfFields => {
      // Arrange
      const block = {
        id: "id",
        type: "text",
        parentId: "parent",
      } as Block;

      // Assert
      expect(hasValidTotalFieldCount(block, numberOfFields)).toBe(false);
    },
  );
});

describe("hasValidText()", () => {
  it("returns false if the data object does not have a text property", () => {
    // Arrange
    const block = {
      data: { other: "some_text" },
    } as unknown as Block;

    // Assert
    expect(hasValidText(block)).toBe(false);
  });

  test.each([[1], [true], [null], [{}]])(
    "returns false if the text property is not a string - %s",
    text => {
      // Arrange
      const block = {
        data: { text },
      } as Block;

      // Assert
      expect(hasValidText(block)).toBe(false);
    },
  );

  it("returns true if the text property is a string", () => {
    // Arrange
    const block = {
      data: { text: "some_text" },
    } as Block;

    // Assert
    expect(hasValidText(block)).toBe(true);
  });
});

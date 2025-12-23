import type { Block } from "@/blocks/models/block.models";
import {
  getIndexOfBlockToUpdateInParent,
  isUpdatePayloadIdInvalid,
} from "./update-block.utils";
import type { BlockMap } from "../../models/document.models";
import { BlockToUpdateHasNoParentError } from "../../errors/update-block";
import { assertEngineError } from "../../../errors/test-utils/error-test.utils";

describe("isUpdatePayloadIdInvalid()", () => {
  // No need of Block type here because for testing purposes we need only the ID.
  const createMap = (entries: [string, object][]): BlockMap => {
    const map: BlockMap = new Map(entries as [string, Block][]);
    return map;
  };

  it("returns true if the payload block has ID that is in the map and is not equal to the old block's ID", () => {
    // Arrange
    const map: BlockMap = createMap([
      ["1", {}],
      ["2", {}],
    ]);

    // Assert
    expect(isUpdatePayloadIdInvalid("1", "2", map)).toBe(true);
  });

  it("returns false if the old block and the new block's IDs are the same", () => {
    // Arrange
    const map: BlockMap = createMap([
      ["1", {}],
      ["2", {}],
    ]);

    // Assert
    expect(isUpdatePayloadIdInvalid("1", "1", map)).toBe(false);
  });

  it("returns false if the new block's ID is not the same as the old block's ID and the new block's ID is not already in the map", () => {
    // Arrange
    const map: BlockMap = createMap([
      ["1", {}],
      ["2", {}],
    ]);

    // Assert
    expect(isUpdatePayloadIdInvalid("1", "3", map)).toBe(false);
  });
});

describe("getIndexOfBlockToUpdateInParent()", () => {
  it("throws an error if the old block is not found in the parent's children array", () => {
    // Arrange
    const parentChildren: Block[] = [
      {
        id: "1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
      {
        id: "2",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
    ];

    const blockToReplaceId = "3";
    const parentId = "root";

    const tryGetIndex = () =>
      getIndexOfBlockToUpdateInParent(parentChildren, blockToReplaceId, parentId);

    // Assert
    assertEngineError(tryGetIndex, {
      ExpectedErrorClass: BlockToUpdateHasNoParentError,
      expectedCode: "DOCUMENT:BLOCK_TO_UPDATE_HAS_NO_PARENT",
      expectedMessage: `The block with ID ${blockToReplaceId} you're trying to update does not have a parent! Parent ID: ${parentId}`,
      expectedContext: {
        blockId: blockToReplaceId,
        parentId: parentId,
      },
    });
  });

  test.each([
    ["1", 0],
    ["2", 1],
  ])(
    "returns the index of the block to update in the parent's children array",
    (blockToReplaceId, expectedIndex) => {
      // Arrange
      const parentChildren: Block[] = [
        {
          id: "1",
          type: "text",
          data: { text: "some_text" },
          parentId: "root",
        },
        {
          id: "2",
          type: "text",
          data: { text: "some_text" },
          parentId: "root",
        },
      ];

      const parentId = "root";

      // Act
      const index = getIndexOfBlockToUpdateInParent(
        parentChildren,
        blockToReplaceId,
        parentId,
      );

      // Assert
      expect(index).toBe(expectedIndex);
    },
  );
});

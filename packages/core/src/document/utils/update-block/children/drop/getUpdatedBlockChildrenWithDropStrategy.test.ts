import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK5,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
} from "../../../document-test.utils";
import { getUpdatedBlockChildrenWithDropStrategy } from "../drop/getUpdatedBlockChildrenWithDropStrategy";
import type { GetUpdatedChildrenContext } from "../update-block-children.models";

describe("getUpdatedBlockChildrenWithDropStrategy()", () => {
  it("returns an empty array if the old block cannot have children and the new block can have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: TOGGLE_LIST1_BLOCK,
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithDropStrategy(ctx);

    // Assert
    expect(newChildren).toEqual([]);
  });

  it("returns an empty array if both the old block and the new block can have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: TOGGLE_LIST2_BLOCK,
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithDropStrategy(ctx);

    // Assert
    expect(newChildren).toEqual([]);
    expect(newChildren).not.toBe(ctx.payload.children);
  });

  it("returns an empty array even if the payload has children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: {
        ...TOGGLE_LIST2_BLOCK,
        children: [TOGGLE_LIST3_BLOCK, TOGGLE_LIST4_BLOCK],
      },
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithDropStrategy(ctx);

    // Assert
    expect(newChildren).toEqual([]);
  });

  it("returns undefined if the old block can have children but new block can't", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: SAMPLE_BLOCK5,
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithDropStrategy(ctx);

    // Assert
    expect(newChildren).toBe(undefined);
  });

  it("returns undefined if the old and the new blocks cannot have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: SAMPLE_BLOCK5,
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithDropStrategy(ctx);

    // Assert
    expect(newChildren).toBe(undefined);
  });
});

import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
} from "../../document-test.utils";
import type { GetUpdatedChildrenContext } from "./update-block-children.models";
import { resolveChildren } from "./update-block-children.utils";

describe("resolveChildren()", () => {
  it("drops the children if the strategy is drop", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [
          {
            ...TOGGLE_LIST2_BLOCK,
            parentId: TOGGLE_LIST1_BLOCK.id,
            children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
          },
        ],
      },

      payload: TOGGLE_LIST4_BLOCK,
    };

    // Act
    const newChildren = resolveChildren("drop", ctx);

    // Assert
    expect(newChildren).toEqual([]);
    expect(newChildren).not.toBe(ctx.blockToReplace.children);
  });

  it("returns undefined when the user wants to drop the children but both the old and new blocks cannot have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: SAMPLE_BLOCK2,
    };

    // Act
    const newChildren = resolveChildren("drop", ctx);

    // Assert
    expect(newChildren).toBe(undefined);
    expect(newChildren).toBe(ctx.blockToReplace.children);
  });

  it("preserves the children if the strategy is preserve", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [
          {
            ...TOGGLE_LIST2_BLOCK,
            parentId: TOGGLE_LIST1_BLOCK.id,
            children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
          },
        ],
      },

      payload: TOGGLE_LIST4_BLOCK,
    };

    // Act
    const newChildren = resolveChildren("preserve", ctx);

    // Assert
    expect(newChildren).toEqual(ctx.blockToReplace.children);
    expect(newChildren).not.toBe(ctx.blockToReplace.children);
  });

  it("returns undefined when the user wants to preserve the children but both old and new blocks cannot have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: SAMPLE_BLOCK2,
    };

    // Act
    const newChildren = resolveChildren("preserve", ctx);

    // Assert
    expect(newChildren).toBe(undefined);
    expect(newChildren).toBe(ctx.blockToReplace.children);
  });

  it("returns a deep copy of the payload children if the strategy is replace", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [
          {
            ...TOGGLE_LIST2_BLOCK,
            parentId: TOGGLE_LIST1_BLOCK.id,
            children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
          },
        ],
      },

      payload: {
        ...TOGGLE_LIST4_BLOCK,
        children: [
          { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK4, SAMPLE_BLOCK5] },
          SAMPLE_BLOCK6,
        ],
      },
    };

    // Act
    const newChildren = resolveChildren("replace", ctx);

    // Assert
    expect(newChildren).toEqual(ctx.payload.children);
    expect(newChildren).not.toBe(ctx.payload.children);
  });
});

import type { Block } from "@/blocks/models/block.models";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
} from "../../../document-test.utils";
import { assertEngineError } from "../../../../../errors/test-utils/error-test.utils";
import { DocumentErrorCode } from "../../../../errors/DocumentErrorCode";
import {
  CannotPreserveChildrenOnTargetBlockError,
  CannotPreserveFromChildlessSourceBlockError,
} from "../../../../errors/update-block";
import { getUpdatedBlockChildrenWithPreserveStrategy } from "./getUpdatedBlockChildrenWithPreserveStrategy";
import type { GetUpdatedChildrenContext } from "../update-block-children.models";

describe("getUpdatedBlockChildrenWithPreserveStrategy()", () => {
  it("throws an error if the old block can have children but the nw block cannot", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: SAMPLE_BLOCK1,
    };

    const tryUpdate = () => void getUpdatedBlockChildrenWithPreserveStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: CannotPreserveChildrenOnTargetBlockError,
      expectedCode:
        DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to preserve the old block's children but the new block cannot have children!",
    });
  });

  it("throws an error if the old block cannot have children but the new block can", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: TOGGLE_LIST1_BLOCK,
    };

    const tryUpdate = () => void getUpdatedBlockChildrenWithPreserveStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: CannotPreserveFromChildlessSourceBlockError,
      expectedCode:
        DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to preserve the old block's children when the old block cannot have children and the new block can. This is an invalid operation. Please consider using `replace` strategy instead!",
    });
  });

  test.each([
    ["empty", []],
    ["not empty", [{ ...TOGGLE_LIST3_BLOCK, children: [SAMPLE_BLOCK2] }]],
  ])(
    "returns the old block's children if the validation passes and the old block's children are %s",
    (_, oldBlockChildren) => {
      // Arrange
      const ctx: GetUpdatedChildrenContext = {
        blockToReplace: {
          ...TOGGLE_LIST1_BLOCK,
          children: oldBlockChildren as Block[],
          parentId: "root",
        },
        payload: TOGGLE_LIST2_BLOCK,
      };

      // Act
      const newChildren = getUpdatedBlockChildrenWithPreserveStrategy(ctx);

      // Assert
      expect(newChildren).toEqual(ctx.blockToReplace.children);
      expect(newChildren).not.toBe(ctx.blockToReplace.children);
    },
  );

  it("returns undefined if both the old and the new block cannot have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: SAMPLE_BLOCK2,
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithPreserveStrategy(ctx);

    // Assert
    expect(newChildren).toBe(undefined);
    expect(newChildren).toBe(ctx.blockToReplace.children);
  });
});

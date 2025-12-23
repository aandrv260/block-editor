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
  ReplaceStrategyMissingNewChildrenError,
  ReplaceStrategyNotApplicableError,
  ReplaceStrategySourceHasNoChildrenError,
  ReplaceStrategyTargetCannotHaveChildrenError,
} from "../../../../errors/update-block";
import { getUpdatedBlockChildrenWithReplaceStrategy } from "../replace/getUpdatedBlockChildrenWithReplaceStrategy";
import type { GetUpdatedChildrenContext } from "../update-block-children.models";

describe("getUpdatedBlockChildrenWithReplaceStrategy()", () => {
  it("throws an error if both the old and the new block cannot have children", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK1, parentId: "root" },
      payload: SAMPLE_BLOCK2,
    };

    const tryUpdate = () => getUpdatedBlockChildrenWithReplaceStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyNotApplicableError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_BOTH_BLOCKS_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "The current and the new block cannot have children so you cannot use the replace strategy!",
    });
  });

  it("throws an error if the old block cannot have children but the new one can", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: SAMPLE_BLOCK2,
    };

    const tryUpdate = () => getUpdatedBlockChildrenWithReplaceStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyTargetCannotHaveChildrenError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to replace the old block's children but the new block cannot have children!",
    });
  });

  it("throws an error if the old block can have children but the new one cannot", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...SAMPLE_BLOCK2, parentId: "root" },
      payload: TOGGLE_LIST1_BLOCK,
    };

    const tryUpdate = () => getUpdatedBlockChildrenWithReplaceStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategySourceHasNoChildrenError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "The current block cannot have children but the new block can. This is illegal operation.",
    });
  });

  it("throws an error if both blocks can have children but the new block does not have children in its payload", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: {
        id: TOGGLE_LIST2_BLOCK.id,
        type: TOGGLE_LIST2_BLOCK.type,
        data: TOGGLE_LIST2_BLOCK.data,
      },
    };

    const tryUpdate = () => getUpdatedBlockChildrenWithReplaceStrategy(ctx);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyMissingNewChildrenError,
      expectedCode: DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NO_CHILDREN_PROVIDED,
      expectedMessage:
        "You are trying to replace the old block's children but you did not pass new children!",
    });
  });

  it("returns the payload children if the validation passes", () => {
    // Arrange
    const ctx: GetUpdatedChildrenContext = {
      blockToReplace: { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
      payload: {
        ...TOGGLE_LIST2_BLOCK,
        children: [{ ...TOGGLE_LIST3_BLOCK, children: [SAMPLE_BLOCK2] }],
      },
    };

    // Act
    const newChildren = getUpdatedBlockChildrenWithReplaceStrategy(ctx);

    // Assert
    expect(newChildren).toEqual(ctx.payload.children);
    expect(newChildren).not.toBe(ctx.payload.children);
  });
});

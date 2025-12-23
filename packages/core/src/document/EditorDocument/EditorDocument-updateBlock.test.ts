import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
  SAMPLE_BLOCK9,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  TOGGLE_LIST6_BLOCK,
  TOGGLE_LIST7_BLOCK,
  TOGGLE_LIST8_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { DocumentErrorCode } from "../errors/DocumentErrorCode";
import {
  BlockToUpdateHasNoParentError,
  BlockToUpdateNotFoundError,
  CannotPreserveChildrenOnTargetBlockError,
  CannotPreserveFromChildlessSourceBlockError,
  CannotUpdateRootError,
  ChildBlockIdAlreadyExistsError,
  ChildBlockIdConflictsWithSubtreeRootError,
  ReplaceStrategyMissingNewChildrenError,
  ReplaceStrategyNotApplicableError,
  ReplaceStrategySourceHasNoChildrenError,
  ReplaceStrategyTargetCannotHaveChildrenError,
  UpdateBlockIDAlreadyInUseError,
} from "../errors/update-block";
import { EditorDocument } from "./EditorDocument";
import type { UpdateBlockChildrenStrategy } from "../models/document.models";
import type { BlockPayload } from "../models/document-payload.models";

describe("updateBlock()", () => {
  it("throws an error if we try to update the document root", () => {
    // Arrange
    const document = new EditorDocument();

    const tryUpdate = () =>
      document.updateBlock(EditorDocument.ROOT_ID, SAMPLE_BLOCK2);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: CannotUpdateRootError,
      expectedCode: DocumentErrorCode.CANNOT_UPDATE_ROOT,
      expectedMessage: "You cannot update document root directly!",
    });
  });

  it("throws an error if the user tries to update a block that doesn't exist in the document", () => {
    // Arrange
    const document = new EditorDocument();

    const tryUpdate = () =>
      document.updateBlock("some_not_existing_block", SAMPLE_BLOCK3);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: BlockToUpdateNotFoundError,
      expectedCode: DocumentErrorCode.BLOCK_TO_UPDATE_NOT_FOUND,
      expectedMessage:
        "The blockID you passed does not map to any id of a block currently in the document!",
      expectedContext: { blockId: "some_not_existing_block" },
    });
  });

  it("throws an error if the parentId property of the block to be updated points to a non-existing parent block", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    document.getBlock(TOGGLE_LIST2_BLOCK.id)!.parentId = "some_non_existing_parent";

    const tryUpdate = () =>
      document.updateBlock(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: BlockToUpdateHasNoParentError,
      expectedCode: DocumentErrorCode.BLOCK_TO_UPDATE_HAS_NO_PARENT,
      expectedMessage: `The block with ID ${TOGGLE_LIST2_BLOCK.id} you're trying to update does not have a parent! Parent ID: some_non_existing_parent`,
      expectedContext: {
        blockId: TOGGLE_LIST2_BLOCK.id,
        parentId: "some_non_existing_parent",
      },
    });
  });

  it("throws an error when it can't find the block in the parent's children array", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    const toggleList1Block = document.getBlock(TOGGLE_LIST1_BLOCK.id)!;

    toggleList1Block.children = toggleList1Block.children?.filter(
      child => child.id !== TOGGLE_LIST2_BLOCK.id,
    );

    const tryUpdate = () =>
      document.updateBlock(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3);

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: BlockToUpdateHasNoParentError,
      expectedCode: DocumentErrorCode.BLOCK_TO_UPDATE_HAS_NO_PARENT,
      expectedMessage: `The block with ID ${TOGGLE_LIST2_BLOCK.id} you're trying to update does not have a parent! Parent ID: ${TOGGLE_LIST1_BLOCK.id}`,
      expectedContext: {
        blockId: TOGGLE_LIST2_BLOCK.id,
        parentId: TOGGLE_LIST1_BLOCK.id,
      },
    });
  });

  it("throws an error if the user wants to replace the old children but did not pass new children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(
        TOGGLE_LIST1_BLOCK.id,
        {
          id: TOGGLE_LIST5_BLOCK.id,
          type: TOGGLE_LIST5_BLOCK.type,
          data: TOGGLE_LIST5_BLOCK.data,
        },
        { childrenStrategy: "replace" },
      );
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyMissingNewChildrenError,
      expectedCode: DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NO_CHILDREN_PROVIDED,
      expectedMessage:
        "You are trying to replace the old block's children but you did not pass new children!",
    });
  });

  it("throws an error when the user tries to preserve the children and the new block cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1, {
        childrenStrategy: "preserve",
      });
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: CannotPreserveChildrenOnTargetBlockError,
      expectedCode:
        DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to preserve the old block's children but the new block cannot have children!",
    });
  });

  it("throws an error when the user tries to replace the children but the old block can have children and the new block cannot", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1, {
        childrenStrategy: "replace",
      });
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyTargetCannotHaveChildrenError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_NEW_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to replace the old block's children but the new block cannot have children!",
    });
  });

  it("throws an error if the user tries to preserve the children of the old block but the old block cannot have children and the new block can", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryUpdate = () => {
      document.updateBlock(SAMPLE_BLOCK1.id, TOGGLE_LIST1_BLOCK, {
        childrenStrategy: "preserve",
      });
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: CannotPreserveFromChildlessSourceBlockError,
      expectedCode:
        DocumentErrorCode.CANNOT_PRESERVE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "You are trying to preserve the old block's children when the old block cannot have children and the new block can. This is an invalid operation. Please consider using `replace` strategy instead!",
    });
  });

  it("throws an error when the old block and the new one cannot have children and the user tries to replace the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryUpdate = () => {
      document.updateBlock(SAMPLE_BLOCK1.id, SAMPLE_BLOCK2, {
        childrenStrategy: "replace",
      });
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategyNotApplicableError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_BOTH_BLOCKS_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "The current and the new block cannot have children so you cannot use the replace strategy!",
    });
  });

  it("throws an error when the user tries to replace the children but the old block can't have children and the new block can", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const tryUpdate = () => {
      document.updateBlock(SAMPLE_BLOCK1.id, TOGGLE_LIST1_BLOCK, {
        childrenStrategy: "replace",
      });
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ReplaceStrategySourceHasNoChildrenError,
      expectedCode:
        DocumentErrorCode.CANNOT_REPLACE_CHILDREN_OLD_BLOCK_CANNOT_HAVE_CHILDREN,
      expectedMessage:
        "The current block cannot have children but the new block can. This is illegal operation.",
    });
  });

  it("throws an error when the user tries to replace an existing block with another block which has an ID that is already used by another block in the document and is not equal to the target block's ID", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: UpdateBlockIDAlreadyInUseError,
      expectedCode: DocumentErrorCode.UPDATE_BLOCK_ID_ALREADY_IN_USE,
      expectedMessage: `The ID of the new block you passed \`${TOGGLE_LIST2_BLOCK.id}\` is already in use by another block in the document. You can only pass an existing ID if it's the same as the target block's ID. Please change the ID.`,
      expectedContext: { blockId: TOGGLE_LIST2_BLOCK.id },
    });
  });

  it("throws if the user tries to replace the children of a block when updating but one of the nested children has an ID that is already belongs to a block in the document", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(
        TOGGLE_LIST1_BLOCK.id,
        {
          ...TOGGLE_LIST3_BLOCK,
          children: [{ ...TOGGLE_LIST4_BLOCK, children: [TOGGLE_LIST2_BLOCK] }],
        },
        { childrenStrategy: "replace" },
      );
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ChildBlockIdAlreadyExistsError,
      expectedCode: "DOCUMENT:UPDATE_BLOCK_CHILD_ID_ALREADY_EXISTS",
      expectedMessage: `You are trying to insert a child with ID \`${TOGGLE_LIST2_BLOCK.id}\`when updating the block. Another block with this ID already exists in the document!`,
      expectedContext: { childId: TOGGLE_LIST2_BLOCK.id },
    });

    // Ensure the none of the document state broke and it is the same as before calling the update method.
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        { ...TOGGLE_LIST1_BLOCK, parentId: "root", children: [] },
        { ...TOGGLE_LIST2_BLOCK, parentId: "root", children: [] },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.size).toBe(3);
    assertTreeIntegrity(document);
  });

  it("throws if the user tries to replace the children and one of the nested children has the same block ID as blockPayload.id", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    const tryUpdate = () => {
      document.updateBlock(
        TOGGLE_LIST1_BLOCK.id,
        {
          ...TOGGLE_LIST2_BLOCK,
          children: [{ ...TOGGLE_LIST3_BLOCK, children: [TOGGLE_LIST2_BLOCK] }],
        },
        { childrenStrategy: "replace" },
      );
    };

    // Assert
    assertEngineError(tryUpdate, {
      ExpectedErrorClass: ChildBlockIdConflictsWithSubtreeRootError,
      expectedCode: "DOCUMENT:UPDATE_BLOCK_CHILD_ID_EQUALS_SUBTREE_ROOT",
      expectedMessage: `Child block with ID \`${TOGGLE_LIST2_BLOCK.id}\` you are trying to insert is the same as the ID of the root of this subtree. This is an illegal operation as all IDs in the document must be unique!`,
      expectedContext: {
        childId: TOGGLE_LIST2_BLOCK.id,
        subtreeRootId: TOGGLE_LIST2_BLOCK.id,
      },
    });

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...TOGGLE_LIST1_BLOCK, parentId: "root", children: [] }],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  test.each([[undefined], ["drop"]] as [UpdateBlockChildrenStrategy | undefined][])(
    "updates the block correctly and drops the children if the provided children strategy is %s",
    childrenStrategy => {
      // Arrange
      const document = new EditorDocument();

      document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
      document.appendChild(TOGGLE_LIST1_BLOCK.id, {
        ...TOGGLE_LIST2_BLOCK,
        children: [TOGGLE_LIST3_BLOCK],
      });

      // Act
      document.updateBlock(
        TOGGLE_LIST1_BLOCK.id,
        {
          id: TOGGLE_LIST4_BLOCK.id,
          type: TOGGLE_LIST4_BLOCK.type,
          data: TOGGLE_LIST4_BLOCK.data,
        },
        childrenStrategy ? { childrenStrategy } : undefined,
      );

      // Assert
      expect(document.getRoot()).toEqual({
        id: "root",
        children: [{ ...TOGGLE_LIST4_BLOCK, parentId: "root", children: [] }],
      });

      expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
      expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
      expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
      expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
        document.getRoot().children[0],
      );

      assertTreeIntegrity(document);
    },
  );

  it("does not throw an error and updates the block successfully if the user wants to drop the children and the new block cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.updateBlock(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1, {
      childrenStrategy: "drop",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...SAMPLE_BLOCK1, parentId: "root" }],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  it("updates the block and makes the children of the new block `undefined` if the user drops the old children and the new block cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, {
      ...TOGGLE_LIST2_BLOCK,
      children: [TOGGLE_LIST3_BLOCK],
    });

    // Act
    document.updateBlock(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1, {
      childrenStrategy: "drop",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...SAMPLE_BLOCK1, parentId: "root" }],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual({
      ...SAMPLE_BLOCK1,
      parentId: "root",
    });

    expect(Object.keys(document.getBlock(SAMPLE_BLOCK1.id)!)).not.toContain(
      "children",
    );

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  it("correctly updates the block when the old block and the new one can have children and the user puts childrenStrategy to be `preserve`", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, {
      ...TOGGLE_LIST2_BLOCK,
      children: [TOGGLE_LIST3_BLOCK],
    });

    // Act
    document.updateBlock(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST4_BLOCK, {
      childrenStrategy: "preserve",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          id: TOGGLE_LIST4_BLOCK.id,
          type: TOGGLE_LIST4_BLOCK.type,
          data: TOGGLE_LIST4_BLOCK.data,
          parentId: "root",
          children: [
            {
              id: TOGGLE_LIST2_BLOCK.id,
              type: TOGGLE_LIST2_BLOCK.type,
              data: TOGGLE_LIST2_BLOCK.data,
              parentId: TOGGLE_LIST4_BLOCK.id,
              children: [
                {
                  id: TOGGLE_LIST3_BLOCK.id,
                  type: TOGGLE_LIST3_BLOCK.type,
                  data: TOGGLE_LIST3_BLOCK.data,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);
  });

  it("correctly replaces the children and keeps tree integrity no matter how deep the new subtree is", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, {
      ...TOGGLE_LIST2_BLOCK,
      children: [TOGGLE_LIST3_BLOCK],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST4_BLOCK,
        children: [
          {
            ...TOGGLE_LIST5_BLOCK,
            children: [
              { ...TOGGLE_LIST6_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
            ],
          },

          {
            id: TOGGLE_LIST7_BLOCK.id,
            type: TOGGLE_LIST7_BLOCK.type,
            data: TOGGLE_LIST7_BLOCK.data,
          },
        ],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST5_BLOCK,
              parentId: TOGGLE_LIST4_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST6_BLOCK,
                  parentId: TOGGLE_LIST5_BLOCK.id,
                  children: [
                    { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST6_BLOCK.id },
                    { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST6_BLOCK.id },
                  ],
                },
              ],
            },
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST4_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0]?.children?.[1],
    );

    expect(document.size).toBe(7);
    assertTreeIntegrity(document);
  });

  it("doesn't throw an error and correctly updates the block when the old block and the new one cannot have children and the user puts childrenStrategy to be `preserve`", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Act
    document.updateBlock(SAMPLE_BLOCK1.id, SAMPLE_BLOCK2, {
      childrenStrategy: "preserve",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...SAMPLE_BLOCK2, parentId: "root" }],
    });

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  it("correctly updates the block when the old block and the new one can have children and the user wants to replace the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
        { ...SAMPLE_BLOCK3 },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST3_BLOCK,
        children: [
          { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK5, SAMPLE_BLOCK6] },
        ],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST5_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST5_BLOCK.id },
                { ...SAMPLE_BLOCK6, parentId: TOGGLE_LIST5_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.size).toBe(5);
    assertTreeIntegrity(document);
  });

  it("allows the user to update the block passing a new block with the same ID when they try to drop the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST3_BLOCK,
        id: TOGGLE_LIST1_BLOCK.id,
      },
      { childrenStrategy: "drop" },
    );

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          id: TOGGLE_LIST1_BLOCK.id,
          parentId: "root",
          children: [],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  it("allows the user to update the block passing a new block with the same ID when they try to preserve the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        id: TOGGLE_LIST1_BLOCK.id,
        data: TOGGLE_LIST3_BLOCK.data,
        type: TOGGLE_LIST3_BLOCK.type,
      },
      { childrenStrategy: "preserve" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          id: TOGGLE_LIST1_BLOCK.id,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.size).toBe(5);
    assertTreeIntegrity(document);
  });

  it("allows the user to update the block passing a new block with the same ID when they try to replace the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        id: TOGGLE_LIST1_BLOCK.id,
        type: TOGGLE_LIST3_BLOCK.type,
        data: TOGGLE_LIST3_BLOCK.data,
        children: [
          { ...TOGGLE_LIST4_BLOCK, children: [SAMPLE_BLOCK3, SAMPLE_BLOCK4] },
          SAMPLE_BLOCK5,
        ],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          id: TOGGLE_LIST1_BLOCK.id,
          type: TOGGLE_LIST3_BLOCK.type,
          data: TOGGLE_LIST3_BLOCK.data,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST4_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST4_BLOCK.id },
                { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST4_BLOCK.id },
              ],
            },

            { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST1_BLOCK.id },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.size).toBe(6);
  });

  it("replaces only the children correctly without updating any other block data", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK7);

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        expect.objectContaining({ id: TOGGLE_LIST1_BLOCK.id }),
        expect.objectContaining({ id: SAMPLE_BLOCK7.id }),
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST1_BLOCK,
        children: [
          { ...TOGGLE_LIST4_BLOCK, children: [TOGGLE_LIST5_BLOCK, SAMPLE_BLOCK5] },
        ],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST4_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST5_BLOCK,
                  parentId: TOGGLE_LIST4_BLOCK.id,
                  children: [],
                },

                { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST4_BLOCK.id },
              ],
            },
          ],
        },
        { ...SAMPLE_BLOCK7, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.size).toBe(6);
    assertTreeIntegrity(document);
  });

  it("does not mess up the children array of the parent of the target block when updating and dropping the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST2_BLOCK,
      children: [SAMPLE_BLOCK1],
    });
    document.appendChild("root", SAMPLE_BLOCK3);

    // Assert to ensure correct structure before acting
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        expect.objectContaining({ id: TOGGLE_LIST1_BLOCK.id }),
        expect.objectContaining({ id: TOGGLE_LIST2_BLOCK.id }),
        expect.objectContaining({ id: SAMPLE_BLOCK3.id }),
      ],
    });

    // Act
    document.updateBlock(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK5, {
      childrenStrategy: "drop",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        { ...TOGGLE_LIST1_BLOCK, parentId: "root", children: [] },
        { ...SAMPLE_BLOCK5, parentId: "root" },
        { ...SAMPLE_BLOCK3, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children.at(2),
    );

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);
  });

  it("does not mess up the children array of the parent of the target block when updating and preserving the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK7);
    document.insertBefore(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST3_BLOCK);

    // Assert to be absolutely sure about the structure before acting.
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        expect.objectContaining({ id: TOGGLE_LIST3_BLOCK.id }),
        expect.objectContaining({ id: TOGGLE_LIST1_BLOCK.id }),
        expect.objectContaining({ id: SAMPLE_BLOCK7.id }),
      ],
    });

    // Act
    document.updateBlock(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST4_BLOCK, {
      childrenStrategy: "preserve",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        { ...TOGGLE_LIST3_BLOCK, parentId: "root", children: [] },
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST4_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
        { ...SAMPLE_BLOCK7, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBe(
      document.getRoot().children.at(2),
    );
  });

  it("does not mess up the children array of the parent of the target block when updating and replacing the children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST2_BLOCK,
      children: [SAMPLE_BLOCK1],
    });
    document.appendChild("root", TOGGLE_LIST3_BLOCK);

    // Assert structure before acting
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        expect.objectContaining({ id: TOGGLE_LIST1_BLOCK.id }),
        expect.objectContaining({ id: TOGGLE_LIST2_BLOCK.id }),
        expect.objectContaining({ id: TOGGLE_LIST3_BLOCK.id }),
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST3_BLOCK.id,
      {
        ...TOGGLE_LIST3_BLOCK,
        children: [
          { ...TOGGLE_LIST4_BLOCK, children: [SAMPLE_BLOCK5] },
          SAMPLE_BLOCK6,
        ],
      },
      {
        childrenStrategy: "replace",
      },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        { ...TOGGLE_LIST1_BLOCK, parentId: "root", children: [] },
        {
          ...TOGGLE_LIST2_BLOCK,
          parentId: "root",
          children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
        },
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST4_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST4_BLOCK.id }],
            },
            { ...SAMPLE_BLOCK6, parentId: TOGGLE_LIST3_BLOCK.id },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(2),
    );

    assertTreeIntegrity(document);
  });

  it("replaces empty block children correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST2_BLOCK,
        children: [{ ...TOGGLE_LIST3_BLOCK, children: [SAMPLE_BLOCK1] }],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST3_BLOCK,
              parentId: TOGGLE_LIST2_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST3_BLOCK.id }],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);
  });

  it("only drops the children without updating any other block data when the payload has the same data as the target block", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [TOGGLE_LIST3_BLOCK, SAMPLE_BLOCK1] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        id: TOGGLE_LIST1_BLOCK.id,
        data: TOGGLE_LIST1_BLOCK.data,
        type: TOGGLE_LIST1_BLOCK.type,
      },
      { childrenStrategy: "drop" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...TOGGLE_LIST1_BLOCK, parentId: "root", children: [] }],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("preserves the children and does not throw even though all of the block data is the same as the current one", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [TOGGLE_LIST3_BLOCK, SAMPLE_BLOCK1] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        id: TOGGLE_LIST1_BLOCK.id,
        data: TOGGLE_LIST1_BLOCK.data,
        type: TOGGLE_LIST1_BLOCK.type,
      },
      { childrenStrategy: "preserve" },
    );

    // Assert
    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST3_BLOCK,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                  children: [],
                },
                { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(document);
  });

  it("doesn't throw an error and correctly updates if the children are passed to the payload but the childrenStrategy is `drop`", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST3_BLOCK,
        children: [SAMPLE_BLOCK3, SAMPLE_BLOCK4],
      },
      { childrenStrategy: "drop" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...TOGGLE_LIST3_BLOCK, parentId: "root", children: [] }],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("doesn't throw an error and correctly updates if the children are passed to the payload but the childrenStrategy is `preserve`", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        { ...TOGGLE_LIST2_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST1_BLOCK.id,
      {
        ...TOGGLE_LIST3_BLOCK,
        children: [SAMPLE_BLOCK3, SAMPLE_BLOCK4],
      },
      { childrenStrategy: "preserve" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("updates a deep descendant and drops its children correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          children: [
            {
              ...TOGGLE_LIST3_BLOCK,
              children: [
                {
                  ...TOGGLE_LIST4_BLOCK,
                  children: [
                    { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK5] },
                    SAMPLE_BLOCK6,
                  ],
                },
              ],
            },
            SAMPLE_BLOCK2,
          ],
        },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST4_BLOCK.id,
      {
        id: TOGGLE_LIST6_BLOCK.id,
        type: TOGGLE_LIST6_BLOCK.type,
        data: TOGGLE_LIST6_BLOCK.data,
      },
      { childrenStrategy: "drop" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST3_BLOCK,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                  children: [
                    {
                      ...TOGGLE_LIST6_BLOCK,
                      parentId: TOGGLE_LIST3_BLOCK.id,
                      children: [],
                    },
                  ],
                },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("updates a deep descendant and preserves its children correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          children: [
            {
              ...TOGGLE_LIST3_BLOCK,
              children: [
                {
                  ...TOGGLE_LIST4_BLOCK,
                  children: [
                    { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK5] },
                    SAMPLE_BLOCK6,
                  ],
                },
              ],
            },
            SAMPLE_BLOCK2,
          ],
        },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST4_BLOCK.id,
      {
        id: TOGGLE_LIST6_BLOCK.id,
        type: TOGGLE_LIST6_BLOCK.type,
        data: TOGGLE_LIST6_BLOCK.data,
      },
      { childrenStrategy: "preserve" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST3_BLOCK,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                  children: [
                    {
                      ...TOGGLE_LIST6_BLOCK,
                      parentId: TOGGLE_LIST3_BLOCK.id,
                      children: [
                        {
                          ...TOGGLE_LIST5_BLOCK,
                          parentId: TOGGLE_LIST6_BLOCK.id,
                          children: [
                            { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST5_BLOCK.id },
                          ],
                        },
                        { ...SAMPLE_BLOCK6, parentId: TOGGLE_LIST6_BLOCK.id },
                      ],
                    },
                  ],
                },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(document);
  });

  it("updates a deep descendant and replaces its children correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          children: [
            {
              ...TOGGLE_LIST3_BLOCK,
              children: [
                {
                  ...TOGGLE_LIST4_BLOCK,
                  children: [
                    { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK5] },
                    SAMPLE_BLOCK6,
                  ],
                },
              ],
            },
            SAMPLE_BLOCK2,
          ],
        },
      ],
    });

    // Act
    document.updateBlock(
      TOGGLE_LIST4_BLOCK.id,
      {
        id: TOGGLE_LIST6_BLOCK.id,
        type: TOGGLE_LIST6_BLOCK.type,
        data: TOGGLE_LIST6_BLOCK.data,
        children: [
          { ...TOGGLE_LIST8_BLOCK, children: [SAMPLE_BLOCK8, SAMPLE_BLOCK9] },
        ],
      },
      { childrenStrategy: "replace" },
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST3_BLOCK,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                  children: [
                    {
                      ...TOGGLE_LIST6_BLOCK,
                      parentId: TOGGLE_LIST3_BLOCK.id,
                      children: [
                        {
                          ...TOGGLE_LIST8_BLOCK,
                          parentId: TOGGLE_LIST6_BLOCK.id,
                          children: [
                            { ...SAMPLE_BLOCK8, parentId: TOGGLE_LIST8_BLOCK.id },
                            { ...SAMPLE_BLOCK9, parentId: TOGGLE_LIST8_BLOCK.id },
                          ],
                        },
                      ],
                    },
                  ],
                },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST8_BLOCK.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK8.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK9.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(1),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("copies deeply the entire payload to ensure that the user won't accidentally mutate during the execution of their application in the timeline", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    const payload: BlockPayload = {
      ...TOGGLE_LIST2_BLOCK,
      children: [
        { ...TOGGLE_LIST3_BLOCK, children: [SAMPLE_BLOCK1, SAMPLE_BLOCK2] },
      ],
    };

    // Act
    document.updateBlock(TOGGLE_LIST1_BLOCK.id, payload, {
      childrenStrategy: "replace",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST3_BLOCK,
              parentId: TOGGLE_LIST2_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST3_BLOCK.id },
                { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST3_BLOCK.id },
              ],
            },
          ],
        },
      ],
    });

    const toggleList2 = document.getBlock(TOGGLE_LIST2_BLOCK.id);
    const toggleList3 = document.getBlock(TOGGLE_LIST3_BLOCK.id);
    const sampleBlock1 = document.getBlock(SAMPLE_BLOCK1.id);
    const sampleBlock2 = document.getBlock(SAMPLE_BLOCK2.id);

    expect(toggleList2).toBe(document.getRoot().children.at(0));
    expect(toggleList2?.children).not.toBe(payload.children);
    expect(toggleList2).not.toBe(payload);
    expect(toggleList2?.data).not.toBe(payload.data);

    expect(toggleList3).toBe(document.getRoot().children.at(0)?.children?.at(0));
    expect(toggleList3?.children).not.toBe(payload.children?.at(0)?.children);
    expect(toggleList3?.data).not.toBe(payload.children?.at(0)?.data);

    expect(sampleBlock1).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );
    expect(sampleBlock1).not.toBe(payload.children?.at(0)?.children?.at(0));
    expect(sampleBlock1?.data).not.toBe(
      payload.children?.at(0)?.children?.at(0)?.data,
    );

    expect(sampleBlock2).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );
    expect(sampleBlock2).not.toBe(payload.children?.at(0)?.children?.at(1));
    expect(sampleBlock2?.data).not.toBe(
      payload.children?.at(0)?.children?.at(1)?.data,
    );
  });
});

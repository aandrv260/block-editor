import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  assertTreeIntegrity,
  testBlockToBlock,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";
import type { BlockPayload } from "../models/document-payload.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import {
  BlockAlreadyExistsError,
  BlockCannotContainItselfError,
  BlockCannotHaveChildrenError,
  TargetBlockNotFoundError,
} from "../errors/common";
import {
  CannotInsertBeforeRootError,
  ParentOfTargetCannotHaveChildrenError,
  TargetNotInParentChildrenError,
} from "../errors/insert-block";

describe("insertBefore()", () => {
  it("throws an error if we try to insert before the root", () => {
    // Arrange
    const document = new EditorDocument();
    const insertBeforeRoot = () => document.insertBefore("root", SAMPLE_BLOCK2);

    // Act
    document.appendChild("root", SAMPLE_BLOCK1);

    // Assert
    assertEngineError(insertBeforeRoot, {
      ExpectedErrorClass: CannotInsertBeforeRootError,
      expectedCode: "DOCUMENT:CANNOT_INSERT_BEFORE_ROOT",
      expectedMessage: "You cannot insert before the root!",
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if we try to insert a block that already exists in the document", () => {
    // Arrange
    const document = new EditorDocument();
    const insertAlreadyExistingBlock = () =>
      document.insertBefore(SAMPLE_BLOCK2.id, SAMPLE_BLOCK1);

    // Act
    document.appendChild("root", SAMPLE_BLOCK1);
    document.appendChild("root", SAMPLE_BLOCK2);

    // Assert

    assertEngineError(insertAlreadyExistingBlock, {
      ExpectedErrorClass: BlockAlreadyExistsError,
      expectedCode: "DOCUMENT:BLOCK_ALREADY_EXISTS",
      expectedMessage: `Block with ID ${SAMPLE_BLOCK1.id} already exists in the document.`,
      expectedContext: { blockId: SAMPLE_BLOCK1.id },
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if target is not a block in the tree", () => {
    // Arrange
    const document = new EditorDocument();
    const insert = () =>
      document.insertBefore("some_target_that_does_not_exist", SAMPLE_BLOCK3);

    document.appendChild("root", SAMPLE_BLOCK1);
    document.appendChild("root", SAMPLE_BLOCK2);

    assertEngineError(insert, {
      ExpectedErrorClass: TargetBlockNotFoundError,
      expectedCode: "DOCUMENT:TARGET_BLOCK_NOT_FOUND",
      expectedMessage: `Target not found with the specified targetId \`some_target_that_does_not_exist\`!`,
      expectedContext: { targetId: "some_target_that_does_not_exist" },
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the parent under which we want to insert the new block has no defined children property", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(EditorDocument.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    // This will test and simulate if somehow if children are forgotten to be passed in the method that inserted the element. It's not the best solution but it's technically 98% impossible to reproduce such bug since the class and its method are covered extensively and I'm sure and extremely confident in the tests. Additionally, I'm on my own with limited time so I have to organise my time efficiently. If this test catches an error, it means that there is an if check for the parent's `children` property and the method works as expected.
    delete document.getBlock(TOGGLE_LIST1_BLOCK.id)?.children;

    const insertBefore = () =>
      document.insertBefore(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK1);

    // Assert
    assertEngineError(insertBefore, {
      ExpectedErrorClass: ParentOfTargetCannotHaveChildrenError,
      expectedCode: "DOCUMENT:PARENT_OF_TARGET_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Parent with ID "${TOGGLE_LIST1_BLOCK.id}" of target with ID "${TOGGLE_LIST2_BLOCK.id}" cannot have children!`,
      expectedContext: {
        parentId: TOGGLE_LIST1_BLOCK.id,
        targetId: TOGGLE_LIST2_BLOCK.id,
      },
    });
  });

  it("throws an error if the parent block is a block that cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    document.getBlock(TOGGLE_LIST2_BLOCK.id)!.parentId = SAMPLE_BLOCK2.id;

    const insertBefore = () =>
      document.insertBefore(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3);

    // Assert
    assertEngineError(insertBefore, {
      ExpectedErrorClass: ParentOfTargetCannotHaveChildrenError,
      expectedCode: "DOCUMENT:PARENT_OF_TARGET_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Parent with ID "${SAMPLE_BLOCK2.id}" of target with ID "${TOGGLE_LIST2_BLOCK.id}" cannot have children!`,
      expectedContext: {
        parentId: SAMPLE_BLOCK2.id,
        targetId: TOGGLE_LIST2_BLOCK.id,
      },
    });
  });

  it("throws an error when it cannot find the target in its parent's children array based on the target's parentId property", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST3_BLOCK);

    // Act
    // Again, this is highly unlikely but I must be sure that the editor works properly and is built professionally.
    document.getBlock(TOGGLE_LIST3_BLOCK.id)!.parentId = TOGGLE_LIST2_BLOCK.id;

    const insertBefore = () =>
      document.insertBefore(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK4);

    // Assert
    assertEngineError(insertBefore, {
      ExpectedErrorClass: TargetNotInParentChildrenError,
      expectedCode: "DOCUMENT:TARGET_NOT_IN_PARENT_CHILDREN",
      expectedMessage: `Target with ID "${TOGGLE_LIST3_BLOCK.id}" not found among its parent's children. Parent ID: "${TOGGLE_LIST2_BLOCK.id}"`,
      expectedContext: {
        targetId: TOGGLE_LIST3_BLOCK.id,
        parentId: TOGGLE_LIST2_BLOCK.id,
      },
    });
  });

  it("throws an error when the user tries to insert a block which has a child with ID that already exists in the document", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);

    const tryInsert = () => {
      document.insertBefore(TOGGLE_LIST2_BLOCK.id, {
        ...TOGGLE_LIST3_BLOCK,
        children: [
          {
            ...TOGGLE_LIST4_BLOCK,
            children: [{ ...TOGGLE_LIST5_BLOCK, children: [TOGGLE_LIST1_BLOCK] }],
          },
        ],
      });
    };

    // Assert
    assertEngineError(tryInsert, {
      ExpectedErrorClass: BlockAlreadyExistsError,
      expectedCode: "DOCUMENT:BLOCK_ALREADY_EXISTS",
      expectedMessage: `Block with ID ${TOGGLE_LIST1_BLOCK.id} already exists in the document.`,
      expectedContext: { blockId: TOGGLE_LIST1_BLOCK.id },
    });

    // The tree stays the same
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [],
        },
        {
          ...TOGGLE_LIST2_BLOCK,
          parentId: "root",
          children: [],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(1),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();

    expect(document.size).toBe(3);
    assertTreeIntegrity(document);
  });

  it("throws an error when the user tries to insert a block which has a child with ID that is the same as the root of the payload subtree and cannot have children!", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    const tryInsert = () => {
      document.insertBefore(TOGGLE_LIST1_BLOCK.id, {
        ...TOGGLE_LIST2_BLOCK,
        children: [{ ...TOGGLE_LIST3_BLOCK, children: [TOGGLE_LIST2_BLOCK] }],
      });
    };

    // Assert
    assertEngineError(tryInsert, {
      ExpectedErrorClass: BlockCannotContainItselfError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_CONTAIN_ITSELF",
      expectedMessage: `A block cannot contain a child with the same ID as its own. Detected duplicate ID "${TOGGLE_LIST2_BLOCK.id}" within the subtree payload.`,
      expectedContext: { blockId: TOGGLE_LIST2_BLOCK.id },
    });
  });

  it("puts empty array children property on the new block if the new block can have children and the block payload does not have any children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.insertBefore(TOGGLE_LIST1_BLOCK.id, {
      id: TOGGLE_LIST2_BLOCK.id,
      type: TOGGLE_LIST2_BLOCK.type,
      data: TOGGLE_LIST2_BLOCK.data,
    });

    // Assert
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toEqual({
      id: TOGGLE_LIST2_BLOCK.id,
      type: TOGGLE_LIST2_BLOCK.type,
      parentId: "root",
      data: TOGGLE_LIST2_BLOCK.data,
      children: [],
    });

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          id: TOGGLE_LIST2_BLOCK.id,
          type: TOGGLE_LIST2_BLOCK.type,
          data: TOGGLE_LIST2_BLOCK.data,
          parentId: "root",
          children: [],
        },

        {
          id: TOGGLE_LIST1_BLOCK.id,
          type: TOGGLE_LIST1_BLOCK.type,
          data: TOGGLE_LIST1_BLOCK.data,
          parentId: "root",
          children: [],
        },
      ],
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the new block cannot have children and the user passes children through the payload no matter how many level deep they are in the new subtree", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    const tryInsertBefore = () => {
      document.insertBefore(TOGGLE_LIST1_BLOCK.id, {
        id: TOGGLE_LIST2_BLOCK.id,
        type: TOGGLE_LIST2_BLOCK.type,
        data: TOGGLE_LIST2_BLOCK.data,
        children: [
          {
            ...TOGGLE_LIST3_BLOCK,
            children: [
              {
                ...TOGGLE_LIST4_BLOCK,
                children: [{ ...SAMPLE_BLOCK7, children: [SAMPLE_BLOCK8] }],
              },
            ],
          },
        ],
      });
    };

    // Assert
    assertEngineError(tryInsertBefore, {
      ExpectedErrorClass: BlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Block with ID ${SAMPLE_BLOCK7.id} cannot have children!`,
      expectedContext: { blockId: SAMPLE_BLOCK7.id },
    });

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK8.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("doesn't put children on the block if the new block cannot have children and no children are passed through the payload", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.insertBefore(TOGGLE_LIST1_BLOCK.id, {
      id: SAMPLE_BLOCK1.id,
      type: SAMPLE_BLOCK1.type,
      data: SAMPLE_BLOCK1.data,
    });

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual({
      id: SAMPLE_BLOCK1.id,
      type: SAMPLE_BLOCK1.type,
      data: SAMPLE_BLOCK1.data,
      parentId: "root",
    });

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          id: SAMPLE_BLOCK1.id,
          type: SAMPLE_BLOCK1.type,
          data: SAMPLE_BLOCK1.data,
          parentId: "root",
        },

        {
          id: TOGGLE_LIST1_BLOCK.id,
          type: TOGGLE_LIST1_BLOCK.type,
          data: TOGGLE_LIST1_BLOCK.data,
          parentId: "root",
          children: [],
        },
      ],
    });

    assertTreeIntegrity(document);
  });

  it("copies deeply the data from the entire payload to ensure that the user won't accidentally mutate during the execution of their application in the timeline", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild("root", TOGGLE_LIST1_BLOCK);
    document.appendChild("root", TOGGLE_LIST2_BLOCK);

    // Act
    document.insertBefore(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK2);

    // Assert
    const blockInMap = document.getBlock(SAMPLE_BLOCK2.id);

    expect(blockInMap).toEqual({
      id: SAMPLE_BLOCK2.id,
      type: SAMPLE_BLOCK2.type,
      data: SAMPLE_BLOCK2.data,
      parentId: "root",
    });

    expect(blockInMap).toBe(document.getRoot().children[1]);
    expect(blockInMap?.data).not.toBe(SAMPLE_BLOCK2.data);

    assertTreeIntegrity(document);
  });

  it("copies deeply the children in the payload to ensure that the user won't accidentally mutate during the execution of their application in the timeline", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);

    const payload: BlockPayload = {
      ...TOGGLE_LIST3_BLOCK,
      children: [SAMPLE_BLOCK4, SAMPLE_BLOCK5],
    };

    // Act
    document.insertBefore(TOGGLE_LIST2_BLOCK.id, payload);

    // Assert
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toEqual({
      ...TOGGLE_LIST3_BLOCK,
      parentId: TOGGLE_LIST1_BLOCK.id,
      children: [
        {
          ...SAMPLE_BLOCK4,
          parentId: TOGGLE_LIST3_BLOCK.id,
        },
        {
          ...SAMPLE_BLOCK5,
          parentId: TOGGLE_LIST3_BLOCK.id,
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[1],
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)?.children).not.toBe(
      payload.children,
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).not.toBe(payload.children?.[0]);
    expect(document.getBlock(SAMPLE_BLOCK5.id)).not.toBe(payload.children?.[1]);

    assertTreeIntegrity(document);
  });

  it("inserts before the target correctly as direct child of the root", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    document.appendChild("root", SAMPLE_BLOCK1);
    document.appendChild("root", SAMPLE_BLOCK2);
    document.insertBefore(SAMPLE_BLOCK2.id, SAMPLE_BLOCK3);

    // Assert
    expect(document.getRoot().children).toEqual([
      testBlockToBlock(SAMPLE_BLOCK1, "root"),
      testBlockToBlock(SAMPLE_BLOCK3, "root"),
      testBlockToBlock(SAMPLE_BLOCK2, "root"),
    ]);

    assertTreeIntegrity(document);
  });

  it("inserts before the target correctly as distant decendant of the root", () => {
    // Arrange
    const document = new EditorDocument();
    const blockToInsert: BlockPayload = {
      id: "block5",
      type: "text",
      data: { text: "some_text_for_block_5" },
    };

    // Act
    document.appendChild("root", TOGGLE_LIST1_BLOCK);
    document.appendChild("root", TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4);

    document.insertBefore(SAMPLE_BLOCK4.id, blockToInsert);

    // Assert
    // const block2Children = document.getBlock(SAMPLE_BLOCK2.id)?.children;

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK3.id,
              }),

              expect.objectContaining(blockToInsert),

              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
              }),
            ],
          }),
        ],
      }),
    );

    expect(document.getBlock(blockToInsert.id)).toBeDefined();
    assertTreeIntegrity(document);
  });

  it("puts empty children array to nested children if the child block can have children and the user does not provide its children in the payload", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.insertBefore(TOGGLE_LIST1_BLOCK.id, {
      ...TOGGLE_LIST2_BLOCK,
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          children: [
            {
              id: TOGGLE_LIST4_BLOCK.id,
              type: TOGGLE_LIST4_BLOCK.type,
              data: TOGGLE_LIST4_BLOCK.data,
            },
          ],
        },
      ],
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
                {
                  ...TOGGLE_LIST4_BLOCK,
                  parentId: TOGGLE_LIST3_BLOCK.id,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
        },
      ],
    });
  });
});

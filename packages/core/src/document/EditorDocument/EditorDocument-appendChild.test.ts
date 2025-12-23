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
  InvalidParentBlockError,
  ParentBlockCannotHaveChildrenError,
} from "../errors/append-child";
import {
  BlockAlreadyExistsError,
  BlockCannotContainItselfError,
  BlockCannotHaveChildrenError,
} from "../errors/common";

describe("appendChild()", () => {
  it("appends a child to the root if the root id is passed", () => {
    // Arrange
    const document = new EditorDocument();
    const block = { ...SAMPLE_BLOCK1 };

    // Act
    document.appendChild("root", block);

    // Assert
    const rootChildren = document.getRoot().children;
    const insertedBlock = rootChildren.at(-1);

    expect(insertedBlock).toEqual({ ...block, parentId: "root" });
    assertTreeIntegrity(document);
  });

  it("throws an error if the parent block is invalid", () => {
    // Arrange
    const document = new EditorDocument();
    const append = () =>
      document.appendChild("some_invalid_parent_id", SAMPLE_BLOCK1);

    // Assert
    assertEngineError(append, {
      ExpectedErrorClass: InvalidParentBlockError,
      expectedCode: "DOCUMENT:INVALID_PARENT_BLOCK",
      expectedMessage: `Parent block with ID some_invalid_parent_id is invalid!`,
      expectedContext: { parentId: "some_invalid_parent_id" },
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the block is already in the document tree", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);

    const appendFn = () =>
      document.appendChild(document.ROOT_ID, {
        id: SAMPLE_BLOCK3.id,
        type: "text",
        data: { text: "fdaadfad" },
      });

    // Assert
    assertEngineError(appendFn, {
      ExpectedErrorClass: BlockAlreadyExistsError,
      expectedCode: "DOCUMENT:BLOCK_ALREADY_EXISTS",
      expectedMessage: `Block with ID ${SAMPLE_BLOCK3.id} already exists in the document.`,
      expectedContext: { blockId: SAMPLE_BLOCK3.id },
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the parent under which we want to append the new block cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Assert
    const tryAppend = () => {
      document.appendChild(SAMPLE_BLOCK1.id, SAMPLE_BLOCK3);
    };

    assertEngineError(tryAppend, {
      ExpectedErrorClass: ParentBlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Parent block with ID ${SAMPLE_BLOCK1.id} cannot have children!`,
      expectedContext: { parentId: SAMPLE_BLOCK1.id },
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the user passes children under blocks that cannot have children no matter how many level deep they are in the new subtree", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    const tryAppend = () => {
      document.appendChild(TOGGLE_LIST1_BLOCK.id, {
        id: "some_child",
        type: "toggle-list",
        data: { open: false },
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
    assertEngineError(tryAppend, {
      ExpectedErrorClass: BlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Block with ID ${SAMPLE_BLOCK7.id} cannot have children!`,
      expectedContext: { blockId: SAMPLE_BLOCK7.id },
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
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock("some_child")).toBeNull();
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK7.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK8.id)).toBeNull();

    assertTreeIntegrity(document);
  });

  it("throws an error when the user tries to append a block which has a child with ID that already exists in the document", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    const tryAppend = () => {
      document.appendChild(document.ROOT_ID, {
        ...TOGGLE_LIST2_BLOCK,
        children: [
          {
            ...TOGGLE_LIST4_BLOCK,
            children: [{ ...TOGGLE_LIST5_BLOCK, children: [TOGGLE_LIST1_BLOCK] }],
          },
        ],
      });
    };

    // Assert
    assertEngineError(tryAppend, {
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
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();

    expect(document.size).toBe(2);
    assertTreeIntegrity(document);
  });

  it("throws an error when the user tries to insert a block which has a child with ID that is the same as the root of the payload subtree and cannot have children", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    const tryAppend = () => {
      document.appendChild("root", {
        ...TOGGLE_LIST2_BLOCK,
        children: [{ ...TOGGLE_LIST3_BLOCK, children: [TOGGLE_LIST2_BLOCK] }],
      });
    };

    assertEngineError(tryAppend, {
      ExpectedErrorClass: BlockCannotContainItselfError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_CONTAIN_ITSELF",
      expectedMessage: `A block cannot contain a child with the same ID as its own. Detected duplicate ID "${TOGGLE_LIST2_BLOCK.id}" within the subtree payload.`,
      expectedContext: { blockId: TOGGLE_LIST2_BLOCK.id },
    });

    assertTreeIntegrity(document);
  });

  it("puts empty array children property on the new block if the new block can have children the block payload does not have any children", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.appendChild(TOGGLE_LIST1_BLOCK.id, {
      id: "some_child",
      type: "toggle-list",
      data: { open: false },
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              id: "some_child",
              type: "toggle-list",
              parentId: "toggle-list-1",
              data: { open: false },
              children: [],
            },
          ],
        },
      ],
    });

    assertTreeIntegrity(document);
  });

  it("throws an error if the block cannot have children and the user passes children through the payload", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    const tryAppend = () => {
      document.appendChild(TOGGLE_LIST1_BLOCK.id, {
        id: "some_child",
        type: "text",
        data: { text: "some_text" },
        children: [TOGGLE_LIST3_BLOCK],
      });
    };

    // Assert
    assertEngineError(tryAppend, {
      ExpectedErrorClass: BlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Block with ID some_child cannot have children!`,
      expectedContext: { blockId: "some_child" },
    });

    assertTreeIntegrity(document);
  });

  it("doesn't put children on the block if the new block cannot have children and no children are passed through the payload", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.appendChild(TOGGLE_LIST1_BLOCK.id, {
      id: "some_child",
      type: "text",
      data: { text: "some_text" },
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              id: "some_child",
              type: "text",
              parentId: "toggle-list-1",
              data: { text: "some_text" },
            },
          ],
        },
      ],
    });

    assertTreeIntegrity(document);
  });

  it("copies deeply the entire payload to ensure that the user won't accidentally mutate during the execution of their application in the timeline", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    // Act
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual({
      id: SAMPLE_BLOCK1.id,
      type: SAMPLE_BLOCK1.type,
      data: SAMPLE_BLOCK1.data,
      parentId: "toggle-list-1",
    });

    expect(document.getBlock(SAMPLE_BLOCK1.id)?.data).not.toBe(SAMPLE_BLOCK1.data);

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
    document.appendChild(TOGGLE_LIST1_BLOCK.id, payload);

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

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)?.children).not.toBe(
      payload.children,
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[1],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children[0]?.children?.[1]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children[0]?.children?.[1]?.children?.[1],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).not.toBe(payload.children?.[0]);
    expect(document.getBlock(SAMPLE_BLOCK5.id)).not.toBe(payload.children?.[1]);

    assertTreeIntegrity(document);
  });

  it("appends multiple children to the root correctly", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    document.appendChild(EditorDocument.ROOT_ID, { ...SAMPLE_BLOCK1 });
    document.appendChild(EditorDocument.ROOT_ID, { ...SAMPLE_BLOCK2 });
    document.appendChild(EditorDocument.ROOT_ID, { ...SAMPLE_BLOCK3 });

    // Assert
    const root = document.getRoot();

    expect(root.children).toEqual([
      { ...SAMPLE_BLOCK1, parentId: "root" },
      { ...SAMPLE_BLOCK2, parentId: "root" },
      { ...SAMPLE_BLOCK3, parentId: "root" },
    ]);

    assertTreeIntegrity(document);
  });

  it("appends multiple children to the root and then appends correctly nested children", () => {
    // Arrange
    const document = new EditorDocument();
    const rootChild1 = { ...TOGGLE_LIST1_BLOCK };
    const rootChild2 = { ...TOGGLE_LIST2_BLOCK };
    const rootChild2Child1 = { ...TOGGLE_LIST3_BLOCK };
    const rootChild2Child2 = { ...TOGGLE_LIST4_BLOCK };

    // Act
    document.appendChild(EditorDocument.ROOT_ID, rootChild1);
    document.appendChild(EditorDocument.ROOT_ID, rootChild2);

    document.appendChild(rootChild2.id, rootChild2Child1);
    document.appendChild(rootChild2.id, rootChild2Child2);

    // Assert
    const root = document.getRoot();

    assertTreeIntegrity(document);

    expect(root.children).toEqual([
      { ...rootChild1, parentId: "root" },
      {
        ...rootChild2,
        children: [
          testBlockToBlock(rootChild2Child1, rootChild2.id),
          testBlockToBlock(rootChild2Child2, rootChild2.id),
        ],
        parentId: "root",
      },
    ]);

    expect(root.children[1].children).toEqual([
      { ...rootChild2Child1, parentId: rootChild2.id },
      { ...rootChild2Child2, parentId: rootChild2.id },
    ]);

    expect(root.children?.[1].children?.[0]).toEqual({
      ...rootChild2Child1,
      parentId: rootChild2.id,
    });

    expect(root.children?.[1].children?.[1]).toEqual({
      ...rootChild2Child2,
      parentId: rootChild2.id,
    });
  });

  it("appends correctly the new block when it has children", () => {
    // Arrange
    const document = new EditorDocument();
    const block1Child1 = { ...TOGGLE_LIST2_BLOCK } satisfies BlockPayload;

    const child2Child1 = { ...TOGGLE_LIST4_BLOCK } satisfies BlockPayload;
    const block1Child2 = {
      ...TOGGLE_LIST3_BLOCK,
      children: [child2Child1],
    } satisfies BlockPayload;

    const block1Child3 = {
      ...TOGGLE_LIST5_BLOCK,
      children: [],
    } satisfies BlockPayload;

    const block1 = {
      ...TOGGLE_LIST1_BLOCK,
      children: [block1Child1, block1Child2, block1Child3],
    } satisfies BlockPayload;

    // Act
    document.appendChild(EditorDocument.ROOT_ID, block1);

    // Assert
    const documentRoot = document.getRoot();

    expect(document.getBlock(block1Child1.id)).toStrictEqual(
      expect.objectContaining({
        id: block1Child1.id,
        type: block1Child1.type,
        parentId: block1.id,
        data: expect.objectContaining(block1Child1.data),
        children: [],
      }),
    );

    expect(document.getBlock(block1Child2.id)).toStrictEqual(
      expect.objectContaining({
        id: block1Child2.id,
        type: block1Child2.type,
        parentId: block1.id,
        data: block1Child2.data,
        children: [
          expect.objectContaining({
            id: child2Child1.id,
            type: child2Child1.type,
            parentId: block1Child2.id,
            data: expect.objectContaining(child2Child1.data),
          }),
        ],
      }),
    );

    expect(document.getBlock(block1Child3.id)).toStrictEqual(
      expect.objectContaining({
        id: block1Child3.id,
        type: block1Child3.type,
        data: expect.objectContaining(block1Child3.data),
        children: [],
      }),
    );

    expect(documentRoot.children[0]).toBe(document.getBlock(block1.id));
    expect(documentRoot.children?.[0]?.children?.[0]).toBe(
      document.getBlock(block1Child1.id),
    );

    expect(document.getBlock(block1Child3.id)).toBe(
      documentRoot.children?.[0]?.children?.[2],
    );

    assertTreeIntegrity(document);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: block1.id,
            parentId: document.ROOT_ID,
            type: block1.type,
            data: block1.data,
            children: [
              expect.objectContaining({
                id: block1Child1.id,
                parentId: block1.id,
                type: block1Child1.type,
                data: block1Child1.data,
                children: [],
              }),

              expect.objectContaining({
                id: block1Child2.id,
                parentId: block1.id,
                type: block1Child2.type,
                data: block1Child2.data,
                children: [
                  expect.objectContaining({
                    id: child2Child1.id,
                    type: child2Child1.type,
                    data: child2Child1.data,
                    children: [],
                  }),
                ],
              }),

              expect.objectContaining({
                id: block1Child3.id,
                parentId: block1.id,
                type: block1Child3.type,
                data: block1Child3.data,
              }),
            ],
          }),
        ],
      }),
    );
  });

  it("appends empty children array to nested children if the child block can have children and the user does not provide its children in the payload", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    document.appendChild(EditorDocument.ROOT_ID, {
      ...TOGGLE_LIST1_BLOCK,
      children: [
        {
          ...TOGGLE_LIST2_BLOCK,
          children: [
            {
              id: TOGGLE_LIST3_BLOCK.id,
              type: TOGGLE_LIST3_BLOCK.type,
              data: TOGGLE_LIST3_BLOCK.data,
            },
            SAMPLE_BLOCK1,
          ],
        },
      ],
    });

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
                {
                  ...SAMPLE_BLOCK1,
                  parentId: TOGGLE_LIST2_BLOCK.id,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("throws an error when trying to add the same block again once it's already in the tree", () => {
    // Arrange
    const document = new EditorDocument();
    const appendBlock1 = () => document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    appendBlock1();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Assert
    assertEngineError(appendBlock1, {
      ExpectedErrorClass: BlockAlreadyExistsError,
      expectedCode: "DOCUMENT:BLOCK_ALREADY_EXISTS",
      expectedMessage: `Block with ID ${SAMPLE_BLOCK1.id} already exists in the document.`,
      expectedContext: { blockId: SAMPLE_BLOCK1.id },
    });

    assertTreeIntegrity(document);
  });
});

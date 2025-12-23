import {
  SAMPLE_BLOCK10,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK9,
  TOGGLE_LIST10_BLOCK,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST5_BLOCK,
  TOGGLE_LIST6_BLOCK,
  TOGGLE_LIST7_BLOCK,
  TOGGLE_LIST8_BLOCK,
  TOGGLE_LIST9_BLOCK,
  assertTreeIntegrity,
  expectBlockNotToBeInTheDocument,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("EditorDocument integration", () => {
  it("works without problems fine when appending, asserting and removing blocks", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK5);

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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
                      ...SAMPLE_BLOCK5,
                      parentId: TOGGLE_LIST3_BLOCK.id,
                    },
                  ],
                },
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

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document
        .getRoot()
        .children.at(0)
        ?.children?.at(0)
        ?.children?.at(0)
        ?.children?.at(0),
    );

    expect(document.size).toBe(5);
    assertTreeIntegrity(document);

    // Act
    document.remove(SAMPLE_BLOCK5.id);

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBeNull();

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);

    // Act
    document.updateBlock(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST5_BLOCK, {
      childrenStrategy: "preserve",
    });

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            {
              ...TOGGLE_LIST5_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                {
                  ...TOGGLE_LIST3_BLOCK,
                  parentId: TOGGLE_LIST5_BLOCK.id,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBeNull();

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);

    // Act - update and drop children
    document.updateBlock(TOGGLE_LIST5_BLOCK.id, TOGGLE_LIST6_BLOCK, {
      childrenStrategy: "drop",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            {
              ...TOGGLE_LIST6_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST6_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();

    expect(document.size).toBe(3);
    assertTreeIntegrity(document);

    // Act - insert before
    document.insertBefore(TOGGLE_LIST6_BLOCK.id, TOGGLE_LIST7_BLOCK);

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST7_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);

    // Act - insert after
    document.insertAfter(TOGGLE_LIST7_BLOCK.id, TOGGLE_LIST8_BLOCK);

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST7_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.size).toBe(5);
    assertTreeIntegrity(document);

    // Act - Clone
    const clonedDocument = document.clone();

    // Assert
    expect(clonedDocument.getRoot()).not.toBe(document.getRoot());
    expect(clonedDocument).not.toBe(document);
    expect(clonedDocument.toJSON()).toBe(document.toJSON());
    expect(clonedDocument.getRoot()).toStrictEqual(document.getRoot());

    // Compare the structure of the blocks in the map
    expect(document.size).toBe(5);
    expect(clonedDocument.size).toBe(5);

    expect(clonedDocument.getBlock(TOGGLE_LIST1_BLOCK.id)).toEqual(
      document.getBlock(TOGGLE_LIST1_BLOCK.id),
    );
    expect(clonedDocument.getBlock(TOGGLE_LIST1_BLOCK.id)).not.toBe(
      document.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    expect(clonedDocument.getBlock(TOGGLE_LIST7_BLOCK.id)).toEqual(
      document.getBlock(TOGGLE_LIST7_BLOCK.id),
    );
    expect(clonedDocument.getBlock(TOGGLE_LIST7_BLOCK.id)).not.toBe(
      document.getBlock(TOGGLE_LIST7_BLOCK.id),
    );

    expect(clonedDocument.getBlock(TOGGLE_LIST8_BLOCK.id)).toEqual(
      document.getBlock(TOGGLE_LIST8_BLOCK.id),
    );
    expect(clonedDocument.getBlock(TOGGLE_LIST8_BLOCK.id)).not.toBe(
      document.getBlock(TOGGLE_LIST8_BLOCK.id),
    );

    expect(clonedDocument.getBlock(TOGGLE_LIST6_BLOCK.id)).toEqual(
      document.getBlock(TOGGLE_LIST6_BLOCK.id),
    );

    expect(clonedDocument.getBlock(TOGGLE_LIST6_BLOCK.id)).toEqual(
      document.getBlock(TOGGLE_LIST6_BLOCK.id),
    );

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(clonedDocument.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: clonedDocument.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    // Act
    clonedDocument.updateBlock(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST9_BLOCK, {
      childrenStrategy: "preserve",
    });

    // Assert the cloned document is correct
    expect(clonedDocument.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(clonedDocument.getBlock(TOGGLE_LIST9_BLOCK.id)).toBe(
      clonedDocument.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST9_BLOCK.id)).toBeNull();

    expect(clonedDocument.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST9_BLOCK,
          parentId: clonedDocument.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST9_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST9_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST9_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    assertTreeIntegrity(clonedDocument);
    assertTreeIntegrity(document);

    // Act - update block replacing the children
    clonedDocument.updateBlock(
      TOGGLE_LIST9_BLOCK.id,
      { ...TOGGLE_LIST10_BLOCK, children: [SAMPLE_BLOCK9, SAMPLE_BLOCK10] },
      {
        childrenStrategy: "replace",
      },
    );

    // Assert
    expect(clonedDocument.getBlock(TOGGLE_LIST9_BLOCK.id)).toBeNull();
    expect(clonedDocument.getBlock(TOGGLE_LIST10_BLOCK.id)).toBe(
      clonedDocument.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST9_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST10_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK9.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK10.id)).toBeNull();

    expect(clonedDocument.getRoot()).toEqual({
      id: clonedDocument.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST10_BLOCK,
          parentId: clonedDocument.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK9, parentId: TOGGLE_LIST10_BLOCK.id },
            { ...SAMPLE_BLOCK10, parentId: TOGGLE_LIST10_BLOCK.id },
          ],
        },
      ],
    });

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...TOGGLE_LIST7_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST8_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
            { ...TOGGLE_LIST6_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
          ],
        },
      ],
    });

    expect(clonedDocument.size).toBe(4);
    expect(document.size).toBe(5);

    assertTreeIntegrity(clonedDocument);
    assertTreeIntegrity(document);
  });

  it("moves a block correctly multiple times even after removing blocks, updating and adding blocks", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK4);

    // Current tree structure: 1 -> 2 -> 3 -> 4

    // Act
    document.moveBlock({
      strategy: "before",
      blockId: SAMPLE_BLOCK4.id,
      targetId: TOGGLE_LIST2_BLOCK.id,
    });

    // Current tree structure: 1 -> 4,2 -> 3
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              // 4,2
              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
              }),

              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
                children: [
                  // 3
                  expect.objectContaining({
                    id: TOGGLE_LIST3_BLOCK.id,
                    parentId: TOGGLE_LIST2_BLOCK.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.appendChild(document.ROOT_ID, TOGGLE_LIST5_BLOCK);
    // Current tree structure: 1,5 -> 4,2 -> 3

    // Assert
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children[1],
    );

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toStrictEqual(
      expect.objectContaining({
        id: TOGGLE_LIST5_BLOCK.id,
        type: TOGGLE_LIST5_BLOCK.type,
        data: expect.objectContaining(TOGGLE_LIST5_BLOCK.data),
        parentId: document.ROOT_ID,
      }),
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              // 4,2
              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
              }),
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
                children: [
                  // 3
                  expect.objectContaining({
                    id: TOGGLE_LIST3_BLOCK.id,
                    parentId: TOGGLE_LIST2_BLOCK.id,
                  }),
                ],
              }),
            ],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            type: TOGGLE_LIST5_BLOCK.type,
            data: expect.objectContaining(TOGGLE_LIST5_BLOCK.data),
            children: [],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.remove(TOGGLE_LIST2_BLOCK.id);

    // Assert
    expectBlockNotToBeInTheDocument(document, SAMPLE_BLOCK2.id);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              // 4,2
              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
              }),
            ],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            type: TOGGLE_LIST5_BLOCK.type,
            data: expect.objectContaining(TOGGLE_LIST5_BLOCK.data),
            children: [],
          }),
        ],
      }),
    );
    assertTreeIntegrity(document);

    // Act
    document.moveBlock({
      strategy: "append",
      blockId: SAMPLE_BLOCK4.id,
      targetId: document.ROOT_ID,
    });

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toStrictEqual(
      expect.objectContaining({
        id: SAMPLE_BLOCK4.id,
        parentId: document.ROOT_ID,
      }),
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            type: TOGGLE_LIST5_BLOCK.type,
            data: expect.objectContaining(TOGGLE_LIST5_BLOCK.data),
            children: [],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: document.ROOT_ID,
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.updateBlock(TOGGLE_LIST5_BLOCK.id, TOGGLE_LIST7_BLOCK, {
      childrenStrategy: "replace",
    });

    // Assert
    expectBlockNotToBeInTheDocument(document, TOGGLE_LIST5_BLOCK.id);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST7_BLOCK.id,
            type: TOGGLE_LIST7_BLOCK.type,
            data: expect.objectContaining(TOGGLE_LIST7_BLOCK.data),
            children: [],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: document.ROOT_ID,
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.updateBlock(TOGGLE_LIST7_BLOCK.id, TOGGLE_LIST8_BLOCK, {
      childrenStrategy: "drop",
    });

    // Assert
    expectBlockNotToBeInTheDocument(document, TOGGLE_LIST7_BLOCK.id);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [],
          }),

          expect.objectContaining({
            id: TOGGLE_LIST8_BLOCK.id,
            type: TOGGLE_LIST8_BLOCK.type,
            data: expect.objectContaining(TOGGLE_LIST8_BLOCK.data),
            children: [],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: document.ROOT_ID,
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.moveBlock({
      strategy: "append",
      blockId: TOGGLE_LIST8_BLOCK.id,
      targetId: TOGGLE_LIST1_BLOCK.id,
    });

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST8_BLOCK.id,
                type: TOGGLE_LIST8_BLOCK.type,
                data: expect.objectContaining(TOGGLE_LIST8_BLOCK.data),
                children: [],
              }),
            ],
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: document.ROOT_ID,
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);

    // Act
    document.moveBlock({
      strategy: "after",
      blockId: SAMPLE_BLOCK4.id,
      targetId: TOGGLE_LIST8_BLOCK.id,
    });

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            // 1
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST8_BLOCK.id,
                type: TOGGLE_LIST8_BLOCK.type,
                data: expect.objectContaining(TOGGLE_LIST8_BLOCK.data),
                children: [],
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });
});

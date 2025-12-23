import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { EditorDocument } from "../EditorDocument";
import type { BlockPayload } from "../models/document-payload.models";
import {
  blockCanHaveChildren,
  blockPayloadCanHaveChildren,
  getChildren,
  getPayloadChildren,
  getUpdatedBlockChildren,
  getUpdatedBlockParentChildren,
} from "./block-children.utils";

describe("blockCanHaveChildren()", () => {
  it("returns true if the block passed is the document root", () => {
    // Arrange
    const documentRoot = new DocumentRoot("root");

    // Assert
    expect(blockCanHaveChildren(documentRoot)).toBe(true);
  });

  it("returns true if I pass a document root from a document instance", () => {
    // Arrange
    const document = new EditorDocument();

    // Assert
    expect(blockCanHaveChildren(document.getRoot())).toBe(true);
  });

  test("text blocks cannot have children", () => {
    // Arrange
    const textBlock: Block = {
      id: "text-block-1",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    // Assert
    expect(blockCanHaveChildren(textBlock)).toBe(false);
  });

  test("heading blocks cannot have children", () => {
    // Arrange
    const headingBlock: Block = {
      id: "heading-block-1",
      type: "heading",
      parentId: "root",
      data: { text: "some_text", level: 1 },
    };

    // Assert
    expect(blockCanHaveChildren(headingBlock)).toBe(false);
  });

  test("toggle list blocks can have children", () => {
    // Arrange
    const toggleListBlock: Block = {
      id: "toggle-list-block-1",
      type: "toggle-list",
      data: { open: true },
      parentId: "root",
    };

    // Assert
    expect(blockCanHaveChildren(toggleListBlock)).toBe(true);
  });
});

describe("blockPayloadCanHaveChildren()", () => {
  test("text blocks cannot have children", () => {
    // Arrange
    const textBlockPayload: BlockPayload = {
      id: "text-block-1",
      type: "text",
      data: { text: "some_text" },
    };

    // Assert
    expect(blockPayloadCanHaveChildren(textBlockPayload)).toBe(false);
  });

  test("heading blocks cannot have children", () => {
    // Arrange
    const headingBlockPayload: BlockPayload = {
      id: "heading-block-1",
      type: "heading",
      data: { text: "some_text", level: 1 },
    };

    // Assert
    expect(blockPayloadCanHaveChildren(headingBlockPayload)).toBe(false);
  });

  test("toggle list blocks can have children", () => {
    // Arrange
    const toggleListBlockPayload: BlockPayload = {
      id: "toggle-list-block-1",
      type: "toggle-list",
      data: { open: true },
    };

    // Assert
    expect(blockPayloadCanHaveChildren(toggleListBlockPayload)).toBe(true);
  });
});

describe("getUpdatedBlockParentChildren()", () => {
  it("throws an error if the index of the block to remove in the parent is less than 0", () => {
    // Arrange
    const originalParentChildren: Block[] = [
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
    ];

    const newDocumentBlock: Block = {
      id: "block-4",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    const indexOfBlockToRemoveInParent = -1;

    // Assert
    expect(() =>
      getUpdatedBlockParentChildren(
        originalParentChildren,
        newDocumentBlock,
        indexOfBlockToRemoveInParent,
      ),
    ).toThrowError("Index cannot be less than 0!");
  });

  it("throws an error if the index of the block to remove in the parent is greater than or equal to the length of the parent children array", () => {
    // Arrange
    const originalParentChildren: Block[] = [
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
    ];

    const newDocumentBlock: Block = {
      id: "block-4",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    const indexOfBlockToRemoveInParent = 2;

    // Assert
    expect(() =>
      getUpdatedBlockParentChildren(
        originalParentChildren,
        newDocumentBlock,
        indexOfBlockToRemoveInParent,
      ),
    ).toThrowError(
      "Index cannot be greater than the length of the parent children array!",
    );
  });

  it("replaces the block in the parent children array with the new block and returns the new children array correctly", () => {
    // Arrange
    const originalParentChildren: Block[] = [
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
      {
        id: "block-2",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
      {
        id: "block-3",
        type: "toggle-list",
        data: { open: true },
        parentId: "root",
        children: [
          {
            id: "block-3-child-1",
            type: "text",
            data: { text: "some_text" },
            parentId: "block-3",
          },
        ],
      },
    ];

    const newDocumentBlock: Block = {
      id: "block-4",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    const indexOfBlockToRemoveInParent = 2;

    // Act
    const newParentChildren = getUpdatedBlockParentChildren(
      originalParentChildren,
      newDocumentBlock,
      indexOfBlockToRemoveInParent,
    );

    // Assert
    expect(newParentChildren).toEqual([
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
      {
        id: "block-2",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
      {
        id: "block-4",
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      },
    ]);

    expect(originalParentChildren).not.toBe(newParentChildren);
  });
});

describe("getUpdatedBlockChildren()", () => {
  it("returns an empty array if the keepChildren parameter is false", () => {
    // Arrange
    const blockChildren: BlockPayload[] = [];

    // Act
    const updatedChildren = getUpdatedBlockChildren(blockChildren, "root", false);

    // Assert
    expect(updatedChildren).toEqual([]);
    expect(updatedChildren).not.toBe(blockChildren);
  });

  it("returns the new block children array if the keepChildren parameter is true", () => {
    // Arrange
    const blockChildren: BlockPayload[] = [
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
      },
      {
        id: "block-2",
        type: "text",
        data: { text: "some_text" },
      },
      {
        id: "block-3",
        type: "toggle-list",
        data: { open: true },
        children: [
          {
            id: "block-3-child-1",
            type: "text",
            data: { text: "some_text" },
          },
          {
            id: "block-3-child-2",
            type: "toggle-list",
            data: { open: true },
            children: [
              {
                id: "block-3-child-2-child-1",
                type: "text",
                data: { text: "some_text" },
              },
            ],
          },
        ],
      },
    ];

    const newParentId = "new-parent-1";

    // Act
    const updatedChildren = getUpdatedBlockChildren(
      blockChildren,
      newParentId,
      true,
    );

    // Assert
    expect(updatedChildren).toEqual([
      {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId: newParentId,
      },
      {
        id: "block-2",
        type: "text",
        data: { text: "some_text" },
        parentId: newParentId,
      },
      {
        id: "block-3",
        type: "toggle-list",
        data: { open: true },
        parentId: newParentId,
        children: [
          {
            id: "block-3-child-1",
            type: "text",
            data: { text: "some_text" },
          },
          {
            id: "block-3-child-2",
            type: "toggle-list",
            data: { open: true },
            children: [
              {
                id: "block-3-child-2-child-1",
                type: "text",
                data: { text: "some_text" },
              },
            ],
          },
        ],
      },
    ]);

    expect(updatedChildren).not.toBe(blockChildren);
    expect(updatedChildren[0]).not.toBe(blockChildren[0]);
    expect(updatedChildren[1]).not.toBe(blockChildren[1]);
    expect(updatedChildren[2]).not.toBe(blockChildren[2]);
  });
});

describe("getChildren()", () => {
  test.each([[undefined], [null]])(
    "returns an empty array if the node passed is %s",
    node => {
      // Assert
      expect(getChildren(node)).toEqual([]);
    },
  );

  it("returns the children of the node if the node passed has children", () => {
    // Arrange
    const node: DocumentNode = {
      id: "node-1",
      children: [
        {
          id: "child-1",
          type: "text",
          data: { text: "some_text" },
          parentId: "node-1",
        },
        {
          id: "child-2",
          type: "toggle-list",
          data: { open: true },
          parentId: "node-1",
          children: [],
        },
      ],
    };

    // Assert
    expect(getChildren(node)).toBe(node.children);
  });

  it("returns an empty array if the node passed has no children", () => {
    // Arrange
    const node: DocumentNode = {
      id: "node-1",
    };

    // Assert
    expect(getChildren(node)).toEqual([]);
  });
});

describe("getPayloadChildren()", () => {
  test.each([[undefined], [null]])(
    "returns an empty array if the payload passed is %s",
    payload => {
      // Assert
      expect(getPayloadChildren(payload)).toEqual([]);
    },
  );

  it("returns the children of the payload if the payload passed has children", () => {
    // Arrange
    const payload: BlockPayload = {
      id: "payload-1",
      type: "toggle-list",
      data: { open: true },
      children: [{ id: "child-1", type: "text", data: { text: "some_text" } }],
    };

    // Assert
    expect(getPayloadChildren(payload)).toBe(payload.children);
  });

  it("returns an empty array if the payload passed has no children", () => {
    // Arrange
    const payload: BlockPayload = {
      id: "payload-1",
      type: "toggle-list",
      data: { open: true },
    };

    // Assert
    expect(getPayloadChildren(payload)).toEqual([]);
  });
});

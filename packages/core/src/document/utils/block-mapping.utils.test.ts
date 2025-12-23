import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { EditorDocument } from "../EditorDocument";
import { BlockCannotHaveChildrenError } from "../errors/common";
import type { BlockPayload } from "../models/document-payload.models";
import {
  blockPayloadToDocumentBlock,
  buildMapFromRoot,
} from "./block-mapping.utils";

describe("buildMapFromRoot()", () => {
  it("returns a map with the id of the block as the key and the block as the value", () => {
    // Arrange
    const editorDocument = new EditorDocument();

    editorDocument.appendChild(editorDocument.ROOT_ID, {
      id: "block-1",
      type: "text",
      data: { text: "some_text" },
    });

    editorDocument.appendChild(editorDocument.ROOT_ID, {
      id: "block-2",
      type: "text",
      data: { text: "some_text" },
    });

    editorDocument.appendChild(editorDocument.ROOT_ID, {
      id: "toggle-list-1",
      type: "toggle-list",
      data: { open: true },
      children: [
        {
          id: "toggle-list-1-child-1",
          type: "text",
          data: { text: "some_text" },
        },
        {
          id: "toggle-list-1-child-2",
          type: "toggle-list",
          data: { open: true },
          children: [
            {
              id: "toggle-list-1-child-2-child-1",
              type: "text",
              data: { text: "some_text" },
            },
          ],
        },
      ],
    });

    // Act
    const map = buildMapFromRoot(editorDocument.getRoot());

    // Assert
    expect(map.size).toBe(6);
    expect(map.get("block-1")).toBe(editorDocument.getRoot().children[0]);
    expect(map.get("block-2")).toBe(editorDocument.getRoot().children[1]);
    expect(map.get("toggle-list-1")).toBe(editorDocument.getRoot().children[2]);

    expect(map.get("toggle-list-1-child-1")).toBe(
      editorDocument.getRoot().children[2]?.children?.[0],
    );

    expect(map.get("toggle-list-1-child-2")).toBe(
      editorDocument.getRoot().children[2]?.children?.[1],
    );

    expect(map.get("toggle-list-1-child-2-child-1")).toBe(
      editorDocument.getRoot().children[2]?.children?.[1]?.children?.[0],
    );
  });

  it("returns an empty map if the root passed has no children", () => {
    // Arrange
    const editorDocument = new EditorDocument();

    // Act
    const map = buildMapFromRoot(editorDocument.getRoot());

    // Assert
    expect(map.size).toBe(0);
  });
});

describe("blockPayloadToDocumentBlock()", () => {
  it("throws an error if the block cannot have children and the user passes children through the payload no matter how many level deep they are in the new subtree", () => {
    // Arrange
    const blockPayload: BlockPayload = {
      id: "block-payload-1",
      type: "toggle-list",
      data: { open: true },
      children: [
        {
          id: "child-block-1",
          type: "toggle-list",
          data: { open: true },
          children: [
            {
              id: "child-block-1-1",
              type: "text",
              data: { text: "some_text" },
              children: [
                {
                  id: "child-block-1-1-1",
                  type: "text",
                  data: { text: "some_text" },
                },
              ],
            },
          ],
        },
      ],
    };

    const tryConvert = () => blockPayloadToDocumentBlock(blockPayload, "root");

    // Assert
    assertEngineError(tryConvert, {
      ExpectedErrorClass: BlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Block with ID child-block-1-1 cannot have children!`,
      expectedContext: { blockId: "child-block-1-1" },
    });
  });

  it("returns a document block based on the block payload passed", () => {
    // Arrange
    const blockPayload: BlockPayload = {
      id: "block-payload-1",
      type: "text",
      data: { text: "some_text" },
    };

    // Act
    const documentBlock = blockPayloadToDocumentBlock(blockPayload, "root");

    // Assert
    expect(documentBlock).toEqual({
      id: "block-payload-1",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    });
  });

  it("copies deeply the data and the children of the block payload passed", () => {
    // Arrange
    const PARENT_ID = "parent-block-1";
    const blockPayload: BlockPayload = {
      id: "block-payload-1",
      type: "toggle-list",
      data: { open: true },
      children: [
        {
          id: "child-block-1",
          type: "toggle-list",
          data: { open: true },
          children: [
            { id: "child-block-1-1", type: "text", data: { text: "some_text" } },
          ],
        },
        { id: "child-block-2", type: "text", data: { text: "some_text" } },
      ],
    };

    // Act
    const documentBlock = blockPayloadToDocumentBlock(blockPayload, PARENT_ID);

    // Assert
    expect(documentBlock).toEqual({
      id: "block-payload-1",
      type: "toggle-list",
      data: { open: true },
      parentId: PARENT_ID,
      children: [
        {
          id: "child-block-1",
          type: "toggle-list",
          data: { open: true },
          parentId: "block-payload-1",
          children: [
            {
              id: "child-block-1-1",
              type: "text",
              data: { text: "some_text" },
              parentId: "child-block-1",
            },
          ],
        },
        {
          id: "child-block-2",
          type: "text",
          data: { text: "some_text" },
          parentId: "block-payload-1",
        },
      ],
    });

    expect(documentBlock.data).not.toBe(blockPayload.data);
    expect(documentBlock.children).not.toBe(blockPayload.children);

    expect(documentBlock.children?.[0]).not.toBe(blockPayload.children?.[0]);
    expect(documentBlock.children?.[1]).not.toBe(blockPayload.children?.[1]);

    expect(documentBlock.children?.[0]?.children).not.toBe(
      blockPayload.children?.[0]?.children,
    );

    expect(documentBlock.children?.[0]?.children?.[0]).not.toBe(
      blockPayload.children?.[0]?.children?.[0],
    );
    expect(documentBlock.children?.[0]?.children?.[0]?.data).not.toBe(
      blockPayload.children?.[0]?.children?.[0]?.data,
    );

    expect(documentBlock.children?.[0]?.children?.[0]).not.toBe(
      blockPayload.children?.[0]?.children?.[0],
    );
    expect(documentBlock.children?.[0]?.children?.[0]?.data).not.toBe(
      blockPayload.children?.[0]?.children?.[0]?.data,
    );

    expect(documentBlock.children?.[0]?.children?.[0]?.data).not.toBe(
      blockPayload.children?.[0]?.children?.[0]?.data,
    );
    expect(documentBlock.children?.[0]?.children?.[0]?.data).not.toBe(
      blockPayload.children?.[0]?.children?.[0]?.data,
    );
  });

  test("the newly created block object has empty children array if the block type can have children and the user does not pass children", () => {
    // Arrange
    const blockPayload: BlockPayload = {
      id: "block-payload-1",
      type: "toggle-list",
      data: { open: true },
    };

    // Act
    const documentBlock = blockPayloadToDocumentBlock(blockPayload, "root");

    // Assert
    expect(documentBlock).toEqual({
      id: "block-payload-1",
      type: "toggle-list",
      data: { open: true },
      parentId: "root",
      children: [],
    });
  });
});

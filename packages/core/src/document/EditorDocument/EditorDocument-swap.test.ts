import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { EditorDocument } from "./EditorDocument";

describe("swap()", () => {
  it("swaps the document with a new one correctly when a JSON string is passed", () => {
    // Arrange
    const json = `
    {
      "id": "root",
      "children": [
        {
          "id": "toggle-list1",
          "parentId": "root",
          "type": "toggle-list",
          "data": { "open": false },
          "children": []
        },
        {
          "id": "toggle-list2",
          "parentId": "root",
          "type": "toggle-list",
          "data": { "open": true },
          "children": []
        }
      ]
    }
    `;

    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [expect.objectContaining(SAMPLE_BLOCK1)],
      }),
    );

    // Act
    document.swap(json);

    // Assert
    const root = document.getRoot();
    expect(document.getBlock("toggle-list1")).toBe(root.children[0]);
    expect(document.getBlock("toggle-list2")).toBe(root.children[1]);
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();

    expect(root).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: "toggle-list1",
            parentId: document.ROOT_ID,
            type: "toggle-list",
            data: { open: false },
          }),

          expect.objectContaining({
            id: "toggle-list2",
            parentId: document.ROOT_ID,
            type: "toggle-list",
            data: { open: true },
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("swaps the document with a new one correctly when a document root instance is passed", () => {
    // Arrange
    const rootToSwapWit = new DocumentRoot("root", [
      {
        id: "h1",
        type: "heading",
        data: { text: "Heading 1", level: 1 },
        parentId: "root",
      },
      {
        id: "p1",
        type: "text",
        data: { text: "Paragraph 1 after Heading 1" },
        parentId: "root",
      },
    ]);

    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [expect.objectContaining(SAMPLE_BLOCK1)],
      }),
    );

    // Act
    document.swap(rootToSwapWit);

    // Assert
    const root = document.getRoot();
    expect(document.getBlock("h1")).toBe(root.children[0]);
    expect(document.getBlock("p1")).toBe(root.children[1]);
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();

    expect(root).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: "h1",
            parentId: document.ROOT_ID,
            type: "heading",
            data: { text: "Heading 1", level: 1 },
          }),

          expect.objectContaining({
            id: "p1",
            parentId: document.ROOT_ID,
            type: "text",
            data: { text: "Paragraph 1 after Heading 1" },
          }),
        ],
      }),
    );
  });

  it("swaps the document with a new one correctly when another EditorDocument instance is passed", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1);

    const documentToSwapWith = new EditorDocument();

    documentToSwapWith.appendChild(documentToSwapWith.ROOT_ID, TOGGLE_LIST2_BLOCK);
    documentToSwapWith.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK2);

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK1.id,
              }),
            ],
          }),
        ],
      }),
    );

    expect(documentToSwapWith.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),
            ],
          }),
        ],
      }),
    );

    // Act
    document.swap(documentToSwapWith);

    // Assert
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(documentToSwapWith.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      documentToSwapWith.getRoot().children?.[0],
    );

    expect(documentToSwapWith.getBlock(SAMPLE_BLOCK2.id)).toBe(
      documentToSwapWith.getRoot().children[0].children?.[0],
    );

    expect(document.getRoot()).toStrictEqual(documentToSwapWith.getRoot());

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: documentToSwapWith.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST2_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

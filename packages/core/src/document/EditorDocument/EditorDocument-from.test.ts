import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("EditorDocument.from()", () => {
  it("returns a new EditorDocument instance that is a deep clone if the passed element is an EditorDocument instance", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild("root", TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4);

    // Act
    const newDocument = EditorDocument.from(document);

    // Assert
    expect(newDocument.getRoot()).not.toBe(document.getRoot());
    expect(newDocument.getRoot()).toStrictEqual(document.getRoot());

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).not.toBe(
      newDocument.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).not.toBe(
      newDocument.getBlock(TOGGLE_LIST2_BLOCK.id),
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).not.toBe(
      newDocument.getBlock(SAMPLE_BLOCK4.id),
    );

    expect(newDocument).not.toBe(document);
    expect(newDocument.toJSON()).toBe(document.toJSON());
    expect(newDocument.size).toBe(4);

    assertTreeIntegrity(document);
    assertTreeIntegrity(newDocument);
  });

  it("returns a new  EditorDocument instance that is a deep clone if the passed element is a DocumentRoot instance", () => {
    // Arrange
    const documentRoot = new DocumentRoot("root", [
      {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [
          {
            ...TOGGLE_LIST2_BLOCK,
            parentId: TOGGLE_LIST1_BLOCK.id,
            children: [{ ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST2_BLOCK.id }],
          },
        ],
      },
    ]);

    // Act
    const newDocument = EditorDocument.from(documentRoot);

    // Assert
    expect(newDocument.getRoot()).not.toBe(documentRoot);
    expect(newDocument.getRoot()).toStrictEqual(documentRoot);

    expect(documentRoot.children.at(0)).not.toBe(
      newDocument.getRoot().children.at(0),
    );

    expect(documentRoot.children.at(0)).toStrictEqual(
      newDocument.getRoot().children.at(0),
    );

    expect(documentRoot.children.at(0)?.children?.at(0)).not.toBe(
      newDocument.getRoot().children.at(0)?.children?.at(0),
    );

    expect(newDocument.size).toBe(4);
    assertTreeIntegrity(newDocument);
  });

  it("returns a new EditorDocument instance that is a deep clone if the passed element is a JSON string", () => {
    // Arrange
    const json = `
      {
        "id": "root",
        "children": [
            {
              "id": "toggle-list-1",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": false },
              "children": [
                {
                  "id": "toggle-list-2",
                  "parentId": "toggle-list-1",
                  "type": "toggle-list",
                  "data": { "open": true },
                  "children": [
                      {
                          "id": "text-1",
                          "parentId": "toggle-list-2",
                          "type": "text",
                          "data": { "text": "Hello test234" }
                      }
                  ]
                }
              ]
            }
        ]
      }
  `;

    // Act
    const newDocument = EditorDocument.from(json);

    // Assert
    expect(newDocument.getRoot()).toEqual({
      id: "root",
      children: [
        {
          id: "toggle-list-1",
          parentId: "root",
          type: "toggle-list",
          data: { open: false },
          children: [
            {
              id: "toggle-list-2",
              parentId: "toggle-list-1",
              type: "toggle-list",
              data: { open: true },
              children: [
                {
                  id: "text-1",
                  parentId: "toggle-list-2",
                  type: "text",
                  data: { text: "Hello test234" },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(newDocument.getBlock("toggle-list-1")).toBe(
      newDocument.getRoot().children.at(0),
    );

    expect(newDocument.getBlock("toggle-list-2")).toBe(
      newDocument.getRoot().children.at(0)?.children?.at(0),
    );

    expect(newDocument.getBlock("text-1")).toBe(
      newDocument.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(newDocument.size).toBe(4);
    assertTreeIntegrity(newDocument);
  });

  test.each([null, undefined])(
    "returns a new EditorDocument instance if the passed element is %s",
    element => {
      // Act
      const newDocument = EditorDocument.from(element);

      // Assert
      expect(newDocument).toBeInstanceOf(EditorDocument);

      expect(newDocument.getRoot()).toEqual({
        id: EditorDocument.ROOT_ID,
        children: [],
      });

      expect(newDocument.size).toBe(1);
      assertTreeIntegrity(newDocument);
    },
  );
});

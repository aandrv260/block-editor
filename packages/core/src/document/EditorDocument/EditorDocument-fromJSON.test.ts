import { assertTreeIntegrity } from "../utils/document-test.utils";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { EditorDocument } from "./EditorDocument";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockIsNotAnObjectError, ParentBlockNotFoundError } from "../errors/common";
import {
  DuplicateOrCircularBlockError,
  InvalidBlockIDError,
  InvalidBlockParentIDError,
  InvalidBlockTypeError,
  InvalidBlockVariantError,
  InvalidDocumentJSONError,
  InvalidDocumentRootIDError,
  InvalidDocumentStructureError,
} from "../errors/factories";

describe("EditorDocument.fromJSON()", () => {
  test.each([
    ["some_randinifdfff"],
    ["[aaaa}]"],
    ["{[reee}]"],
    ["{test: 123}"],
    ['{ "id": 4343f }'],
  ])("throws an error if invalid JSON `%s` is passed", json => {
    // Assert
    const tryParse = () => EditorDocument.fromJSON(json);

    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentJSONError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_JSON",
      expectedMessage: "Invalid JSON format — cannot parse document.",
    });
  });

  it("throws an error if the root misses an ID property", () => {
    // Assert
    const tryParse = () => EditorDocument.fromJSON('{ "children": [] }');

    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentStructureError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
      expectedMessage:
        "Invalid document structure — root block missing or incorrect.",
    });
  });

  it("throws an error if the root's ID is not equal to the default ROOT ID", () => {
    const tryParse = () =>
      EditorDocument.fromJSON('{ "id": "roog", "children": [] }');

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentRootIDError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_ROOT_ID",
      expectedMessage: "Invalid root ID detected: roog",
      expectedContext: { rootId: "roog" },
    });
  });

  it("throws an error if the root's ID is not a string", () => {
    const tryParse = () => EditorDocument.fromJSON('{ "id": 123, "children": [] }');

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentRootIDError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_ROOT_ID",
      expectedMessage: "Invalid root ID detected: 123",
      expectedContext: { rootId: 123 },
    });
  });

  it("throws an error if the root misses children property", () => {
    // Arrange
    const tryParse = () => EditorDocument.fromJSON('{ "id": "some_id" }');

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentStructureError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
      expectedMessage:
        "Invalid document structure — root block missing or incorrect.",
    });
  });

  it("throws an error if at least one of the root's descendants doesn't have a parentID link", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "111-root",
              "parentId": "root",
              "type": "heading",
              "data": {
                "text": "Hello",
                "level": 1
              }
            },
            {
              "id": "222-root",
              "type": "text",
              "data": {
                "text": "Hello"
              }
            }
          ]
        }
    `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidBlockParentIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_PARENT_ID",
      expectedMessage:
        "Missing or invalid parentId for block ID: 222-root. Parent ID must always be a string!",
      expectedContext: { parentId: undefined, blockId: "222-root" },
    });
  });

  it("throws an error if there are duplicate blocks", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "111-root",
              "parentId": "root",
              "type": "text",
              "data": {
                "text": "Hello test134"
              }
            },
            {
              "id": "111-root",
              "parentId": "root",
              "type": "text",
              "data": {
                "text": "Hello test134"
              }
            }
          ]
        }
      `;

    // Assert
    const tryParse = () => EditorDocument.fromJSON(json);

    assertEngineError(tryParse, {
      ExpectedErrorClass: DuplicateOrCircularBlockError,
      expectedCode: "DOCUMENT:DUPLICATE_OR_CIRCULAR_BLOCK",
      expectedMessage: "Duplicate or circular block ID detected: 111-root",
      expectedContext: { blockId: "111-root" },
    });
  });

  it("throws an error if there are circular relationships", () => {
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
              "children": [
                {
                  "id": "toggle-list2",
                  "parentId": "toggle-list1",
                  "type": "toggle-list",
                  "data": {
                    "open": false
                  },
                  "children": [
                    {
                      "id": "toggle-list1",
                      "parentId": "toggle-list2",
                      "type": "toggle-list",
                      "data": {
                        "open": false
                      },
                      "children": []
                    }
                  ]
                }
              ]
            }
          ]
        }
      `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: DuplicateOrCircularBlockError,
      expectedCode: "DOCUMENT:DUPLICATE_OR_CIRCULAR_BLOCK",
      expectedMessage: "Duplicate or circular block ID detected: toggle-list1",
      expectedContext: { blockId: "toggle-list1" },
    });
  });

  it("throws an error if the parentID is not a valid ID that belongs to a block in the document", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "111-root",
              "parentId": "root13",
              "type": "paragraph",
              "children": []
            }
          ]
        }
      `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert

    assertEngineError(tryParse, {
      ExpectedErrorClass: ParentBlockNotFoundError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_NOT_FOUND",
      expectedMessage: 'Parent with ID "root13" not found for block "111-root".',
      expectedContext: { parentId: "root13", blockId: "111-root" },
    });
  });

  it("throws an error if the parentID of the block does not point to the block's direct parent in the document", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "toggle-list1",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": true },
              "children": [
                {
                  "id": "p1",
                  "parentId": "root",
                  "type": "text",
                  "data": {
                    "text": "Hello test134"
                  }
                }
              ]
            },
            {
              "id": "p2",
              "parentId": "root",
              "type": "text",
              "data": {
                "text": "Hello test234"
              }
            }
          ]
        }
      `;

    // Assert
    const tryParse = () => EditorDocument.fromJSON(json);

    assertEngineError(tryParse, {
      ExpectedErrorClass: ParentBlockNotFoundError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_NOT_FOUND",
      expectedMessage: 'Parent with ID "root" not found for block "p1".',
      expectedContext: { parentId: "root", blockId: "p1" },
    });
  });

  it("throws an error if the block doesn't have a type", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "111-root",
              "parentId": "root",
              "children": []
            }
          ]
        }
      `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage: "Invalid block type undefined for block ID: 111-root",
      expectedContext: { blockId: "111-root", blockType: undefined },
    });
  });

  it("throws an error if the block doesn't have a valid type", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "111-root",
              "parentId": "root",
              "type": "some_invalid_type",
              "children": []
            }
          ]
        }
      `;

    // Assert
    const tryParse = () => EditorDocument.fromJSON(json);

    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage: "Invalid block type some_invalid_type for block ID: 111-root",
      expectedContext: { blockId: "111-root", blockType: "some_invalid_type" },
    });
  });

  it("throws an error if at least one of the document blocks does not have an ID", () => {
    // Arrange
    const json = `
        {
          "id": "root",
          "children": [
            {
              "id": "toggle-list1",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": true },
              "children": [
                {
                  "id": "toggle-list2",
                  "parentId": "toggle-list1",
                  "type": "toggle-list",
                  "data": { "open": false },
                  "children": [
                    {
                      "parentId": "toggle-list2",
                      "type": "text",
                      "data": {
                        "text": "Hello test134"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidBlockIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_ID",
      expectedMessage:
        "Missing or invalid block ID for block with parent ID: toggle-list2. ID must always be a string!",
      expectedContext: { parentId: "toggle-list2", blockId: undefined },
    });
  });

  it.todo(
    "test all of the block variant regressions that may happen. for instance, heading level number, structure, etc. split into multiple tests.",
  );

  test.each([
    ['{ "texte": "Hello test134" }'],
    ["{}"],
    ['{ "level": 1 }'],
    ['{ "test": "134" }'],
  ])(
    "throws an error one of the blocks is heading and its specific `data` structure is invalid",
    serializedData => {
      // Arrange
      const json = `
      {
        "id": "root",
        "children": [
          {
            "id": "heading1",
            "parentId": "root",
            "type": "heading",
            "data": ${serializedData},
            "children": []
          }
        ]
      }
    `;

      // Assert
      const tryParse = () => EditorDocument.fromJSON(json);

      assertEngineError(tryParse, {
        ExpectedErrorClass: InvalidBlockVariantError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_VARIANT",
        expectedMessage:
          "Block type heading with ID heading1 has invalid properties.",
        expectedContext: { blockId: "heading1", blockType: "heading" },
      });
    },
  );

  test.each([
    ['{ "texte": "Hello test134" }'],
    ["{}"],
    ['{ "level": 1 }'],
    ['{ "test": "134" }'],
  ])(
    "throws an error one of the blocks is text and its specific `data` structure is invalid",
    serializedData => {
      // Arrange
      const json = `
      {
        "id": "root",
        "children": [
          {
            "id": "text1",
            "parentId": "root",
            "type": "text",
            "data": ${serializedData},
            "children": []
          }
        ]
      }
    `;

      const tryParse = () => EditorDocument.fromJSON(json);

      // Assert
      assertEngineError(tryParse, {
        ExpectedErrorClass: InvalidBlockVariantError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_VARIANT",
        expectedMessage: "Block type text with ID text1 has invalid properties.",
        expectedContext: { blockId: "text1", blockType: "text" },
      });
    },
  );

  it("creates a document with a root and a child block correctly", () => {
    // Arrange
    const json = `
          {
            "id": "root",
            "children": [
            {
              "id": "toggle-list1",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": true },
              "children": []
            },
            {
              "id": "toggle-list2",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": false },
              "children": [
                {
                  "id": "p1",
                  "parentId": "toggle-list2",
                  "type": "text",
                  "data": {
                    "text": "Hello test234"
                  }
                }
              ]
            }
          ]
        }
      `;

    // Assert
    const document = EditorDocument.fromJSON(json);

    const assertCorrectToggleList1Block = () =>
      expect.objectContaining({
        id: "toggle-list1",
        parentId: "root",
        type: "toggle-list",
        data: { open: true },
        children: [],
      });

    const assertCorrectP1Block = () =>
      expect.objectContaining({
        id: "p1",
        parentId: "toggle-list2",
        type: "text",
        data: { text: "Hello test234" },
      });

    const assertCorrectToggleList2Block = () =>
      expect.objectContaining({
        id: "toggle-list2",
        parentId: "root",
        type: "toggle-list",
        data: { open: false },
        children: [assertCorrectP1Block()],
      });

    expect(document.getBlock("toggle-list1")).toEqual(
      assertCorrectToggleList1Block(),
    );

    expect(document.getBlock("p1")).toEqual(assertCorrectP1Block());

    expect(document.getBlock("toggle-list2")).toEqual(
      assertCorrectToggleList2Block(),
    );

    expect(document.getRoot().id).toBe("root");
    expect(document.getRoot()).toBeInstanceOf(DocumentRoot);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: "toggle-list1",
            parentId: "root",
            type: "toggle-list",
            data: { open: true },
            children: [],
          }),

          expect.objectContaining({
            id: "toggle-list2",
            parentId: "root",
            type: "toggle-list",
            data: { open: false },
            children: [
              {
                id: "p1",
                parentId: "toggle-list2",
                type: "text",
                data: {
                  text: "Hello test234",
                },
              },
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(document);
  });

  test.each([[null], [true], [false]])(
    "throws an error if a block is not an object",
    block => {
      // Arrange
      const json = `
      {
        "id": "root",
        "children": [
          ${block}
        ]
      }
    `;

      // Assert
      const tryParse = () => EditorDocument.fromJSON(json);

      assertEngineError(tryParse, {
        ExpectedErrorClass: BlockIsNotAnObjectError,
        expectedCode: "DOCUMENT:BLOCK_IS_NOT_AN_OBJECT",
        expectedMessage: `Block is not an object!`,
        expectedContext: { block },
      });
    },
  );

  it("creates two identical documents from the same JSON", () => {
    // Arrange
    const json = `
      {
        "id": "root",
        "children": [
          {
            "id": "toggle-list1",
            "parentId": "root",
            "type": "toggle-list",
            "data": { "open": true },
            "children": [
              {
                "id": "p1",
                "parentId": "toggle-list1",
                "type": "text",
                "data": { "text": "Hello paragraph1" }
              },
              {
                "id": "p2",
                "parentId": "toggle-list1",
                "type": "text",
                "data": { "text": "Hello paragraph2" }
              }
            ]
          },
          {
            "id": "p3",
            "parentId": "root",
            "type": "text",
            "data": { "text": "Hello paragraph1" }
          },
          {
            "id": "p4",
            "parentId": "root",
            "type": "heading",
            "data": { "text": "Hello heading2", "level": 2 }
          },
          {
            "id": "p5",
            "parentId": "root",
            "type": "text",
            "data": { "text": "Hello paragraph2" }
          }
        ]
      }
    `;

    // Assert
    const document1 = EditorDocument.fromJSON(json);
    const document2 = EditorDocument.fromJSON(json);
    const document3 = EditorDocument.fromJSON(json);
    const document4 = EditorDocument.fromJSON(json);

    expect(document1).toStrictEqual(document2);
    expect(document1).toStrictEqual(document3);
    expect(document1).toStrictEqual(document4);

    expect(document1.toJSON()).toEqual(document2.toJSON());
    expect(document1.toJSON()).toEqual(document3.toJSON());
    expect(document1.toJSON()).toEqual(document4.toJSON());

    assertTreeIntegrity(document1);
    assertTreeIntegrity(document2);
    assertTreeIntegrity(document3);
    assertTreeIntegrity(document4);
  });

  it("works perfectly fine when appending, asserting and removing blocks", () => {
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
              "children": [
                {
                  "id": "p1",
                  "parentId": "toggle-list1",
                  "type": "text",
                  "data": { "text": "Paragraph 1" }
                }
              ]
            },
            {
              "id": "p2",
              "parentId": "root",
              "type": "text",
              "data": {
                "text": "Hello test134"
              }
            }
          ]
        }
      `;

    // Act
    const document = EditorDocument.fromJSON(json);

    // Assert
    expect(document.getBlock("toggle-list1")).toStrictEqual(
      expect.objectContaining({
        id: "toggle-list1",
        parentId: "root",
        type: "toggle-list",
        data: { open: false },
        children: [
          expect.objectContaining({
            id: "p1",
            parentId: "toggle-list1",
            type: "text",
            data: { text: "Paragraph 1" },
          }),
        ],
      }),
    );

    expect(document.getBlock("p1")).toStrictEqual(
      expect.objectContaining({
        id: "p1",
        parentId: "toggle-list1",
        type: "text",
        data: { text: "Paragraph 1" },
      }),
    );

    expect(document.getBlock("p2")).toStrictEqual(
      expect.objectContaining({
        id: "p2",
        parentId: "root",
        type: "text",
        data: {
          text: "Hello test134",
        },
      }),
    );

    expect(document["blocksMap"].size).toBe(3);
    assertTreeIntegrity(document);
  });

  it("deserializes and then serializes a document correctly", () => {
    // Arrange
    const json = `
      {
        "id": "root",
        "children": [
          {
            "id": "toggle-list1",
            "parentId": "root",
            "type": "toggle-list",
            "data": { "open": true },
            "children": [
              {
                "id": "toggle-list2",
                "parentId": "toggle-list1",
                "type": "toggle-list",
                "data": { "open": false },
                "children": [
                  {
                    "id": "p1",
                    "parentId": "toggle-list2",
                    "type": "text",
                    "data": { "text": "Paragraph 2 in Paragraph 1 in Heading 1" }
                  }
                ]
              }
            ]
          }
        ]
      }
    `;

    // Act
    const document = EditorDocument.fromJSON(json);

    // Assert
    expect(document.getBlock("toggle-list1")).toStrictEqual(
      expect.objectContaining({
        id: "toggle-list1",
        type: "toggle-list",
        data: { open: true },
        children: [
          expect.objectContaining({
            id: "toggle-list2",
            type: "toggle-list",
            data: { open: false },
            children: [
              expect.objectContaining({
                id: "p1",
                type: "text",
                data: { text: "Paragraph 2 in Paragraph 1 in Heading 1" },
              }),
            ],
          }),
        ],
      }),
    );

    expect(document.getBlock("toggle-list2")).toBeInstanceOf(Object);
    expect(document.getBlock("p1")).toBeInstanceOf(Object);

    assertTreeIntegrity(document);

    const serializedDocument = document.toJSON();

    expect(JSON.parse(serializedDocument)).toEqual(JSON.parse(json));
    expect(serializedDocument).toEqual(JSON.stringify(JSON.parse(json), null, 2));
  });
});

import { assertTreeIntegrity } from "../utils/document-test.utils";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { EditorDocument } from "./EditorDocument";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { ParentBlockNotFoundError, type DocumentIssue } from "../errors/common";
import {
  DuplicateOrCircularBlockError,
  InvalidDocumentError,
  InvalidDocumentJSONError,
} from "../errors/factories";

const assertInvalidDocument = (tryParse: () => unknown, issues: DocumentIssue[]) =>
  assertEngineError(tryParse, {
    ExpectedErrorClass: InvalidDocumentError,
    expectedCode: "DOCUMENT:INVALID_DOCUMENT",
    expectedMessage: `Invalid document. ${issues.map(({ path, message }) => `${path}: ${message}`).join("; ")}`,
    expectedContext: { issues },
  });

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

    assertInvalidDocument(tryParse, [
      { path: "id", message: 'Invalid key: Expected "id" but received undefined' },
    ]);
  });

  it("throws an error if the root's ID is not equal to the default ROOT ID", () => {
    const tryParse = () =>
      EditorDocument.fromJSON('{ "id": "roog", "children": [] }');

    // Assert
    assertInvalidDocument(tryParse, [
      { path: "id", message: 'Invalid type: Expected "root" but received "roog"' },
    ]);
  });

  it("throws an error if the root's ID is not a string", () => {
    const tryParse = () => EditorDocument.fromJSON('{ "id": 123, "children": [] }');

    // Assert
    assertInvalidDocument(tryParse, [
      { path: "id", message: 'Invalid type: Expected "root" but received 123' },
    ]);
  });

  it("throws an error if the root misses children property", () => {
    // Arrange
    const tryParse = () => EditorDocument.fromJSON('{ "id": "some_id" }');

    // Assert
    assertInvalidDocument(tryParse, [
      {
        path: "id",
        message: 'Invalid type: Expected "root" but received "some_id"',
      },
      {
        path: "children",
        message: 'Invalid key: Expected "children" but received undefined',
      },
    ]);
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
                "content": [{ "text": "Hello", "marks": [] }],
                "level": 1
              }
            },
            {
              "id": "222-root",
              "type": "text",
              "data": {
                "content": [{ "text": "Hello", "marks": [] }]
              }
            }
          ]
        }
    `;

    const tryParse = () => EditorDocument.fromJSON(json);

    // Assert
    assertInvalidDocument(tryParse, [
      {
        path: "children.1.parentId",
        message: 'Invalid key: Expected "parentId" but received undefined',
      },
    ]);
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
                "content": [{ "text": "Hello test134", "marks": [] }]
              }
            },
            {
              "id": "111-root",
              "parentId": "root",
              "type": "text",
              "data": {
                "content": [{ "text": "Hello test134", "marks": [] }]
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
              "data": { "open": false, "content": [] },
              "children": [
                {
                  "id": "toggle-list2",
                  "parentId": "toggle-list1",
                  "type": "toggle-list",
                  "data": {
                    "open": false,
                    "content": []
                  },
                  "children": [
                    {
                      "id": "toggle-list1",
                      "parentId": "toggle-list2",
                      "type": "toggle-list",
                      "data": {
                        "open": false,
                        "content": []
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
              "type": "text",
              "data": {
                "content": [{ "text": "Hello", "marks": [] }]
              }
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
              "data": { "open": true, "content": [] },
              "children": [
                {
                  "id": "p1",
                  "parentId": "root",
                  "type": "text",
                  "data": {
                    "content": [{ "text": "Hello test134", "marks": [] }]
                  }
                }
              ]
            },
            {
              "id": "p2",
              "parentId": "root",
              "type": "text",
              "data": {
                "content": [{ "text": "Hello test234", "marks": [] }]
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
    assertInvalidDocument(tryParse, [
      {
        path: "children.0.type",
        message:
          'Invalid type: Expected ("heading" | "text" | "toggle-list" | "quote" | "callout" | "bullet-list") but received undefined',
      },
    ]);
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

    assertInvalidDocument(tryParse, [
      {
        path: "children.0.type",
        message:
          'Invalid type: Expected ("heading" | "text" | "toggle-list" | "quote" | "callout" | "bullet-list") but received "some_invalid_type"',
      },
    ]);
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
              "data": { "open": true, "content": [] },
              "children": [
                {
                  "id": "toggle-list2",
                  "parentId": "toggle-list1",
                  "type": "toggle-list",
                  "data": { "open": false, "content": [] },
                  "children": [
                    {
                      "parentId": "toggle-list2",
                      "type": "text",
                      "data": {
                        "content": [{ "text": "Hello test134", "marks": [] }]
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
    assertInvalidDocument(tryParse, [
      {
        path: "children.0.children.0.children.0.id",
        message: 'Invalid key: Expected "id" but received undefined',
      },
    ]);
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

      expect(tryParse).toThrow(InvalidDocumentError);
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
      expect(tryParse).toThrow(InvalidDocumentError);
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
              "data": { "open": true, "content": [] },
              "children": []
            },
            {
              "id": "toggle-list2",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": false, "content": [] },
              "children": [
                {
                  "id": "p1",
                  "parentId": "toggle-list2",
                  "type": "text",
                  "data": {
                    "content": [{ "text": "Hello test234", "marks": [] }]
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
        data: { open: true, content: [] },
        children: [],
      });

    const assertCorrectP1Block = () =>
      expect.objectContaining({
        id: "p1",
        parentId: "toggle-list2",
        type: "text",
        data: {
          content: [{ text: "Hello test234", marks: [] }],
        },
      });

    const assertCorrectToggleList2Block = () =>
      expect.objectContaining({
        id: "toggle-list2",
        parentId: "root",
        type: "toggle-list",
        data: { open: false, content: [] },
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
            data: { open: true, content: [] },
            children: [],
          }),

          expect.objectContaining({
            id: "toggle-list2",
            parentId: "root",
            type: "toggle-list",
            data: { open: false, content: [] },
            children: [
              {
                id: "p1",
                parentId: "toggle-list2",
                type: "text",
                data: {
                  content: [{ text: "Hello test234", marks: [] }],
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

      assertInvalidDocument(tryParse, [
        {
          path: "children.0",
          message: `Invalid type: Expected Object but received ${block}`,
        },
      ]);
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
            "data": { "open": true, "content": [] },
            "children": [
              {
                "id": "p1",
                "parentId": "toggle-list1",
                "type": "text",
                "data": {
                  "content": [{ "text": "Hello paragraph1", "marks": [] }]
                }
              },
              {
                "id": "p2",
                "parentId": "toggle-list1",
                "type": "text",
                "data": {
                  "content": [{ "text": "Hello paragraph2", "marks": [] }]
                }
              }
            ]
          },
          {
            "id": "p3",
            "parentId": "root",
            "type": "text",
            "data": {
              "content": [{ "text": "Hello paragraph1", "marks": [] }]
            }
          },
          {
            "id": "p4",
            "parentId": "root",
            "type": "heading",
            "data": {
              "content": [{ "text": "Hello heading2", "marks": [] }],
              "level": 2
            }
          },
          {
            "id": "p5",
            "parentId": "root",
            "type": "text",
            "data": {
              "content": [{ "text": "Hello paragraph2", "marks": [] }]
            }
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
              "data": { "open": false, "content": [] },
              "children": [
                {
                  "id": "p1",
                  "parentId": "toggle-list1",
                  "type": "text",
                  "data": {
                    "content": [{ "text": "Paragraph 1", "marks": [] }]
                  }
                }
              ]
            },
            {
              "id": "p2",
              "parentId": "root",
              "type": "text",
              "data": {
                "content": [{ "text": "Hello test134", "marks": [] }]
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
        data: { open: false, content: [] },
        children: [
          expect.objectContaining({
            id: "p1",
            parentId: "toggle-list1",
            type: "text",
            data: {
              content: [{ text: "Paragraph 1", marks: [] }],
            },
          }),
        ],
      }),
    );

    expect(document.getBlock("p1")).toStrictEqual(
      expect.objectContaining({
        id: "p1",
        parentId: "toggle-list1",
        type: "text",
        data: {
          content: [{ text: "Paragraph 1", marks: [] }],
        },
      }),
    );

    expect(document.getBlock("p2")).toStrictEqual(
      expect.objectContaining({
        id: "p2",
        parentId: "root",
        type: "text",
        data: {
          content: [{ text: "Hello test134", marks: [] }],
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
            "data": { "open": true, "content": [] },
            "children": [
              {
                "id": "toggle-list2",
                "parentId": "toggle-list1",
                "type": "toggle-list",
                "data": { "open": false, "content": [] },
                "children": [
                  {
                    "id": "p1",
                    "parentId": "toggle-list2",
                    "type": "text",
                    "data": {
                      "content": [{ "text": "Paragraph 2 in Paragraph 1 in Heading 1", "marks": [] }]
                    }
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
        data: { open: true, content: [] },
        children: [
          expect.objectContaining({
            id: "toggle-list2",
            type: "toggle-list",
            data: { open: false, content: [] },
            children: [
              expect.objectContaining({
                id: "p1",
                type: "text",
                data: {
                  content: [
                    { text: "Paragraph 2 in Paragraph 1 in Heading 1", marks: [] },
                  ],
                },
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

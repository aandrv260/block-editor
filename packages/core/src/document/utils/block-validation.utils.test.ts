import type { DocumentNode } from "../../blocks/models/block.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { InvalidBlockError, ParentBlockNotFoundError } from "../errors/common";
import { InvalidDocumentError } from "../errors/factories";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import {
  validateBlockParentLink,
  validateBlockStructure,
  validateDocumentStructure,
} from "./block-validation.utils";

const createDocumentWith = (block: unknown) => ({ id: "root", children: [block] });

const invalidBlocks: [string, unknown][] = [
  ["is-null", null],
  ["is-a-boolean", true],
  ["is-a-number", 1],
  ["is-a-string", "block"],
  [
    "has-no-id",
    {
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-a-non-string-id",
    {
      id: 1,
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-no-parent-id",
    {
      id: "1",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-a-non-string-parent-id",
    {
      id: "1",
      parentId: 1,
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-no-type",
    {
      id: "1",
      parentId: "root",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-an-unknown-type",
    {
      id: "1",
      parentId: "root",
      type: "text1",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "heading-has-3-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
        tag: "h1",
      },
    },
  ],
  [
    "heading-has-level-0",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 0,
      },
    },
  ],
  [
    "heading-has-level-4",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 4,
      },
    },
  ],
  [
    "heading-has-no-content",
    { id: "1", parentId: "root", type: "heading", data: { level: 1 } },
  ],
  [
    "heading-has-no-level",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  ["heading-has-no-data", { id: "1", parentId: "root", type: "heading" }],
  [
    "heading-has-children",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
      children: [],
    },
  ],
  [
    "text-has-2-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
    },
  ],
  [
    "text-has-a-plain-string-text-instead-of-content",
    { id: "1", parentId: "root", type: "text", data: { text: "text" } },
  ],
  [
    "text-has-a-non-array-content",
    { id: "1", parentId: "root", type: "text", data: { content: "text" } },
  ],
  [
    "text-has-a-run-with-a-non-string-text",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: 1, marks: [] }],
      },
    },
  ],
  [
    "text-has-a-run-without-marks",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text" }],
      },
    },
  ],
  [
    "text-has-a-run-with-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [], color: "red" }],
      },
    },
  ],
  [
    "text-has-an-unknown-mark",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [{ type: "highlight" }] }],
      },
    },
  ],
  [
    "text-has-a-link-without-an-address",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [{ type: "link" }] }],
      },
    },
  ],
  [
    "text-has-an-unsafe-link",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [
          { text: "text", marks: [{ type: "link", href: "javascript:alert(1)" }] },
        ],
      },
    },
  ],
  [
    "text-has-children",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [],
    },
  ],
  [
    "toggle-list-has-3-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, content: [], text: "text" },
      children: [],
    },
  ],
  [
    "toggle-list-has-a-non-boolean-open",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: "true", content: [] },
      children: [],
    },
  ],
  [
    "toggle-list-has-no-content",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true },
      children: [],
    },
  ],
  [
    "toggle-list-has-no-children",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, content: [] },
    },
  ],
  [
    "toggle-list-has-non-array-children",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, content: [] },
      children: {},
    },
  ],
  [
    "toggle-list-has-an-invalid-child",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, content: [] },
      children: [{ id: "2", parentId: "1", type: "text", data: {} }],
    },
  ],
  [
    "quote-has-2-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
    },
  ],
  [
    "quote-has-children",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [],
    },
  ],
  [
    "callout-has-a-run-with-a-non-string-text",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: {
        content: [{ text: 1, marks: [] }],
      },
    },
  ],
  [
    "callout-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      extra: true,
    },
  ],
  [
    "bullet-list-item-has-2-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
      children: [],
    },
  ],
  [
    "bullet-list-item-has-no-children",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "bullet-list-item-has-no-content",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {},
      children: [],
    },
  ],
  [
    "bullet-list-item-has-a-text-child",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "text",
          data: {
            content: [{ text: "text", marks: [] }],
          },
        },
      ],
    },
  ],
  [
    "bullet-list-item-has-a-text-grandchild",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "bullet-list-item",
          data: {
            content: [{ text: "text", marks: [] }],
          },
          children: [
            {
              id: "3",
              parentId: "2",
              type: "text",
              data: {
                content: [{ text: "text", marks: [] }],
              },
            },
          ],
        },
      ],
    },
  ],
  ["is-an-array", []],
  [
    "has-a-non-string-type",
    {
      id: "1",
      parentId: "root",
      type: 1,
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    "has-a-heading1-type",
    {
      id: "1",
      parentId: "root",
      type: "heading1",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
    },
  ],
  ["text-has-no-data", { id: "1", parentId: "root", type: "text" }],
  [
    "toggle-list-has-no-data",
    { id: "1", parentId: "root", type: "toggle-list", children: [] },
  ],
  ["quote-has-no-data", { id: "1", parentId: "root", type: "quote" }],
  [
    "quote-has-a-run-with-a-non-string-text",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: {
        content: [{ text: 1, marks: [] }],
      },
    },
  ],
  [
    "quote-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      extra: true,
    },
  ],
  [
    "callout-has-2-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
    },
  ],
  ["callout-has-no-data", { id: "1", parentId: "root", type: "callout" }],
  [
    "callout-has-children",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [],
    },
  ],
  [
    "bullet-list-item-has-no-data",
    { id: "1", parentId: "root", type: "bullet-list-item", children: [] },
  ],
  [
    "bullet-list-item-has-non-array-children",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: "children",
    },
  ],
  [
    "bullet-list-item-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [],
      extra: true,
    },
  ],
];

const validBlocks: [unknown][] = [
  [
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 1,
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 3,
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: false, content: [] },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "text",
          data: {
            content: [{ text: "text", marks: [] }],
          },
        },
      ],
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: {
        content: [{ text: "text", marks: [] }],
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [],
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "bullet-list-item",
      data: {
        content: [{ text: "text", marks: [] }],
      },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "bullet-list-item",
          data: {
            content: [{ text: "nested", marks: [{ type: "bold" }] }],
          },
          children: [],
        },
      ],
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: {
        content: [{ text: "text", marks: [] }],
        level: 2,
      },
    },
  ],
  [{ id: "1", parentId: "root", type: "text", data: { content: [] } }],
  [
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: {
        content: [
          { text: "Hello ", marks: [] },
          {
            text: "world",
            marks: [
              { type: "bold" },
              { type: "italic" },
              { type: "link", href: "https://example.com" },
            ],
          },
        ],
      },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: {
        open: true,
        content: [{ text: "Title", marks: [{ type: "underline" }] }],
      },
      children: [],
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, content: [] },
      children: [],
    },
  ],
];

describe("validateDocumentStructure()", () => {
  test.each([[null], [1], ["document"], [[]]])(
    "throws an error if the document is not an object - %s",
    document => {
      // Assert
      expect(() => validateDocumentStructure(document)).toThrow(
        InvalidDocumentError,
      );
    },
  );

  test.each([["not_an_array"], [1], [null], [{ id: "root", children: [] }]])(
    "throws an error if the children are not an array - %s",
    children => {
      // Assert
      expect(() => validateDocumentStructure({ id: "root", children })).toThrow(
        InvalidDocumentError,
      );
    },
  );

  test.each(invalidBlocks)(
    "throws an error that points to the block if the block is invalid - %s",
    (_, block) => {
      // Arrange
      const tryValidate = () => validateDocumentStructure(createDocumentWith(block));

      // Assert
      expect(tryValidate).toThrow(InvalidDocumentError);

      try {
        tryValidate();
      } catch (error) {
        const { issues } = (error as InvalidDocumentError).context;

        expect(issues.every(issue => issue.path.startsWith("children.0"))).toBe(
          true,
        );
      }
    },
  );

  test.each(validBlocks)(
    "does not throw an error if the block is valid - %o",
    block => {
      // Assert
      expect(validateDocumentStructure(createDocumentWith(block))).toBeUndefined();
    },
  );

  it("reports every issue with the path to it", () => {
    // Arrange
    const document = {
      id: "root",
      children: [
        {
          id: "1",
          parentId: "root",
          type: "toggle-list",
          data: { open: true, content: [] },
          children: [
            {
              id: "2",
              parentId: "1",
              type: "heading",
              data: {
                content: [{ text: "text", marks: [] }],
                level: 9,
              },
            },
          ],
        },
        {
          id: 3,
          parentId: "root",
          type: "text",
          data: {
            content: [{ text: "text", marks: [] }],
          },
        },
      ],
    };

    // Assert
    assertEngineError(() => validateDocumentStructure(document), {
      ExpectedErrorClass: InvalidDocumentError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT",
      expectedMessage:
        "Invalid document. children.0.children.0.data.level: Invalid type: Expected (1 | 2 | 3) but received 9; children.1.id: Invalid type: Expected string but received 3",
      expectedContext: {
        issues: [
          {
            path: "children.0.children.0.data.level",
            message: "Invalid type: Expected (1 | 2 | 3) but received 9",
          },
          {
            path: "children.1.id",
            message: "Invalid type: Expected string but received 3",
          },
        ],
      },
    });
  });
});

describe("validateBlockStructure()", () => {
  test.each(invalidBlocks)(
    "throws an error if the block is invalid - %s",
    (_, block) => {
      // Assert
      expect(() => validateBlockStructure(block, new DocumentRoot())).toThrow(
        InvalidBlockError,
      );
    },
  );

  test.each(validBlocks)(
    "does not throw an error if the block is valid - %o",
    block => {
      // Assert
      expect(validateBlockStructure(block, new DocumentRoot())).toBeUndefined();
    },
  );

  it("reports every issue with the path to it", () => {
    // Arrange
    const block = {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: "true", content: [] },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "heading",
          data: {
            content: [{ text: "text", marks: [] }],
            level: 9,
          },
        },
      ],
    };

    // Assert
    assertEngineError(() => validateBlockStructure(block, new DocumentRoot()), {
      ExpectedErrorClass: InvalidBlockError,
      expectedCode: "DOCUMENT:INVALID_BLOCK",
      expectedMessage:
        'Invalid block. data.open: Invalid type: Expected boolean but received "true"; children.0.data.level: Invalid type: Expected (1 | 2 | 3) but received 9',
      expectedContext: {
        issues: [
          {
            path: "data.open",
            message: 'Invalid type: Expected boolean but received "true"',
          },
          {
            path: "children.0.data.level",
            message: "Invalid type: Expected (1 | 2 | 3) but received 9",
          },
        ],
      },
    });
  });
});

describe("validateBlockParentLink()", () => {
  it("throws an error if the block is not a direct child of the parent", () => {
    // Arrange
    const parent: DocumentNode = {
      id: "parent-1",
      children: [
        {
          id: "block-1",
          type: "text",
          data: {
            content: [{ text: "some_text", marks: [] }],
          },
          parentId: "parent-1",
        },
      ],
    };

    const tryValidateBlockParentLink = () =>
      validateBlockParentLink(parent, "block-2");

    // Assert
    assertEngineError(tryValidateBlockParentLink, {
      ExpectedErrorClass: ParentBlockNotFoundError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_NOT_FOUND",
      expectedMessage: 'Parent with ID "parent-1" not found for block "block-2".',
      expectedContext: { parentId: "parent-1", blockId: "block-2" },
    });
  });

  it("does not throw an error and does not return anything if the validation passes", () => {
    // Arrange
    const parent: DocumentNode = {
      id: "parent-1",
      children: [
        {
          id: "block-1",
          type: "text",
          data: {
            content: [{ text: "some_text", marks: [] }],
          },
          parentId: "parent-1",
        },
      ],
    };

    // Act
    const result = validateBlockParentLink(parent, "block-1");

    // Assert
    expect(result).toBeUndefined();
  });
});

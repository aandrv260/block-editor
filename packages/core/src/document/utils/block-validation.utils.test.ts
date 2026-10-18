import type { DocumentNode } from "../../blocks/models/block.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { InvalidBlockError, ParentBlockNotFoundError } from "../errors/common";
import { InvalidDocumentError } from "../errors/factories";
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
  ["has-no-id", { parentId: "root", type: "text", data: { text: "text" } }],
  [
    "has-a-non-string-id",
    { id: 1, parentId: "root", type: "text", data: { text: "text" } },
  ],
  ["has-no-parent-id", { id: "1", type: "text", data: { text: "text" } }],
  [
    "has-a-non-string-parent-id",
    { id: "1", parentId: 1, type: "text", data: { text: "text" } },
  ],
  ["has-no-type", { id: "1", parentId: "root", data: { text: "text" } }],
  [
    "has-an-unknown-type",
    { id: "1", parentId: "root", type: "text1", data: { text: "text" } },
  ],
  [
    "heading-has-3-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 1, tag: "h1" },
    },
  ],
  [
    "heading-has-level-0",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 0 },
    },
  ],
  [
    "heading-has-level-4",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 4 },
    },
  ],
  [
    "heading-has-no-text",
    { id: "1", parentId: "root", type: "heading", data: { level: 1 } },
  ],
  [
    "heading-has-no-level",
    { id: "1", parentId: "root", type: "heading", data: { text: "text" } },
  ],
  ["heading-has-no-data", { id: "1", parentId: "root", type: "heading" }],
  [
    "heading-has-children",
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 1 },
      children: [],
    },
  ],
  [
    "text-has-2-fields-in-data",
    { id: "1", parentId: "root", type: "text", data: { text: "text", level: 1 } },
  ],
  [
    "text-has-an-invalid-data-field",
    { id: "1", parentId: "root", type: "text", data: { text1: "text" } },
  ],
  [
    "text-has-a-non-string-text",
    { id: "1", parentId: "root", type: "text", data: { text: 1 } },
  ],
  [
    "text-has-children",
    {
      id: "1",
      parentId: "root",
      type: "text",
      data: { text: "text" },
      children: [],
    },
  ],
  [
    "toggle-list-has-2-fields-in-data",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true, text: "text" },
      children: [],
    },
  ],
  [
    "toggle-list-has-a-non-boolean-open",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: "true" },
      children: [],
    },
  ],
  [
    "toggle-list-has-no-children",
    { id: "1", parentId: "root", type: "toggle-list", data: { open: true } },
  ],
  [
    "toggle-list-has-non-array-children",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true },
      children: {},
    },
  ],
  [
    "toggle-list-has-an-invalid-child",
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true },
      children: [{ id: "2", parentId: "1", type: "text", data: {} }],
    },
  ],
  [
    "quote-has-2-fields-in-data",
    { id: "1", parentId: "root", type: "quote", data: { text: "text", level: 1 } },
  ],
  [
    "quote-has-children",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: { text: "text" },
      children: [],
    },
  ],
  [
    "callout-has-a-non-string-text",
    { id: "1", parentId: "root", type: "callout", data: { text: 1 } },
  ],
  [
    "callout-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: { text: "text" },
      extra: true,
    },
  ],
  [
    "bullet-list-has-a-field-in-data",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list",
      data: { text: "text" },
      children: [],
    },
  ],
  [
    "bullet-list-has-no-children",
    { id: "1", parentId: "root", type: "bullet-list", data: {} },
  ],
  ["is-an-array", []],
  [
    "has-a-non-string-type",
    { id: "1", parentId: "root", type: 1, data: { text: "text" } },
  ],
  [
    "has-a-heading1-type",
    {
      id: "1",
      parentId: "root",
      type: "heading1",
      data: { text: "text", level: 1 },
    },
  ],
  ["text-has-no-data", { id: "1", parentId: "root", type: "text" }],
  [
    "toggle-list-has-no-data",
    { id: "1", parentId: "root", type: "toggle-list", children: [] },
  ],
  ["quote-has-no-data", { id: "1", parentId: "root", type: "quote" }],
  [
    "quote-has-a-non-string-text",
    { id: "1", parentId: "root", type: "quote", data: { text: 1 } },
  ],
  [
    "quote-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "quote",
      data: { text: "text" },
      extra: true,
    },
  ],
  [
    "callout-has-2-fields-in-data",
    { id: "1", parentId: "root", type: "callout", data: { text: "text", level: 1 } },
  ],
  ["callout-has-no-data", { id: "1", parentId: "root", type: "callout" }],
  [
    "callout-has-children",
    {
      id: "1",
      parentId: "root",
      type: "callout",
      data: { text: "text" },
      children: [],
    },
  ],
  [
    "bullet-list-has-no-data",
    { id: "1", parentId: "root", type: "bullet-list", children: [] },
  ],
  [
    "bullet-list-has-non-array-children",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list",
      data: {},
      children: "children",
    },
  ],
  [
    "bullet-list-has-an-extra-field",
    {
      id: "1",
      parentId: "root",
      type: "bullet-list",
      data: {},
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
      data: { text: "text", level: 1 },
    },
  ],
  [
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 3 },
    },
  ],
  [{ id: "1", parentId: "root", type: "text", data: { text: "text" } }],
  [
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: false },
      children: [{ id: "2", parentId: "1", type: "text", data: { text: "text" } }],
    },
  ],
  [{ id: "1", parentId: "root", type: "quote", data: { text: "text" } }],
  [{ id: "1", parentId: "root", type: "callout", data: { text: "text" } }],
  [{ id: "1", parentId: "root", type: "bullet-list", data: {}, children: [] }],
  [
    {
      id: "1",
      parentId: "root",
      type: "heading",
      data: { text: "text", level: 2 },
    },
  ],
  [{ id: "1", parentId: "root", type: "text", data: { text: "" } }],
  [
    {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: true },
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
          data: { open: true },
          children: [
            {
              id: "2",
              parentId: "1",
              type: "heading",
              data: { text: "text", level: 9 },
            },
          ],
        },
        { id: 3, parentId: "root", type: "text", data: { text: "text" } },
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
      expect(() => validateBlockStructure(block)).toThrow(InvalidBlockError);
    },
  );

  test.each(validBlocks)(
    "does not throw an error if the block is valid - %o",
    block => {
      // Assert
      expect(validateBlockStructure(block)).toBeUndefined();
    },
  );

  it("reports every issue with the path to it", () => {
    // Arrange
    const block = {
      id: "1",
      parentId: "root",
      type: "toggle-list",
      data: { open: "true" },
      children: [
        {
          id: "2",
          parentId: "1",
          type: "heading",
          data: { text: "text", level: 9 },
        },
      ],
    };

    // Assert
    assertEngineError(() => validateBlockStructure(block), {
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
          data: { text: "some_text" },
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
          data: { text: "some_text" },
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

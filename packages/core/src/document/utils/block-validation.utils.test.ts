import type { DocumentNode } from "../../blocks/models/block.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { ParentBlockNotFoundError } from "../errors/common";
import { InvalidDocumentError } from "../errors/factories";
import {
  validateBlockParentLink,
  validateDocumentStructure,
} from "./block-validation.utils";

const createDocumentWith = (block: unknown) => ({ id: "root", children: [block] });

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

  test.each([
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
  ])(
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

  test.each([
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
  ])("does not throw an error if the block is valid - %o", block => {
    // Assert
    expect(validateDocumentStructure(createDocumentWith(block))).toBeUndefined();
  });

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

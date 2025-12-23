import { ALL_BLOCK_TYPES } from "../../blocks/models/block-type.models";
import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockIsNotAnObjectError, ParentBlockNotFoundError } from "../errors/common";
import {
  InvalidBlockIDError,
  InvalidBlockParentIDError,
  InvalidBlockTypeError,
  InvalidBlockVariantError,
  InvalidDocumentRootIDError,
  InvalidDocumentStructureError,
} from "../errors/factories";
import {
  isBlockTypeValid,
  validateBlockHasId,
  validateBlockParentId,
  validateBlockParentLink,
  validateBlockStructure,
  validateBlockType,
  validateBlockVariant,
  validateDocumentRootStructure,
} from "./block-validation.utils";

describe("isBlockTypeValid()", () => {
  test.each([["bullet-point1"], ["bullet-point2"], ["some_code"], ["invalid-type"]])(
    "returns false if the block type passed is invalid - %s",
    blockType => {
      // Assert
      expect(isBlockTypeValid(blockType)).toBe(false);
    },
  );

  test.each([["text"], ["heading"], ["toggle-list"]])(
    "returns true if the block type passed is valid - %s",
    blockType => {
      // Assert
      expect(isBlockTypeValid(blockType)).toBe(true);
    },
  );
});

describe("validateDocumentRootStructure()", () => {
  test.each([[1], [null], [undefined], ["some_object"], [true], [false]])(
    "throws an error if the document object param passed is not an object",
    () => {
      const tryValidateDocumentRootStructure = () =>
        validateDocumentRootStructure(1);

      // Assert
      assertEngineError(tryValidateDocumentRootStructure, {
        ExpectedErrorClass: InvalidDocumentStructureError,
        expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
        expectedMessage:
          "Invalid document structure — root block missing or incorrect.",
      });
    },
  );

  it("throws an error if the document object does not have an id property", () => {
    // Arrange
    const documentObject = {
      children: [
        {
          id: "block-1",
          type: "text",
        },
      ],
    };

    const tryValidateDocumentRootStructure = () =>
      validateDocumentRootStructure(documentObject);

    // Assert
    assertEngineError(tryValidateDocumentRootStructure, {
      ExpectedErrorClass: InvalidDocumentStructureError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
      expectedMessage:
        "Invalid document structure — root block missing or incorrect.",
    });
  });

  it("throws an error if the document object does not have a children property", () => {
    // Arrange
    const documentObject = {
      id: "root",
    };

    const tryValidateDocumentRootStructure = () =>
      validateDocumentRootStructure(documentObject);

    // Assert
    assertEngineError(tryValidateDocumentRootStructure, {
      ExpectedErrorClass: InvalidDocumentStructureError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
      expectedMessage:
        "Invalid document structure — root block missing or incorrect.",
    });
  });

  test.each([["not_an_array"], [1], [null], [{ id: "root", children: [] }]])(
    "throws an error if the document object's children property is not an array",
    children => {
      // Arrange
      const documentObject = {
        id: "root",
        children,
      };

      const tryValidateDocumentRootStructure = () =>
        validateDocumentRootStructure(documentObject);

      // Assert
      assertEngineError(tryValidateDocumentRootStructure, {
        ExpectedErrorClass: InvalidDocumentStructureError,
        expectedCode: "DOCUMENT:INVALID_DOCUMENT_STRUCTURE",
        expectedMessage:
          "Invalid document structure — root block missing or incorrect.",
      });
    },
  );

  test.each([[1], [null], [undefined]])(
    "throws an error if the document object's id property is not a string",
    id => {
      // Arrange
      const documentObject = {
        id,
        children: [],
      };

      const tryValidateDocumentRootStructure = () =>
        validateDocumentRootStructure(documentObject);

      // Assert
      assertEngineError(tryValidateDocumentRootStructure, {
        ExpectedErrorClass: InvalidDocumentRootIDError,
        expectedCode: "DOCUMENT:INVALID_DOCUMENT_ROOT_ID",
        expectedMessage: `Invalid root ID detected: ${id}`,
        expectedContext: { rootId: id },
      });
    },
  );

  it("throws an error if the document object's id property is not equal to the default ROOT ID", () => {
    // Arrange
    const documentObject = {
      id: "not_root",
      children: [],
    };

    const tryValidateDocumentRootStructure = () =>
      validateDocumentRootStructure(documentObject);

    // Assert
    assertEngineError(tryValidateDocumentRootStructure, {
      ExpectedErrorClass: InvalidDocumentRootIDError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_ROOT_ID",
      expectedMessage: "Invalid root ID detected: not_root",
      expectedContext: { rootId: "not_root" },
    });
  });

  it("does not throw an error and does not return anything if the validation passes", () => {
    // Arrange
    const documentObject = {
      id: "root",
      children: [],
    };

    // Act
    const result = validateDocumentRootStructure(documentObject);

    // Assert
    expect(result).toBeUndefined();
  });
});

describe("validateBlockHasId()", () => {
  test.each([[1], ["some_obj"], [null], [undefined], [false]])(
    "throws an error if the block passed is not an object",
    block => {
      // Arrange
      const tryValidateBlockHasId = () => validateBlockHasId(block);

      // Assert
      assertEngineError(tryValidateBlockHasId, {
        ExpectedErrorClass: BlockIsNotAnObjectError,
        expectedCode: "DOCUMENT:BLOCK_IS_NOT_AN_OBJECT",
        expectedMessage: "Block is not an object!",
        expectedContext: { block },
      });
    },
  );

  it("shows in the error message if the block's parent ID is unknown", () => {
    // Arrange
    const block = {
      type: "text",
      data: { text: "some_text" },
    };

    const tryValidateBlockHasId = () => validateBlockHasId(block);

    // Assert
    assertEngineError(tryValidateBlockHasId, {
      ExpectedErrorClass: InvalidBlockIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_ID",
      expectedMessage:
        "Missing or invalid block ID for block with parent ID: [UNKNOWN_PARENT_ID]. ID must always be a string!",
      expectedContext: { parentId: "[UNKNOWN_PARENT_ID]", blockId: undefined },
    });
  });

  it("throws an error if the block does not have an id property", () => {
    // Arrange
    const block = {
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    const tryValidateBlockHasId = () => validateBlockHasId(block);

    // Assert
    assertEngineError(tryValidateBlockHasId, {
      ExpectedErrorClass: InvalidBlockIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_ID",
      expectedMessage:
        "Missing or invalid block ID for block with parent ID: root. ID must always be a string!",
      expectedContext: { parentId: "root", blockId: undefined },
    });
  });

  test.each([[1], [null], [undefined], [true]])(
    "throws an error if the block's id property is not a string",
    blockId => {
      // Arrange
      const block = {
        id: blockId,
        type: "text",
        data: { text: "some_text" },
        parentId: "root1",
      };

      const tryValidateBlockHasId = () => validateBlockHasId(block);

      // Assert
      assertEngineError(tryValidateBlockHasId, {
        ExpectedErrorClass: InvalidBlockIDError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_ID",
        expectedMessage: `Missing or invalid block ID for block with parent ID: root1. ID must always be a string!`,
        expectedContext: { parentId: "root1", blockId },
      });
    },
  );

  it("does not throw an error and does not return anything if the validation passes", () => {
    // Arrange
    const block = {
      id: "block-1",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    // Act
    const result = validateBlockHasId(block);

    // Assert
    expect(result).toBeUndefined();
  });
});

describe("validateBlockParentId()", () => {
  test.each([[1], ["some_obj"], [null], [undefined], [true], [false]])(
    "throws an error if the block passed is not an object",
    block => {
      const tryValidateBlockParentId = () => validateBlockParentId(block);

      // Assert
      assertEngineError(tryValidateBlockParentId, {
        ExpectedErrorClass: BlockIsNotAnObjectError,
        expectedCode: "DOCUMENT:BLOCK_IS_NOT_AN_OBJECT",
        expectedMessage: "Block is not an object!",
        expectedContext: { block },
      });
    },
  );

  it("shows in the error message if the block ID is unknown", () => {
    // Arrange
    const block = {
      type: "text",
      parentId: 1,
      data: { text: "some_text" },
    };

    const tryValidateBlockParentId = () => validateBlockParentId(block);

    // Assert
    assertEngineError(tryValidateBlockParentId, {
      ExpectedErrorClass: InvalidBlockParentIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_PARENT_ID",
      expectedMessage:
        "Missing or invalid parentId for block ID: [UNKNOWN_BLOCK_ID]. Parent ID must always be a string!",
      expectedContext: { parentId: 1, blockId: "[UNKNOWN_BLOCK_ID]" },
    });
  });

  it("throws an error if the block does not have a parentId property", () => {
    // Arrange
    const block = {
      id: "block-1",
      type: "text",
      data: { text: "some_text" },
    };

    const tryValidateBlockParentId = () => validateBlockParentId(block);

    // Assert
    assertEngineError(tryValidateBlockParentId, {
      ExpectedErrorClass: InvalidBlockParentIDError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_PARENT_ID",
      expectedMessage:
        "Missing or invalid parentId for block ID: block-1. Parent ID must always be a string!",
      expectedContext: { parentId: undefined, blockId: "block-1" },
    });
  });

  test.each([[1], [null], [undefined], [true]])(
    "throws an error if the block's parentId property is not a string",
    parentId => {
      // Arrange
      const block = {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId,
      };

      const tryValidateBlockParentId = () => validateBlockParentId(block);

      // Assert
      assertEngineError(tryValidateBlockParentId, {
        ExpectedErrorClass: InvalidBlockParentIDError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_PARENT_ID",
        expectedMessage: `Missing or invalid parentId for block ID: block-1. Parent ID must always be a string!`,
        expectedContext: { parentId, blockId: "block-1" },
      });
    },
  );

  it("does not throw an error and does not return anything if the validation passes", () => {
    // Arrange
    const block = {
      id: "block-1",
      type: "text",
      data: { text: "some_text" },
      parentId: "root",
    };

    // Act
    const result = validateBlockParentId(block);

    // Assert
    expect(result).toBeUndefined();
  });
});

describe("validateBlockType()", () => {
  test.each([[1], ["some_obj"], [null], [undefined], [true]])(
    "throws an error if the block passed is not an object",
    block => {
      // Arrange
      const tryValidateBlockType = () => validateBlockType(block);

      // Assert
      assertEngineError(tryValidateBlockType, {
        ExpectedErrorClass: BlockIsNotAnObjectError,
        expectedCode: "DOCUMENT:BLOCK_IS_NOT_AN_OBJECT",
        expectedMessage: "Block is not an object!",
        expectedContext: { block },
      });
    },
  );

  it("shows in the error message if the block's ID is unknown and if the type is not a string", () => {
    // Arrange
    const block = {
      data: { text: "some_text" },
      parentId: "root",
    };

    // Assert
    const tryValidateBlockType = () => validateBlockType(block);

    assertEngineError(tryValidateBlockType, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage: `Invalid block type undefined for block ID: [UNKNOWN_BLOCK_ID]`,
      expectedContext: { blockId: "[UNKNOWN_BLOCK_ID]", blockType: undefined },
    });
  });

  it("shows in the error message if the block's ID is unknown and if the type is not a valid string", () => {
    // Arrange
    const block = {
      type: "some_invalid_type",
    };

    const tryValidateBlockType = () => validateBlockType(block);

    // Assert
    assertEngineError(tryValidateBlockType, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage:
        "Invalid block type some_invalid_type for block ID: [UNKNOWN_BLOCK_ID]",
      expectedContext: {
        blockId: "[UNKNOWN_BLOCK_ID]",
        blockType: "some_invalid_type",
      },
    });
  });

  it("throws an error if the block does not have a type property", () => {
    // Arrange
    const block = {
      id: "block-1",
      data: { text: "some_text" },
      parentId: "root",
    };

    const tryValidateBlockType = () => validateBlockType(block);

    // Assert
    assertEngineError(tryValidateBlockType, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage: `Invalid block type undefined for block ID: block-1`,
      expectedContext: { blockId: "block-1", blockType: undefined },
    });
  });

  test.each([[1], [null], [undefined], [true]])(
    "throws an error if the block's type property is not a string",
    type => {
      // Arrange
      const block = {
        id: "block-1",
        type,
      };

      const tryValidateBlockType = () => validateBlockType(block);

      // Assert
      assertEngineError(tryValidateBlockType, {
        ExpectedErrorClass: InvalidBlockTypeError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
        expectedMessage: `Invalid block type ${type} for block ID: block-1`,
        expectedContext: { blockId: "block-1", blockType: type },
      });
    },
  );

  test.each([["some_invalid_type"], ["text1"], ["some_code"]])(
    "throws an error if the block's type property is not a valid block type",
    type => {
      // Arrange
      const block = {
        id: "block-1",
        type,
      };

      const tryValidateBlockType = () => validateBlockType(block);

      // Assert
      assertEngineError(tryValidateBlockType, {
        ExpectedErrorClass: InvalidBlockTypeError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
        expectedMessage: `Invalid block type ${type} for block ID: block-1`,
        expectedContext: { blockId: "block-1", blockType: type },
      });
    },
  );

  test.each(ALL_BLOCK_TYPES.map(type => [type]))(
    "does not throw an error and does not return anything if the validation passes",
    type => {
      // Arrange
      const block = {
        id: "block-1",
        type,
        data: { text: "some_text" },
        parentId: "root",
      };

      // Act
      const result = validateBlockType(block);

      // Assert
      expect(result).toBeUndefined();
    },
  );
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

describe("validateBlockVariant()", () => {
  test.each([
    ["heading1", { id: "1", type: "heading1", data: { text: "text", level: 1 } }],
    ["heading2", { id: "1", type: "heading2", data: { text: "text", level: 1 } }],
    ["text3", { id: "1", type: "text3", data: { text: "text", level: 1 } }],
  ])(`throws an error if the block has a wrong "%s" type`, (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    // Assert
    const tryValidateBlockVariant = () => validateBlockVariant(typedBlock);

    assertEngineError(tryValidateBlockVariant, {
      ExpectedErrorClass: InvalidBlockTypeError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_TYPE",
      expectedMessage: `Invalid block type ${typedBlock.type} for block ID: ${typedBlock.id}`,
      expectedContext: { blockId: typedBlock.id, blockType: typedBlock.type },
    });
  });

  test.each([
    [
      "has-3-fields-in-data",
      {
        id: "1",
        type: "heading",
        parentId: "root",
        data: { text: "text", level: 1, tag: "h1" },
      },
    ],

    [
      "has-invalid-level",
      {
        id: "1",
        type: "heading",
        parentId: "root",
        data: { text: "text", level: 4 },
      },
    ],

    [
      "has-no-text-field",
      { id: "1", type: "heading", parentId: "root", data: { level: 1 } },
    ],

    [
      "has-no-level-field",
      { id: "1", type: "heading", parentId: "root", data: { text: "text" } },
    ],

    ["has-no-data-field", { id: "1", type: "heading", parentId: "root" }],

    [
      "has-children",
      {
        id: "1",
        type: "heading",
        parentId: "root",
        data: { text: "text", level: 1 },
        children: [],
      },
    ],
  ])("throws an error if a heading block is invalid - %s", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    const tryValidateBlockVariant = () => validateBlockVariant(typedBlock);

    // Assert
    assertEngineError(tryValidateBlockVariant, {
      ExpectedErrorClass: InvalidBlockVariantError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_VARIANT",
      expectedMessage: `Block type ${typedBlock.type} with ID ${typedBlock.id} has invalid properties.`,
      expectedContext: { blockId: typedBlock.id, blockType: typedBlock.type },
    });
  });

  test.each([
    [
      "has-2-fields-in-data",
      { id: "1", type: "text", parentId: "root", data: { text: "text", level: 1 } },
    ],

    ["has-no-data-field", { id: "1", type: "text", parentId: "root" }],

    [
      "has-invalid-data-field",
      { id: "1", type: "text", parentId: "root", data: { text1: "text" } },
    ],

    [
      "has-children",
      {
        id: "1",
        type: "text",
        parentId: "root",
        data: { text: "text" },
        children: [],
      },
    ],
  ])("throws an error if a text block is invalid - %s", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    const tryValidateBlockVariant = () => validateBlockVariant(typedBlock);

    // Assert
    assertEngineError(tryValidateBlockVariant, {
      ExpectedErrorClass: InvalidBlockVariantError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_VARIANT",
      expectedMessage: `Block type ${typedBlock.type} with ID ${typedBlock.id} has invalid properties.`,
      expectedContext: { blockId: typedBlock.id, blockType: typedBlock.type },
    });
  });

  test.each([
    [
      "has-2-fields-in-data",
      {
        id: "1",
        type: "toggle-list",
        parentId: "root",
        data: { open: true, some_text: "text" },
        children: [],
      },
    ],

    [
      "has-invalid-open-field",
      {
        id: "1",
        type: "toggle-list",
        parentId: "root",
        data: { open: "true" },
        children: [],
      },
    ],

    [
      "has-no-data-field",
      {
        id: "1",
        type: "toggle-list",
        parentId: "root",
        children: [],
      },
    ],

    [
      "has-no-children",
      { id: "1", type: "toggle-list", parentId: "root", data: { open: true } },
    ],

    [
      "invalid-children",
      {
        id: "1",
        type: "toggle-list",
        parentId: "root",
        data: { open: true },
        children: `[{ id: "2", type: "text", parentId: "1", data: { text: "text" } }]`,
      },
    ],
  ])("throws an error if a toggle-list block is invalid - %s", (_, block) => {
    // Arrange
    const typedBlock = block as Block;

    const tryValidateBlockVariant = () => validateBlockVariant(typedBlock);

    // Assert
    assertEngineError(tryValidateBlockVariant, {
      ExpectedErrorClass: InvalidBlockVariantError,
      expectedCode: "DOCUMENT:INVALID_BLOCK_VARIANT",
      expectedMessage: `Block type ${typedBlock.type} with ID ${typedBlock.id} has invalid properties.`,
      expectedContext: { blockId: typedBlock.id, blockType: typedBlock.type },
    });
  });

  test.each([
    [
      {
        id: "1",
        type: "heading",
        parentId: "root",
        data: { text: "text", level: 1 },
      },
    ],

    [
      {
        id: "2",
        type: "heading",
        parentId: "node1",
        data: { text: "text232", level: 2 },
      },
    ],

    [
      {
        id: "3",
        type: "heading",
        parentId: "node1",
        data: { text: "text232", level: 2 },
      },
    ],
  ] satisfies [Block][])(
    "does not throw an error and does not return anything if the heading validation passes",
    block => {
      // Arrange
      const typedBlock = block as Block;

      // Assert
      expect(validateBlockVariant(typedBlock)).toBeUndefined();
    },
  );

  test.each([
    [
      {
        id: "1",
        type: "text",
        parentId: "root",
        data: { text: "text1" },
      },
    ],
    [
      {
        id: "2",
        type: "text",
        parentId: "node1",
        data: { text: "text2" },
      },
    ],
  ])(
    "does not throw an error and does not return anything if the text validation passes",
    block => {
      // Arrange
      const typedBlock = block as Block;

      // Assert
      expect(validateBlockVariant(typedBlock)).toBeUndefined();
    },
  );

  test.each([
    [
      {
        id: "1",
        type: "toggle-list",
        parentId: "root",
        data: { open: true },
        children: [],
      },
    ],
    [
      {
        id: "2",
        type: "toggle-list",
        parentId: "node1",
        data: { open: false },
        children: [],
      },
    ],
  ] satisfies [Block][])(
    "does not throw an error and does not return anything if the toggle-list validation passes",
    block => {
      // Arrange
      const typedBlock = block as Block;

      // Assert
      expect(validateBlockVariant(typedBlock)).toBeUndefined();
    },
  );
});

describe("validateBlockStructure()", () => {
  test.each([[1], [null], [undefined], [true], ["some_string"]])(
    "throws an error if the passed paramter block is not an object",
    block => {
      // Arrange
      const tryValidateBlockStructure = () => validateBlockStructure(block);

      // Assert
      assertEngineError(tryValidateBlockStructure, {
        ExpectedErrorClass: BlockIsNotAnObjectError,
        expectedCode: "DOCUMENT:BLOCK_IS_NOT_AN_OBJECT",
        expectedMessage: `Block is not an object!`,
        expectedContext: { block },
      });
    },
  );

  test.each([[1], [null], [undefined], [true], [{}]])(
    "throws an error if the block's ID is invalid",
    blockId => {
      // Arrange
      const block = {
        id: blockId,
        type: "text",
        data: { text: "some_text" },
        parentId: "root",
      };

      const tryValidateBlockStructure = () => validateBlockStructure(block);

      // Assert
      assertEngineError(tryValidateBlockStructure, {
        ExpectedErrorClass: InvalidBlockIDError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_ID",
        expectedMessage: `Missing or invalid block ID for block with parent ID: root. ID must always be a string!`,
        expectedContext: { parentId: "root", blockId },
      });
    },
  );

  test.each([[1], [null], [undefined], [true], [{}]])(
    "throws an error if the block's parent ID is invalid",
    parentId => {
      // Arrange
      const block = {
        id: "block-1",
        type: "text",
        data: { text: "some_text" },
        parentId,
      };

      const tryValidateBlockStructure = () => validateBlockStructure(block);

      // Assert
      assertEngineError(tryValidateBlockStructure, {
        ExpectedErrorClass: InvalidBlockParentIDError,
        expectedCode: "DOCUMENT:INVALID_BLOCK_PARENT_ID",
        expectedMessage: `Missing or invalid parentId for block ID: block-1. Parent ID must always be a string!`,
        expectedContext: { parentId, blockId: "block-1" },
      });
    },
  );

  test.each([
    [{ id: "block-1", type: "text", data: { text: "some_text" }, parentId: "root" }],

    [
      {
        id: "block-2",
        type: "heading",
        data: { text: "some_text", level: 1 },
        parentId: "block-1",
      },
    ],

    [
      {
        id: "block-3",
        type: "toggle-list",
        data: { open: true },
        parentId: "block-1",
        children: [],
      },
    ],
  ])(
    "does not throw an error and does not return anything if the block validation passes",
    block => {
      // Assert
      expect(validateBlockStructure(block)).toBeUndefined();
    },
  );
});

import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { ParentBlockNotFoundError } from "../errors/common";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("EditorDocument.fromRoot()", () => {
  it("throws an error if the DocumentRoot subtree has invalid parent relationships", () => {
    // Arrange
    const documentRoot = new DocumentRoot("root", [
      {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [{ ...TOGGLE_LIST2_BLOCK, parentId: "root" }],
      },
    ]);

    // Act & Assert
    const tryFromRoot = () => EditorDocument.fromRoot(documentRoot);

    assertEngineError(tryFromRoot, {
      ExpectedErrorClass: ParentBlockNotFoundError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_NOT_FOUND",
      expectedMessage: 'Parent with ID "root" not found for block "toggle-list-2".',
      expectedContext: { parentId: "root", blockId: "toggle-list-2" },
    });
  });

  it("constructs a new EditorDocument instance from a DocumentRoot instance", () => {
    // Arrange
    const documentRoot = new DocumentRoot("root", [
      {
        ...TOGGLE_LIST1_BLOCK,
        parentId: "root",
        children: [{ ...TOGGLE_LIST2_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id }],
      },
      { ...SAMPLE_BLOCK1, parentId: "root" },
    ]);

    // Act
    const document = EditorDocument.fromRoot(documentRoot);

    // Assert
    expect(document.getRoot()).toStrictEqual(documentRoot);

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toEqual(
      documentRoot.children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toEqual(
      documentRoot.children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toEqual(documentRoot.children.at(1));

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);
  });
});

import {
  assertTreeIntegrity,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("EditorDocument.fromDocument()", () => {
  it("returns a new EditorDocument instance that is a deep clone of the passed document", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild("root", TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4);

    // Act
    const newDocument = EditorDocument.fromDocument(document);

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
    expect(newDocument.size).toBe(document.size);

    assertTreeIntegrity(newDocument);
    assertTreeIntegrity(document);
  });
});

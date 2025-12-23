import {
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("toJSON()", () => {
  it("serializes a document correctly", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, TOGGLE_LIST4_BLOCK);

    // Act
    const deserializedDocument = EditorDocument.fromJSON(document.toJSON());

    // Assert
    expect(deserializedDocument).toStrictEqual(document);
    expect(deserializedDocument.toJSON()).toBe(document.toJSON());

    assertTreeIntegrity(deserializedDocument);
    assertTreeIntegrity(document);
  });
});

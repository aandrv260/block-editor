import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("isOnlyBlockInDocument()", () => {
  it("returns true when the block is the only block in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Act
    const result = document.isOnlyBlockInDocument(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBe(true);
    assertTreeIntegrity(document);
  });

  it("returns false when there are multiple blocks in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Act
    const result = document.isOnlyBlockInDocument(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBe(false);
    assertTreeIntegrity(document);
  });

  it("returns false when the block does not exist in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Act
    const result = document.isOnlyBlockInDocument("non-existent-block-id");

    // Assert
    expect(result).toBe(false);
    assertTreeIntegrity(document);
  });

  it("returns false when the document is empty", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    const result = document.isOnlyBlockInDocument(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBe(false);
    assertTreeIntegrity(document);
  });

  it("returns false when the block exists but is not the first child of the root", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Act
    const result = document.isOnlyBlockInDocument(SAMPLE_BLOCK2.id);

    // Assert
    expect(result).toBe(false);
    assertTreeIntegrity(document);
  });

  it("returns false when the user passes the root block ID", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    const result = document.isOnlyBlockInDocument(document.ROOT_ID);

    // Assert
    expect(document.size).toBe(1);
    expect(document.getRoot().children).toHaveLength(0);
    expect(result).toBe(false);
    assertTreeIntegrity(document);
  });
});

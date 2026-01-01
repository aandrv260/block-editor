import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("getPreviousSiblingBlock()", () => {
  it("returns the previous sibling block when it exists", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK2.id);

    // Assert
    expect(result).toBe(document.getBlock(SAMPLE_BLOCK1.id));
    expect(result).toBe(document.getRoot().children[0]);
    assertTreeIntegrity(document);
  });

  it("returns null when the block is the first child", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBeNull();
    assertTreeIntegrity(document);
  });

  it("returns null when the block does not exist in the document", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    // Act
    const result = document.getPreviousSiblingBlock("non-existent-block-id");

    // Assert
    expect(result).toBeNull();
    assertTreeIntegrity(document);
  });

  it("returns null when the document is empty", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBeNull();
    assertTreeIntegrity(document);
  });

  it("returns null when the block is the root block", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Act
    const result = document.getPreviousSiblingBlock(document.ROOT_ID);

    // Assert
    expect(result).toBeNull();
  });

  it("returns null when the block is the only child of its parent", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBeNull();
    assertTreeIntegrity(document);
  });

  it("returns the previous sibling for nested blocks", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK3.id);

    // Assert
    expect(result).toBe(document.getBlock(SAMPLE_BLOCK2.id));
    expect(result).toBe(document.getRoot().children.at(0)?.children?.at(1));
    assertTreeIntegrity(document);
  });

  it("returns the previous sibling when there are multiple siblings", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK4);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK3.id);

    // Assert
    expect(result).toBe(document.getBlock(SAMPLE_BLOCK2.id));
    expect(result).toBe(document.getRoot().children?.at(1));
    assertTreeIntegrity(document);
  });

  it("returns null for the first child in a nested structure", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK1.id);

    // Assert
    expect(result).toBeNull();
    assertTreeIntegrity(document);
  });

  it("returns the previous sibling correctly when blocks are inserted in different orders", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK3);
    document.insertBefore(SAMPLE_BLOCK3.id, SAMPLE_BLOCK2);

    // Act
    const result = document.getPreviousSiblingBlock(SAMPLE_BLOCK3.id);

    // Assert
    expect(result).toBe(document.getBlock(SAMPLE_BLOCK2.id));
    expect(result).toBe(document.getRoot().children?.at(1));
    assertTreeIntegrity(document);
  });
});

import type { Block } from "../../blocks/models/block.models";
import { SAMPLE_BLOCK1, SAMPLE_BLOCK2 } from "../utils/document-test.utils";
import { DocumentRoot } from "./DocumentRoot";

const testBlock: Block = {
  ...SAMPLE_BLOCK1,
  parentId: "some-root",
};

describe("DocumentRoot", () => {
  it("instantiates a new DocumentRoot with the same id and children", () => {
    // Arrange
    const documentRoot = new DocumentRoot("some-root", [testBlock]);

    // Assert
    expect(documentRoot.id).toBe("some-root");
    expect(documentRoot.children).toEqual([testBlock]);
  });
});

describe("clone()", () => {
  it("creates a new DocumentRoot with the same id and children", () => {
    // Arrange
    const documentRoot = new DocumentRoot("some-root", [testBlock]);

    // Act
    const newDocumentRoot = documentRoot.clone();

    // Assert
    expect(newDocumentRoot.id).toBe("some-root");
    expect(newDocumentRoot.children).toEqual([testBlock]);
  });

  it("creates a new DocumentRoot with the same id and children structure but different objects in memory", () => {
    // Arrange
    const block: Block = {
      ...testBlock,
      children: [{ ...SAMPLE_BLOCK2, parentId: testBlock.id }],
    };
    const documentRoot = new DocumentRoot("some-other-root", [block]);

    // Act
    const newDocumentRoot = documentRoot.clone();

    // Assert
    expect(documentRoot).toEqual(newDocumentRoot);
    expect(documentRoot).not.toBe(newDocumentRoot);

    expect(newDocumentRoot.children).not.toBe(documentRoot.children);
    expect(documentRoot.children[0]).not.toBe(newDocumentRoot.children[0]);

    expect(documentRoot.children[0]?.children?.[0]).not.toBe(
      newDocumentRoot.children[0]?.children?.[0],
    );
  });
});

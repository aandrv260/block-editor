import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { EditorDocument } from "./EditorDocument";

describe("clone()", () => {
  it("creates a deep copy of the document", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK4);

    // Act
    const clonedDocument = document.clone();
    const clonedDocumentRoot = clonedDocument.getRoot();

    // Assert
    expect(clonedDocument.getRoot()).toBeInstanceOf(DocumentRoot);
    expect(clonedDocument).toStrictEqual(document);
    expect(clonedDocument.toJSON()).toBe(document.toJSON());

    expect(clonedDocumentRoot.children).not.toBe(document.getRoot().children);

    expect(clonedDocument.getBlock(SAMPLE_BLOCK1.id)).toStrictEqual(
      document.getBlock(SAMPLE_BLOCK1.id),
    );

    expect(clonedDocumentRoot.children[0]).not.toBe(document.getRoot().children[0]);

    expect(clonedDocument.getBlock(SAMPLE_BLOCK2.id)).toStrictEqual(
      document.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(clonedDocumentRoot.children[0]).not.toBe(document.getRoot().children[0]);

    expect(clonedDocument.getBlock(SAMPLE_BLOCK3.id)).toStrictEqual(
      document.getBlock(SAMPLE_BLOCK3.id),
    );

    expect(clonedDocumentRoot.children[0]).not.toBe(document.getRoot().children[0]);

    expect(clonedDocument.getBlock(SAMPLE_BLOCK4.id)).toStrictEqual(
      document.getBlock(SAMPLE_BLOCK4.id),
    );

    expect(clonedDocumentRoot.children[0]).not.toBe(document.getRoot().children[0]);

    assertTreeIntegrity(document);
    assertTreeIntegrity(clonedDocument);
  });

  it("doesn't mutate the objects of the original document if the cloned document is mutated", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3);

    const clonedDocument = document.clone();

    // Act
    clonedDocument.updateBlock(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST4_BLOCK, {
      childrenStrategy: "preserve",
    });

    //  Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST1_BLOCK.id },
            { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST1_BLOCK.id },
          ],
        },
      ],
    });

    expect(document.size).toBe(4);
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(1),
    );

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).not.toBe(
      clonedDocument.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).not.toBe(
      clonedDocument.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)).not.toEqual(
      clonedDocument.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(document.getBlock(SAMPLE_BLOCK2.id)?.parentId).toBe(
      TOGGLE_LIST1_BLOCK.id,
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).not.toEqual(
      clonedDocument.getBlock(SAMPLE_BLOCK3.id),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)?.parentId).toBe(
      TOGGLE_LIST1_BLOCK.id,
    );

    expect(clonedDocument.getRoot()).toEqual({
      id: clonedDocument.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: clonedDocument.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK2, parentId: TOGGLE_LIST4_BLOCK.id },
            { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST4_BLOCK.id },
          ],
        },
      ],
    });

    expect(clonedDocument.size).toBe(4);
    expect(clonedDocument.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(clonedDocument.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      clonedDocument.getRoot().children.at(0),
    );

    expect(clonedDocument.getBlock(SAMPLE_BLOCK2.id)).toBe(
      clonedDocument.getRoot().children.at(0)?.children?.at(0),
    );

    expect(clonedDocument.getBlock(SAMPLE_BLOCK3.id)).toBe(
      clonedDocument.getRoot().children.at(0)?.children?.at(1),
    );

    expect(clonedDocument.getBlock(SAMPLE_BLOCK2.id)?.parentId).toBe(
      TOGGLE_LIST4_BLOCK.id,
    );

    expect(clonedDocument.getBlock(SAMPLE_BLOCK3.id)?.parentId).toBe(
      TOGGLE_LIST4_BLOCK.id,
    );

    expect(document.size).toBe(clonedDocument.size);
    assertTreeIntegrity(clonedDocument);
    assertTreeIntegrity(document);
  });
});

import {
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  assertTreeIntegrity,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("traverse()", () => {
  it("loops through each block in the tree and calls the callback with the block as argument", () => {
    // Arrange
    const traverseCallback = vi.fn();
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK5);

    // Act
    document.traverse(traverseCallback);

    // Assert
    assertTreeIntegrity(document);
    expect(traverseCallback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: TOGGLE_LIST1_BLOCK.id,
        data: TOGGLE_LIST1_BLOCK.data,
        type: TOGGLE_LIST1_BLOCK.type,
      }),
    );

    expect(traverseCallback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: TOGGLE_LIST2_BLOCK.id,
        data: expect.objectContaining(TOGGLE_LIST2_BLOCK.data),
        type: TOGGLE_LIST2_BLOCK.type,
      }),
    );

    expect(traverseCallback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        id: TOGGLE_LIST3_BLOCK.id,
        data: expect.objectContaining(TOGGLE_LIST3_BLOCK.data),
        type: TOGGLE_LIST3_BLOCK.type,
      }),
    );

    expect(traverseCallback).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        id: SAMPLE_BLOCK4.id,
        data: expect.objectContaining(SAMPLE_BLOCK4.data),
        type: SAMPLE_BLOCK4.type,
      }),
    );

    expect(traverseCallback).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        id: SAMPLE_BLOCK5.id,
        data: expect.objectContaining(SAMPLE_BLOCK5.data),
        type: SAMPLE_BLOCK5.type,
      }),
    );
  });

  it("loops through each block in the tree and calls the callback with the block as argument when the user passes a subtree root", () => {
    // Arrange
    const traverseCallback = vi.fn();
    const document = new EditorDocument();

    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(document.ROOT_ID, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK5);

    const subtreeRoot = document.getBlock(TOGGLE_LIST2_BLOCK.id)!;

    // Act
    document.traverse(traverseCallback, subtreeRoot);

    // Assert
    assertTreeIntegrity(document);
    expect(traverseCallback).toHaveBeenCalledTimes(3);
    expect(traverseCallback).toHaveBeenNthCalledWith(1, {
      id: TOGGLE_LIST3_BLOCK.id,
      data: TOGGLE_LIST3_BLOCK.data,
      type: TOGGLE_LIST3_BLOCK.type,
      parentId: TOGGLE_LIST2_BLOCK.id,
      children: expect.any(Array),
    });

    expect(traverseCallback).toHaveBeenNthCalledWith(2, {
      id: SAMPLE_BLOCK4.id,
      data: SAMPLE_BLOCK4.data,
      type: SAMPLE_BLOCK4.type,
      parentId: TOGGLE_LIST2_BLOCK.id,
    });

    expect(traverseCallback).toHaveBeenNthCalledWith(3, {
      id: SAMPLE_BLOCK5.id,
      data: SAMPLE_BLOCK5.data,
      type: SAMPLE_BLOCK5.type,
      parentId: TOGGLE_LIST3_BLOCK.id,
    });

    // Assert that blocks outside the subtree were not traversed
    expect(traverseCallback).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: TOGGLE_LIST1_BLOCK.id,
      }),
    );

    expect(traverseCallback).not.toHaveBeenCalledWith(
      expect.objectContaining({
        id: TOGGLE_LIST2_BLOCK.id,
      }),
    );
  });
});

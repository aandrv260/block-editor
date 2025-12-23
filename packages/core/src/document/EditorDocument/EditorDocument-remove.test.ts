import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { ParentBlockCannotHaveChildrenError } from "../errors/append-child";
import {
  BlockToRemoveHasNoParentError,
  BlockToRemoveNotFoundError,
  CannotRemoveRootError,
} from "../errors/remove";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST5_BLOCK,
  assertTreeIntegrity,
  testBlockToBlock,
} from "../utils/document-test.utils";
import { EditorDocument } from "./EditorDocument";

describe("remove()", () => {
  it("throws an error if we try to delete the document root", () => {
    // Arrange
    const document = new EditorDocument();
    const removeRoot = () => document.remove(EditorDocument.ROOT_ID);

    // Assert
    assertEngineError(removeRoot, {
      ExpectedErrorClass: CannotRemoveRootError,
      expectedCode: "DOCUMENT:CANNOT_REMOVE_ROOT",
      expectedMessage: "You cannot remove the root! Only its descendants.",
    });
  });

  it("throws an error if the user tries to delete a block that doesn't exist in the document", () => {
    // Arrange
    const document = new EditorDocument();
    const removeBlock = () => document.remove("some_not_existing_block");

    // Assert
    assertEngineError(removeBlock, {
      ExpectedErrorClass: BlockToRemoveNotFoundError,
      expectedCode: "DOCUMENT:BLOCK_TO_REMOVE_NOT_FOUND",
      expectedMessage: "The block you're trying to remove does not exist!",
      expectedContext: { blockId: "some_not_existing_block" },
    });
  });

  it("throws an error if the block to delete does not have a parent", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);

    document.getBlock(TOGGLE_LIST1_BLOCK.id)!.parentId =
      "some_parent_that_does_not_exist";

    const removeBlock = () => document.remove(TOGGLE_LIST1_BLOCK.id);

    // Assert
    assertEngineError(removeBlock, {
      ExpectedErrorClass: BlockToRemoveHasNoParentError,
      expectedCode: "DOCUMENT:BLOCK_TO_REMOVE_HAS_NO_PARENT",
      expectedMessage: "The block you're trying to remove does not have a parent!",
      expectedContext: { blockId: TOGGLE_LIST1_BLOCK.id },
    });
  });

  // Just in any case to be absolutely sure that there won't be any suprises after refactors. It's practically imposible to reproduce such bug since the class and its method are covered extensively and I'm sure and extremely confident in the tests.
  it("throws an error if the parent of the block to delete cannot have children", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2);

    document.getBlock(TOGGLE_LIST1_BLOCK.id)!.type = "text";

    const remove = () => document.remove(SAMPLE_BLOCK2.id);

    // Assert
    assertEngineError(remove, {
      ExpectedErrorClass: ParentBlockCannotHaveChildrenError,
      expectedCode: "DOCUMENT:PARENT_BLOCK_CANNOT_HAVE_CHILDREN",
      expectedMessage: `Parent block with ID ${TOGGLE_LIST1_BLOCK.id} cannot have children!`,
      expectedContext: { parentId: TOGGLE_LIST1_BLOCK.id },
    });
  });

  it("removes from the document all child blocks of the target block", () => {
    // Arrange
    const document = new EditorDocument();

    document.appendChild(EditorDocument.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(EditorDocument.ROOT_ID, TOGGLE_LIST5_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK2);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK4);

    // Act
    document.remove(TOGGLE_LIST1_BLOCK.id);

    // Assert
    const targetParent = document.getRoot();

    assertTreeIntegrity(document);
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(targetParent.children).toEqual([
      testBlockToBlock(TOGGLE_LIST5_BLOCK, "root"),
    ]);
  });

  it("removes deep child blocks from the document and their deep descendants correctly", () => {
    // Arrange
    const document = new EditorDocument();

    // Act
    document.appendChild(EditorDocument.ROOT_ID, TOGGLE_LIST1_BLOCK);
    document.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST5_BLOCK);
    document.appendChild(TOGGLE_LIST5_BLOCK.id, TOGGLE_LIST2_BLOCK);
    document.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    document.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK4);

    document.remove(TOGGLE_LIST1_BLOCK.id);

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();

    expect(document.getRoot().children).toEqual([]);
    expect(document["blocksMap"].size).toBe(0);

    assertTreeIntegrity(document);
  });

  it("correctly removes a block that cannot have children", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK2);

    // Act
    document.remove(SAMPLE_BLOCK1.id);

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [{ ...SAMPLE_BLOCK2, parentId: "root" }],
    });
  });

  test("removing the same block twice throws", () => {
    // Arrange
    const document = new EditorDocument();
    document.appendChild(document.ROOT_ID, SAMPLE_BLOCK1);

    const removeElement = () => {
      document.remove(SAMPLE_BLOCK1.id);
      document.remove(SAMPLE_BLOCK1.id);
    };

    // Assert
    assertEngineError(removeElement, {
      ExpectedErrorClass: BlockToRemoveNotFoundError,
      expectedCode: "DOCUMENT:BLOCK_TO_REMOVE_NOT_FOUND",
      expectedMessage: "The block you're trying to remove does not exist!",
      expectedContext: { blockId: SAMPLE_BLOCK1.id },
    });
  });
});

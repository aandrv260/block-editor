import type { DeleteBlockActionPayload } from "../../../actions/action-types/delete-block-action.models";
import {
  createCommand,
  DEFAULT_INITIAL_BLOCKS,
  type DocumentBlocksInitialization,
} from "../utils/commandExecutors-test.utils";
import { DeleteBlockCommand } from "./DeleteBlockCommand";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../../document/utils/document-test.utils";
import { EditorDocument } from "../../../document/EditorDocument";
import { BlockToDeleteNotFoundError } from "../../errors/delete-block/BlockToDeleteNotFoundError";
import { assertEngineError } from "../../../errors/test-utils/error-test.utils";

const createDeleteCommand = (
  payload: DeleteBlockActionPayload,
  documentBlocks?: DocumentBlocksInitialization[],
) => {
  const { command, ...commandUtils } = createCommand<"block:delete">({
    command: DeleteBlockCommand,
    payload,
    documentBlocks: documentBlocks ?? DEFAULT_INITIAL_BLOCKS,
  });

  return {
    ...commandUtils,
    deleteCommand: command,
  };
};

describe("DeleteBlockCommand", () => {
  it("throws an error if the block to delete does not exist", () => {
    // Arrange
    const { document, deleteCommand, assertInitialDefaultDocumentStructure } =
      createDeleteCommand({
        blockId: "some_not_existing_block",
      });

    const tryToDeleteBlock = () => deleteCommand.execute();

    // Assert
    assertEngineError(tryToDeleteBlock, {
      ExpectedErrorClass: BlockToDeleteNotFoundError,
      expectedCode: "COMMAND:BLOCK_TO_DELETE_NOT_FOUND",
      expectedMessage: "The block you're trying to delete does not exist!",
      expectedContext: { blockId: "some_not_existing_block" },
    });

    // Assert not deleted
    assertInitialDefaultDocumentStructure();
    assertTreeIntegrity(document);
  });

  it("removes the block from the document", () => {
    // Arange
    const { document, deleteCommand, assertInitialDefaultDocumentStructure } =
      createDeleteCommand({
        blockId: TOGGLE_LIST1_BLOCK.id,
      });

    // Assert
    assertInitialDefaultDocumentStructure();

    // Act
    deleteCommand.execute();

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [],
      }),
    );

    assertTreeIntegrity(document);
  });

  it("leaves a document that parses back from its JSON to the same tree", () => {
    // Arrange
    const { document, deleteCommand } = createDeleteCommand({
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    const initialDocumentJSON = document.toJSON();

    // Act
    deleteCommand.execute();

    const currentDocumentJSON = document.toJSON();

    // Assert
    expect(initialDocumentJSON).not.toBe(currentDocumentJSON);
    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(currentDocumentJSON)).toStrictEqual(document);
  });

  it("returns the block:delete event with the blockId of the deleted block", () => {
    // Arrange
    const { deleteCommand } = createDeleteCommand({
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    // Act
    const event = deleteCommand.execute();

    // Assert
    expect(event).toStrictEqual({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
    });
  });

  test("the whole functionality at once works properly", () => {
    // Arrange
    const { document, deleteCommand } = createDeleteCommand({
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    // Act
    const event = deleteCommand.execute();

    // Assert
    expect(event).toStrictEqual({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [],
      }),
    );

    assertTreeIntegrity(document);
  });
});

import type { UpdateBlockActionPayload } from "../../../actions/action-types/update-block-action.models";
import {
  createCommand,
  type DocumentBlocksInitialization,
} from "../utils/commandExecutors-test.utils";
import { UpdateBlockCommand } from "./UpdateBlockCommand";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  TOGGLE_LIST6_BLOCK,
} from "../../../document/utils/document-test.utils";
import { EditorDocument } from "../../../document/EditorDocument";
import { DOCUMENT_HISTORY_RECORDS_LIMIT } from "../../../history/DocumentHistory/DocumentHistory.utils";
import type { UpdateBlockChildrenStrategy } from "../../../document/models/document.models";

const createUpdateCommand = (
  payload: UpdateBlockActionPayload,
  documentBlocks?: DocumentBlocksInitialization[],
) => {
  const { command, document, ...commandUtils } = createCommand<"block:update">({
    command: UpdateBlockCommand,
    payload,
    documentBlocks,
  });

  const assertCorrectTreeStructure = () => {
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );
  };

  return {
    ...commandUtils,
    document,
    updateCommand: command,
    assertCorrectTreeStructure,
  };
};

// TODO: Always pass explicitly for each test the initial structure of the document through the `documentBlocks` parameter.
describe("UpdateBlockCommand", () => {
  it("updates the block data correctly when preserving the children", () => {
    // Arrange
    const { document, updateCommand } = createUpdateCommand(
      {
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: TOGGLE_LIST3_BLOCK,
        childrenStrategy: "preserve",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK1],
      ],
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    assertTreeIntegrity(document);

    // Act
    updateCommand.execute();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    assertTreeIntegrity(document);
  });

  it("updates the block data correctly when dropping the children", () => {
    // Arrange
    const { document, updateCommand } = createUpdateCommand(
      {
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: TOGGLE_LIST3_BLOCK,
        childrenStrategy: "drop",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK1],
      ],
    );

    // Assert

    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });
    // Act
    updateCommand.execute();

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    assertTreeIntegrity(document);
  });

  it("updates the block data correctly when replacing the children", () => {
    // Arrange
    const { document, updateCommand } = createUpdateCommand(
      {
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: {
          ...TOGGLE_LIST3_BLOCK,
          children: [
            { ...TOGGLE_LIST4_BLOCK, children: [SAMPLE_BLOCK3, SAMPLE_BLOCK4] },
            SAMPLE_BLOCK5,
          ],
        },
        childrenStrategy: "replace",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK1],
      ],
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    // Act
    updateCommand.execute();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST4_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST4_BLOCK.id },
                { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST4_BLOCK.id },
              ],
            },
            {
              ...SAMPLE_BLOCK5,
              parentId: TOGGLE_LIST3_BLOCK.id,
            },
          ],
        },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0)?.children?.at(1),
    );

    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(document);
  });

  it("adds the new snapshot of the document after change to the history", () => {
    // Arrange
    const { document, history, updateCommand } = createUpdateCommand(
      {
        blockId: SAMPLE_BLOCK1.id,
        newBlock: SAMPLE_BLOCK3,
        childrenStrategy: "preserve",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK1],
      ],
    );

    const initialDocumentJSON = document.toJSON();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK1, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    expect(history.getHistory()).toStrictEqual([initialDocumentJSON]);
    expect(history.getCurrent()).toBe(initialDocumentJSON);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getLimit()).toBe(DOCUMENT_HISTORY_RECORDS_LIMIT);
    expect(history.getSize()).toBe(1);

    // Act
    updateCommand.execute();

    // Assert
    const documentJSONAfterUpdate = document.toJSON();

    expect(history.getHistory()).toStrictEqual([
      initialDocumentJSON,
      documentJSONAfterUpdate,
    ]);

    expect(history.getCurrent()).toBe(documentJSONAfterUpdate);
    expect(initialDocumentJSON).not.toBe(documentJSONAfterUpdate);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(documentJSONAfterUpdate)).toStrictEqual(document);
  });

  test.each([["preserve"], ["replace"], ["drop"]] as [
    UpdateBlockChildrenStrategy,
  ][])(
    "emits an event with payload the blockId of the updated item when childrenStrategy is set to %s",
    childrenStrategy => {
      // Arrange
      const { eventBus, updateCommand } = createUpdateCommand(
        {
          blockId: TOGGLE_LIST4_BLOCK.id,
          newBlock: TOGGLE_LIST6_BLOCK,
          childrenStrategy,
        },
        [
          ["root", TOGGLE_LIST1_BLOCK],
          [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST4_BLOCK],
        ],
      );

      const updateBlockEventCallback = vi.fn();
      eventBus.on("block:update", updateBlockEventCallback);

      // Act
      updateCommand.execute();

      // Assert
      expect(updateBlockEventCallback).toHaveBeenCalledExactlyOnceWith({
        type: "block:update",
        blockId: TOGGLE_LIST4_BLOCK.id,
        newBlock: TOGGLE_LIST6_BLOCK,
        childrenStrategy,
      });
    },
  );

  it("emits only block:update event", () => {
    // Arrange
    const { eventBus, updateCommand } = createUpdateCommand(
      {
        blockId: SAMPLE_BLOCK1.id,
        newBlock: SAMPLE_BLOCK3,
        childrenStrategy: "drop",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK1],
      ],
    );

    const onInsertBlock = vi.fn();
    const onDeleteBlock = vi.fn();
    const onMoveBlock = vi.fn();
    const onUpdateBlock = vi.fn();

    eventBus.on("block:insert", onInsertBlock);
    eventBus.on("block:delete", onDeleteBlock);
    eventBus.on("block:move", onMoveBlock);
    eventBus.on("block:update", onUpdateBlock);

    // Act
    updateCommand.execute();

    // Assert
    expect(onInsertBlock).not.toHaveBeenCalled();
    expect(onDeleteBlock).not.toHaveBeenCalled();
    expect(onMoveBlock).not.toHaveBeenCalled();
    expect(onUpdateBlock).toHaveBeenCalledExactlyOnceWith({
      type: "block:update",
      blockId: SAMPLE_BLOCK1.id,
      newBlock: SAMPLE_BLOCK3,
      childrenStrategy: "drop",
    });
  });

  test("whole update flow with different strategies", () => {
    // Arrange
    const {
      document,
      history,
      eventBus,
      updateCommand: updateCommandWithPreserveStrategy,
    } = createUpdateCommand(
      {
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: TOGGLE_LIST3_BLOCK,
        childrenStrategy: "preserve",
      },
      [
        ["root", TOGGLE_LIST1_BLOCK],
        ["root", SAMPLE_BLOCK1],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, SAMPLE_BLOCK3],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK5],
      ],
    );

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST2_BLOCK.id },
                { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },

            { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST1_BLOCK.id },
          ],
        },

        { ...SAMPLE_BLOCK1, parentId: "root" },
      ],
    });

    // Act
    updateCommandWithPreserveStrategy.execute();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [
                { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST2_BLOCK.id },
                { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST2_BLOCK.id },
              ],
            },

            { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST3_BLOCK.id },
          ],
        },

        { ...SAMPLE_BLOCK1, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    assertTreeIntegrity(document);

    // Act
    const updateCommandWithDropStrategy = new UpdateBlockCommand(
      {
        blockId: TOGGLE_LIST2_BLOCK.id,
        newBlock: TOGGLE_LIST4_BLOCK,
        childrenStrategy: "drop",
      },
      eventBus,
      history,
      document,
    );

    updateCommandWithDropStrategy.execute();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST3_BLOCK,
          parentId: "root",
          children: [
            {
              ...TOGGLE_LIST4_BLOCK,
              parentId: TOGGLE_LIST3_BLOCK.id,
              children: [],
            },

            { ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST3_BLOCK.id },
          ],
        },

        { ...SAMPLE_BLOCK1, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK5.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(document);

    // Act
    const updateCommandWithReplaceStrategy = new UpdateBlockCommand(
      {
        blockId: TOGGLE_LIST3_BLOCK.id,
        newBlock: { ...TOGGLE_LIST5_BLOCK, children: [SAMPLE_BLOCK6] },
        childrenStrategy: "replace",
      },
      eventBus,
      history,
      document,
    );

    updateCommandWithReplaceStrategy.execute();

    // Assert
    expect(document.getRoot()).toEqual({
      id: "root",
      children: [
        {
          ...TOGGLE_LIST5_BLOCK,
          parentId: "root",
          children: [{ ...SAMPLE_BLOCK6, parentId: TOGGLE_LIST5_BLOCK.id }],
        },

        { ...SAMPLE_BLOCK1, parentId: "root" },
      ],
    });

    expect(document.getBlock(TOGGLE_LIST3_BLOCK.id)).toBeNull();
    expect(document.getBlock(TOGGLE_LIST4_BLOCK.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      document.getRoot().children.at(0),
    );

    expect(document.getBlock(SAMPLE_BLOCK6.id)).toBe(
      document.getRoot().children.at(0)?.children?.at(0),
    );

    expect(document.size).toBe(4);
    assertTreeIntegrity(document);
  });
});

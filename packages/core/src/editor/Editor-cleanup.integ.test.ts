import { deleteBlock, insertBlock } from "@/actions/actions";
import { SAMPLE_BLOCK1, SAMPLE_BLOCK2 } from "@/document/utils/document-test.utils";
import { createEditor } from "./Editor-test.utils";

describe("Editor cleanup", () => {
  test("the user can cleanup the editor events", () => {
    // Arrange
    const { editor } = createEditor();

    const insertEventCallback = vi.fn();
    const deleteEventCallback = vi.fn();

    // Act
    editor.subscribe("block:insert", insertEventCallback);
    editor.subscribe("block:delete", deleteEventCallback);

    // Assert
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    );

    expect(insertEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.ROOT_ID,
      strategy: "append",
    });

    expect(deleteEventCallback).not.toHaveBeenCalled();

    // Act - delete the block1
    vi.clearAllMocks();
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK1.id }));

    // Assert
    expect(deleteEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(insertEventCallback).not.toHaveBeenCalled();

    // Act - cleanup the editor
    vi.clearAllMocks();
    editor.cleanup();

    // Act - insert a new block
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      }),
    );

    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK2.id }));

    // Assert
    expect(insertEventCallback).not.toHaveBeenCalled();
    expect(deleteEventCallback).not.toHaveBeenCalled();
  });
});

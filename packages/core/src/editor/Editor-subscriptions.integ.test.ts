import { createEditor } from "./Editor-test.utils";
import { insertBlock, deleteBlock } from "@/actions/actions";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK5,
} from "@/document/utils/document-test.utils";
import { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";

describe("Editor subscriptions", () => {
  test("the user can subscribe to events directly with subscribe()", () => {
    // Arrange
    const { editor } = createEditor();
    const insertEventCallback = vi.fn();
    const deleteEventCallback = vi.fn();

    // Act
    const unsubscribeFromInsert = editor.subscribe(
      "block:insert",
      insertEventCallback,
    );

    const unsubscribeFromDelete = editor.subscribe(
      "block:delete",
      deleteEventCallback,
    );

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

    // Act - unsubscribe from the insert event
    vi.clearAllMocks();
    unsubscribeFromInsert();

    // Act - insert a new block
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      }),
    );

    // Assert
    expect(insertEventCallback).not.toHaveBeenCalled();
    expect(deleteEventCallback).not.toHaveBeenCalled();

    // Act - unsubscribe from the delete event
    vi.clearAllMocks();
    unsubscribeFromDelete();

    // Act - delete the block2
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK2.id }));

    // Assert
    expect(deleteEventCallback).not.toHaveBeenCalled();
    expect(insertEventCallback).not.toHaveBeenCalled();
  });

  test("the user can unsubscribe from events with unsubscribe()", () => {
    // Arrange
    const { editor } = createEditor();
    const insertEventCallback = vi.fn();
    const deleteEventCallback = vi.fn();

    // Act
    editor.subscribe("block:insert", insertEventCallback);
    editor.subscribe("block:delete", deleteEventCallback);

    // Act - insert block1
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    );

    // Assert
    expect(insertEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.ROOT_ID,
      strategy: "append",
    });

    // Act - unsubscribe from the insert event
    vi.clearAllMocks();
    editor.unsubscribe("block:insert", insertEventCallback);

    // Act - insert block2
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      }),
    );

    // Assert
    expect(insertEventCallback).not.toHaveBeenCalled();
    expect(deleteEventCallback).not.toHaveBeenCalled();

    // Act - delete block1
    vi.clearAllMocks();
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK1.id }));

    // Assert
    expect(deleteEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(insertEventCallback).not.toHaveBeenCalled();

    // Act - unsubscribe from the delete event
    vi.clearAllMocks();
    editor.unsubscribe("block:delete", deleteEventCallback);

    // Act - delete block2
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK2.id }));

    // Assert
    expect(deleteEventCallback).not.toHaveBeenCalled();
  });

  test("the user can unsubscribe from events with the callback function returned from subscribe()", () => {
    // Arrange
    const { editor } = createEditor();
    const insertEventCallback = vi.fn();
    const unsubscribeFromInsertEvent = editor.subscribe(
      "block:insert",
      insertEventCallback,
    );

    // Act
    editor.dispatchAction(
      insertBlock({
        targetId: editor.getRoot().id,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    );

    // Assert
    expect(insertEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.getRoot().id,
      strategy: "append",
    });

    insertEventCallback.mockClear();

    // Act - unsubscribe from the event
    unsubscribeFromInsertEvent();

    // Assert
    editor.dispatchAction(
      insertBlock({
        targetId: editor.getRoot().id,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      }),
    );

    expect(insertEventCallback).not.toHaveBeenCalled();
  });

  it("the user can filter through the stream and map the events properly and then unsubscribe", () => {
    // Arrange
    const { editor } = createEditor({
      initialDocument: new DocumentRoot("root", [
        { ...SAMPLE_BLOCK1, parentId: "root" },
        { ...SAMPLE_BLOCK2, parentId: "root" },
      ]),
    });

    const deleteBlock1Tap1 = vi.fn();
    const deleteBlock1Tap2 = vi.fn();

    const deleteBlock2Tap1 = vi.fn();
    const deleteBlock2Tap2 = vi.fn();

    const insertBlock1Tap1 = vi.fn();
    const insertBlock1Tap2 = vi.fn();

    const deleteBlock1EventCallback = vi.fn();
    const deleteBlock2EventCallback = vi.fn();
    const insertBlock1EventCallback = vi.fn();

    // Act
    const deleteBlock1Unsubscribe = editor
      .on("block:delete")
      .filter(event => event.blockId === SAMPLE_BLOCK1.id)
      .tap(deleteBlock1Tap1)
      .map(event => event.blockId)
      .tap(deleteBlock1Tap2)
      .subscribe(deleteBlock1EventCallback);

    editor
      .on("block:delete")
      .filter(event => event.blockId === SAMPLE_BLOCK2.id)
      .tap(deleteBlock2Tap1)
      .map(event => event.blockId)
      .tap(deleteBlock2Tap2)
      .subscribe(deleteBlock2EventCallback);

    editor
      .on("block:insert")
      .filter(event => event.blockId === SAMPLE_BLOCK1.id)
      .tap(insertBlock1Tap1)
      .map(event => event.blockId)
      .tap(insertBlock1Tap2)
      .subscribe(insertBlock1EventCallback);

    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK1.id }));

    // Assert
    expect(deleteBlock1EventCallback).toHaveBeenCalledExactlyOnceWith(
      SAMPLE_BLOCK1.id,
    );

    expect(deleteBlock2EventCallback).not.toHaveBeenCalled();
    expect(insertBlock1EventCallback).not.toHaveBeenCalled();

    expect(deleteBlock1Tap1).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(deleteBlock1Tap2).toHaveBeenCalledExactlyOnceWith(SAMPLE_BLOCK1.id);

    // Act
    vi.clearAllMocks();

    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK2.id }));

    // Assert
    expect(deleteBlock1EventCallback).not.toHaveBeenCalled();

    expect(deleteBlock2EventCallback).toHaveBeenCalledExactlyOnceWith(
      SAMPLE_BLOCK2.id,
    );

    expect(insertBlock1EventCallback).not.toHaveBeenCalled();

    expect(deleteBlock2Tap1).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK2.id,
    });

    expect(deleteBlock2Tap2).toHaveBeenCalledExactlyOnceWith(SAMPLE_BLOCK2.id);

    // Act
    vi.clearAllMocks();

    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK3,
      }),
    );

    // Assert
    expect(deleteBlock1EventCallback).not.toHaveBeenCalled();
    expect(deleteBlock2EventCallback).not.toHaveBeenCalled();
    expect(insertBlock1EventCallback).not.toHaveBeenCalled();

    expect(insertBlock1Tap1).not.toHaveBeenCalled();
    expect(insertBlock1Tap2).not.toHaveBeenCalled();

    // Act
    vi.clearAllMocks();

    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    );

    // Assert
    expect(deleteBlock1EventCallback).not.toHaveBeenCalled();
    expect(deleteBlock2EventCallback).not.toHaveBeenCalled();
    expect(insertBlock1EventCallback).toHaveBeenCalledExactlyOnceWith(
      SAMPLE_BLOCK1.id,
    );

    expect(insertBlock1Tap1).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.ROOT_ID,
      strategy: "append",
    });

    expect(insertBlock1Tap2).toHaveBeenCalledExactlyOnceWith(SAMPLE_BLOCK1.id);

    // Act
    vi.clearAllMocks();
    deleteBlock1Unsubscribe();

    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK1.id }));

    // Assert
    expect(deleteBlock1EventCallback).not.toHaveBeenCalled();
    expect(deleteBlock2EventCallback).not.toHaveBeenCalled();
    expect(insertBlock1EventCallback).not.toHaveBeenCalled();

    expect(deleteBlock1Tap1).not.toHaveBeenCalled();
    expect(deleteBlock1Tap2).not.toHaveBeenCalled();
  });

  test("subscriptions fire on actions and event order matches action order", () => {
    // Arrange
    let insertCount = 0;
    const insertEventCallback1 = vi.fn();
    const insertEventCallback2 = vi.fn();

    let deleteCount = 0;
    const deleteEventCallback1 = vi.fn();
    const deleteEventCallback2 = vi.fn();

    const { editor } = createEditor();

    // Act
    editor.subscribe("block:insert", () => {
      insertCount++;
      insertEventCallback1(insertCount);
    });

    editor
      .on("block:insert")
      .map(event => event.blockId)
      .filter(blockId => blockId === SAMPLE_BLOCK5.id)
      .subscribe(() => {
        insertCount++;
        insertEventCallback2(insertCount);
      });

    editor
      .on("block:delete")
      .filter(event => event.blockId === SAMPLE_BLOCK5.id)
      .map(event => event.blockId)
      .subscribe(() => {
        deleteCount++;
        deleteEventCallback1(deleteCount);
      });

    editor.subscribe("block:delete", () => {
      deleteCount++;
      deleteEventCallback2(deleteCount);
    });

    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        newBlock: SAMPLE_BLOCK5,
        strategy: "append",
      }),
    );

    // Assert
    expect(insertEventCallback1).toHaveBeenCalledExactlyOnceWith(1);
    expect(insertEventCallback2).toHaveBeenCalledExactlyOnceWith(2);

    expect(deleteEventCallback1).not.toHaveBeenCalled();
    expect(deleteEventCallback2).not.toHaveBeenCalled();

    // Act
    vi.clearAllMocks();
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK5.id }));

    // Assert
    expect(insertEventCallback1).not.toHaveBeenCalled();
    expect(insertEventCallback2).not.toHaveBeenCalled();

    expect(deleteEventCallback1).toHaveBeenCalledExactlyOnceWith(1);
    expect(deleteEventCallback2).toHaveBeenCalledExactlyOnceWith(2);
  });
});

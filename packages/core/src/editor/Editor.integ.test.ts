import { deleteBlock, insertBlock, moveBlock, updateBlock } from "@/actions/actions";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK10,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST5_BLOCK,
} from "@/document/utils/document-test.utils";
import { createEditor, createDocumentToSwapWith } from "@/editor/Editor-test.utils";

describe("Editor full integration", () => {
  test("full document mutation flow - CRUD", () => {
    // Arrange
    const { editor, assertHistory, INITIAL_DOCUMENT_JSON } = createEditor();
    const appendEventCallback = vi.fn();
    const onPersistInsert = vi.fn();
    const onPersistDelete = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    editor.subscribe("block:insert", appendEventCallback);
    editor.subscribe("editor:persist", onPersist);
    editor.on("editor:change").subscribe(onEditorChange);

    editor
      .on("editor:persist")
      .filter(event => event.triggerAction === "block:insert")
      .subscribe(onPersistInsert);

    editor
      .on("editor:persist")
      .filter(event => event.triggerAction === "block:delete")
      .subscribe(onPersistDelete);

    // Assert
    assertHistory({
      expectedDocumentHistory: [editor.getDocumentJSON()],
      expectedCurrentPositionInHistory: 0,
      expectedHistorySize: 1,
    });

    expect(editor.getDocumentSize()).toBe(1);

    // Act - Add a block
    editor.dispatchAction(
      insertBlock({
        targetId: editor.getRoot().id,
        strategy: "append",
        newBlock: { ...TOGGLE_LIST1_BLOCK, children: [SAMPLE_BLOCK2] },
      }),
    );

    // Assert correct
    expect(editor.isOnlyBlockInDocument(TOGGLE_LIST1_BLOCK.id)).toBe(false);
    expect(editor.getNextSiblingBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getPreviousSiblingBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 1,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();

    expect(onPersistInsert).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(editor.getDocumentSize()).toBe(3);

    assertHistory({
      expectedDocumentHistory: [INITIAL_DOCUMENT_JSON, editor.getDocumentJSON()],
      expectedCurrentPositionInHistory: 1,
      expectedHistorySize: 2,
    });

    expect(appendEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: TOGGLE_LIST1_BLOCK.id,
      targetId: editor.getRoot().id,
      strategy: "append",
    });

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getRoot().children?.[0]?.children?.[0],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - insert after the second block
    vi.clearAllMocks();
    const insertAfterEventCallback = vi.fn();
    editor.subscribe("block:insert", insertAfterEventCallback);

    editor.dispatchAction(
      insertBlock({
        targetId: SAMPLE_BLOCK2.id,
        strategy: "after",
        newBlock: SAMPLE_BLOCK3,
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(4);
    expect(editor.getNextSiblingBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getBlock(SAMPLE_BLOCK3.id),
    );
    expect(editor.getPreviousSiblingBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 2,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();

    expect(onPersistInsert).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(insertAfterEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK3.id,
      targetId: SAMPLE_BLOCK2.id,
      strategy: "after",
    });

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK3.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - insert before the first block
    vi.clearAllMocks();
    const insertBeforeEventCallback = vi.fn();
    editor.subscribe("block:insert", insertBeforeEventCallback);

    editor.dispatchAction(
      insertBlock({
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "before",
        newBlock: SAMPLE_BLOCK4,
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(5);
    expect(editor.getNextSiblingBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getBlock(SAMPLE_BLOCK3.id),
    );

    expect(editor.getPreviousSiblingBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 3,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();

    expect(onPersistInsert).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(insertBeforeEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK4.id,
      targetId: TOGGLE_LIST1_BLOCK.id,
      strategy: "before",
    });

    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBe(editor.getRoot().children[0]);

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[1],
    );

    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getRoot().children[1]?.children?.[0],
    );
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getRoot().children[1]?.children?.[1],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: editor.ROOT_ID,
          }),

          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            parentId: editor.getRoot().id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK2.id,
              }),

              expect.objectContaining({
                id: SAMPLE_BLOCK3.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - remove the first block
    vi.clearAllMocks();
    const deleteEventCallback = vi.fn();
    editor.subscribe("block:delete", deleteEventCallback);

    editor.dispatchAction(
      deleteBlock({
        blockId: TOGGLE_LIST1_BLOCK.id,
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(2);
    expect(editor.isOnlyBlockInDocument(SAMPLE_BLOCK4.id)).toBe(true);
    expect(editor.getNextSiblingBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getPreviousSiblingBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:delete",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 4,
      root: editor.getRoot(),
      triggerAction: "block:delete",
    });

    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(onPersistDelete).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:delete",
    });

    expect(deleteEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: TOGGLE_LIST1_BLOCK.id,
    });

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - update the block
    vi.clearAllMocks();
    const updateEventCallback = vi.fn();
    editor.subscribe("block:update", updateEventCallback);

    editor.dispatchAction(
      updateBlock({
        blockId: SAMPLE_BLOCK4.id,
        newBlock: TOGGLE_LIST5_BLOCK,
        childrenStrategy: "drop",
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(2);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:update",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 5,
      root: editor.getRoot(),
      triggerAction: "block:update",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(updateEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:update",
      blockId: SAMPLE_BLOCK4.id,
      newBlock: TOGGLE_LIST5_BLOCK,
      childrenStrategy: "drop",
    });

    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - append to the only child block
    vi.clearAllMocks();
    const appendToBlock5EventCallback = vi.fn();
    editor.subscribe("block:insert", appendToBlock5EventCallback);

    editor.dispatchAction(
      insertBlock({
        targetId: TOGGLE_LIST5_BLOCK.id,
        strategy: "append",
        newBlock: SAMPLE_BLOCK6,
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(3);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 6,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();

    expect(onPersistInsert).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(appendToBlock5EventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK6.id,
      targetId: TOGGLE_LIST5_BLOCK.id,
      strategy: "append",
    });

    expect(editor.getBlock(SAMPLE_BLOCK6.id)).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST5_BLOCK.id,
            parentId: editor.getRoot().id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK6.id,
              }),
            ],
          }),
        ],
      }),
    );

    // Act - update the block and drop the children
    vi.clearAllMocks();
    const updateBlock5DroppingChildrenEventCallback = vi.fn();
    editor.subscribe("block:update", updateBlock5DroppingChildrenEventCallback);

    editor.dispatchAction(
      updateBlock({
        blockId: TOGGLE_LIST5_BLOCK.id,
        newBlock: SAMPLE_BLOCK7,
        childrenStrategy: "drop",
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(2);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:update",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 7,
      root: editor.getRoot(),
      triggerAction: "block:update",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(
      updateBlock5DroppingChildrenEventCallback,
    ).toHaveBeenCalledExactlyOnceWith({
      type: "block:update",
      blockId: TOGGLE_LIST5_BLOCK.id,
      newBlock: SAMPLE_BLOCK7,
      childrenStrategy: "drop",
    });

    expect(editor.getBlock(TOGGLE_LIST5_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK7.id)).toBe(editor.getRoot().children[0]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK7.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - add a block after the only block in the tree
    vi.clearAllMocks();
    const addBlockAfterBlock7EventCallback = vi.fn();
    editor.subscribe("block:insert", addBlockAfterBlock7EventCallback);

    editor.dispatchAction(
      insertBlock({
        targetId: SAMPLE_BLOCK7.id,
        strategy: "after",
        newBlock: SAMPLE_BLOCK8,
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(3);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 8,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(addBlockAfterBlock7EventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK8.id,
      targetId: SAMPLE_BLOCK7.id,
      strategy: "after",
    });

    expect(editor.getBlock(SAMPLE_BLOCK8.id)).toBe(editor.getRoot().children[1]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK7.id,
            parentId: editor.getRoot().id,
          }),
          expect.objectContaining({
            id: SAMPLE_BLOCK8.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - move block 7 after block 8
    vi.clearAllMocks();
    const moveBlock7AfterBlock8EventCallback = vi.fn();
    editor.subscribe("block:move", moveBlock7AfterBlock8EventCallback);

    editor.dispatchAction(
      moveBlock({
        blockId: SAMPLE_BLOCK7.id,
        targetId: SAMPLE_BLOCK8.id,
        strategy: "after",
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(3);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:move",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 9,
      root: editor.getRoot(),
      triggerAction: "block:move",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(moveBlock7AfterBlock8EventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:move",
      blockId: SAMPLE_BLOCK7.id,
      targetId: SAMPLE_BLOCK8.id,
      strategy: "after",
    });

    expect(editor.getBlock(SAMPLE_BLOCK7.id)).toBe(editor.getRoot().children[1]);
    expect(editor.getBlock(SAMPLE_BLOCK8.id)).toBe(editor.getRoot().children[0]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK8.id,
            parentId: editor.getRoot().id,
          }),
          expect.objectContaining({
            id: SAMPLE_BLOCK7.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - move block 7 before block 8
    vi.clearAllMocks();
    const moveBlock7BeforeBlock8EventCallback = vi.fn();
    editor.subscribe("block:move", moveBlock7BeforeBlock8EventCallback);

    editor.dispatchAction(
      moveBlock({
        blockId: SAMPLE_BLOCK7.id,
        targetId: SAMPLE_BLOCK8.id,
        strategy: "before",
      }),
    );

    // Assert
    expect(editor.getDocumentSize()).toBe(3);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "block:move",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 10,
      root: editor.getRoot(),
      triggerAction: "block:move",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(moveBlock7BeforeBlock8EventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:move",
      blockId: SAMPLE_BLOCK7.id,
      targetId: SAMPLE_BLOCK8.id,
      strategy: "before",
    });

    expect(editor.getBlock(SAMPLE_BLOCK7.id)).toBe(editor.getRoot().children[0]);
    expect(editor.getBlock(SAMPLE_BLOCK8.id)).toBe(editor.getRoot().children[1]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.getRoot().id,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK7.id,
            parentId: editor.getRoot().id,
          }),
          expect.objectContaining({
            id: SAMPLE_BLOCK8.id,
            parentId: editor.getRoot().id,
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - replace with another document
    vi.clearAllMocks();
    const documentToSwapWith = createDocumentToSwapWith();

    editor.swapDocument({
      element: documentToSwapWith,
      clearHistory: false,
    });

    // Assert
    expect(editor.getDocumentSize()).toBe(3);

    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      triggerAction: "document:swap",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: editor.getDocumentJSON(),
      history: editor.getHistory(),
      currentPositionInHistory: 11,
      root: editor.getRoot(),
      triggerAction: "document:swap",
    });

    expect(onPersistDelete).not.toHaveBeenCalled();
    expect(onPersistInsert).not.toHaveBeenCalled();

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: documentToSwapWith.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST3_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK10.id,
              }),
            ],
          }),
        ],
      }),
    );

    expect(editor.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK10.id)).toBe(
      editor.getRoot().children[0].children?.[0],
    );

    expect(editor["document"]["blocksMap"].size).toBe(2);
  });
});

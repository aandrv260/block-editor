import { Editor } from "./Editor";
import { createEditor } from "./Editor-test.utils";
import { insertBlock } from "@/actions/actions";
import {
  TOGGLE_LIST1_BLOCK,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK9,
  TOGGLE_LIST5_BLOCK,
} from "@/document/utils/document-test.utils";
import { updateBlock, deleteBlock } from "@/actions/actions";
import { moveBlock } from "@/actions/actions";
import { assertTreeIntegrity } from "@/document/utils/document-test.utils";
import { DocumentRoot } from "@/document/DocumentRoot/DocumentRoot";
import { EditorDocument } from "@/document/EditorDocument";
import { createTestDocument } from "@/commands/executors/utils/commandExecutors-test.utils";

describe("Editor document integration", () => {
  test("getRoot and getBlock are always synched in tree structure correct", () => {
    // Arrange
    const { editor, assertCorrectRootStructure } = createEditor();

    // Assert
    assertCorrectRootStructure();

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [],
      }),
    );

    // Act - insert a block
    editor.dispatchAction(
      insertBlock({
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: TOGGLE_LIST1_BLOCK,
      }),
    );

    // Assert
    assertCorrectRootStructure();

    expect(editor.getRoot().children[0]).toBe(
      editor.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    // Act - insert block2
    editor.dispatchAction(
      insertBlock({
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      }),
    );

    // Assert
    assertCorrectRootStructure();

    expect(editor.getRoot().children[0]).toBe(
      editor.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    expect(editor.getRoot().children[0]?.children?.[0]).toBe(
      editor.getBlock(SAMPLE_BLOCK2.id),
    );

    // Act - insert block3
    editor.dispatchAction(
      insertBlock({
        targetId: SAMPLE_BLOCK2.id,
        strategy: "after",
        newBlock: SAMPLE_BLOCK3,
      }),
    );

    // Assert
    assertCorrectRootStructure();

    expect(editor.getRoot().children[0]).toBe(
      editor.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    expect(editor.getRoot().children[0]?.children?.[0]).toBe(
      editor.getBlock(SAMPLE_BLOCK2.id),
    );

    expect(editor.getRoot().children[0]?.children?.[1]).toBe(
      editor.getBlock(SAMPLE_BLOCK3.id),
    );

    // Act - update block 1
    editor.dispatchAction(
      updateBlock({
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: SAMPLE_BLOCK4,
        childrenStrategy: "drop",
      }),
    );

    // Assert
    assertCorrectRootStructure();

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),
        ],
      }),
    );

    // Act - undo
    editor.undo();

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getRoot().children[0]?.children?.[1],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
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

    // Act - redo
    editor.redo();

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBe(editor.getRoot().children[0]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),
        ],
      }),
    );

    // Act - Delete block 4
    editor.dispatchAction(deleteBlock({ blockId: SAMPLE_BLOCK4.id }));

    // Assert
    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [],
      }),
    );

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();

    // Act - history jump
    editor.jumpToPointInHistory(3);

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getRoot().children[0]?.children?.[1],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
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

    // Act - move block 3 before 1
    editor.dispatchAction(
      moveBlock({
        blockId: SAMPLE_BLOCK3.id,
        targetId: TOGGLE_LIST1_BLOCK.id,
        strategy: "before",
      }),
    );

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(editor.getRoot().children[0]);
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[1],
    );
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(
      editor.getRoot().children[1]?.children?.[0],
    );

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK3.id,
          }),

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

    // Act - delete
    editor.dispatchAction(deleteBlock({ blockId: TOGGLE_LIST1_BLOCK.id }));

    // Assert
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(editor.getRoot().children[0]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK3.id,
          }),
        ],
      }),
    );

    expect(editor["document"]["blocksMap"]).toHaveLength(1);
  });

  test("the editor loads the initialDocument and syncs with the internal hashmap correctly from JSON", () => {
    // Arrange
    const JSON = `
        {
          "id": "root",
          "children": [
            {
              "id": "toggle-list1",
              "parentId": "root",
              "type": "toggle-list",
              "data": { "open": true },
              "children": [
                {
                  "id": "toggle-list2",
                  "parentId": "toggle-list1",
                  "type": "toggle-list",
                  "data": { "open": false },
                  "children": [
                    {
                      "id": "p1",
                      "parentId": "toggle-list2",
                      "type": "toggle-list",
                      "data": { "open": false },
                      "children": []
                    }
                  ]
                },
                {
                  "id": "h2",
                  "parentId": "toggle-list1",
                  "type": "heading",
                  "data": {
                    "text": "Block 3",
                    "level": 2
                  }
                }
              ]
            }
          ]
        }
        `;

    const { editor } = createEditor({
      initialDocument: JSON,
    });

    // Assert
    expect(editor.getBlock("toggle-list1")).toBe(editor.getRoot().children[0]);
    expect(editor.getBlock("toggle-list2")).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );
    expect(editor.getBlock("p1")).toBe(
      editor.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(editor.getBlock("h2")).toBe(editor.getRoot().children[0]?.children?.[1]);

    expect(editor.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: editor.ROOT_ID,
        children: [
          expect.objectContaining({
            id: "toggle-list1",
            parentId: "root",
            type: "toggle-list",
            data: { open: true },
            children: [
              expect.objectContaining({
                id: "toggle-list2",
                parentId: "toggle-list1",
                type: "toggle-list",
                data: { open: false },
                children: [
                  expect.objectContaining({
                    id: "p1",
                    parentId: "toggle-list2",
                    type: "toggle-list",
                    data: { open: false },
                    children: [],
                  }),
                ],
              }),

              expect.objectContaining({
                id: "h2",
                parentId: "toggle-list1",
                type: "heading",
                data: {
                  text: "Block 3",
                  level: 2,
                },
              }),
            ],
          }),
        ],
      }),
    );

    assertTreeIntegrity(editor["document"]);
  });

  test("the editor loads the initialDocument and syncs with the internal hashmap correctly from a DocumentRoot object", () => {
    // Arrange
    const ROOT_ID = "root";
    const documentRoot = new DocumentRoot(ROOT_ID, [
      {
        ...TOGGLE_LIST1_BLOCK,
        parentId: ROOT_ID,
        children: [{ ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST1_BLOCK.id }],
      },
      { ...SAMPLE_BLOCK2, parentId: ROOT_ID },
    ]);

    const { editor } = createEditor({
      initialDocument: documentRoot,
    });

    // Assert
    expect(editor.getRoot()).toStrictEqual(documentRoot);
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toBe(editor.getRoot().children[1]);

    assertTreeIntegrity(editor["document"]);
  });

  test("the editor loads the initialDocument and syncs with the internal hashmap correctly from another EditorDocument object", () => {
    // Arrange
    const editorDocument = new EditorDocument();
    editorDocument.appendChild(editorDocument.ROOT_ID, TOGGLE_LIST1_BLOCK);
    editorDocument.appendChild(TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK);
    editorDocument.appendChild(TOGGLE_LIST2_BLOCK.id, TOGGLE_LIST3_BLOCK);
    editorDocument.appendChild(TOGGLE_LIST3_BLOCK.id, TOGGLE_LIST4_BLOCK);

    const { editor } = createEditor({
      initialDocument: editorDocument,
    });

    // Assert
    expect(editor.getRoot()).toStrictEqual(editorDocument.getRoot());
    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      editor.getRoot().children[0],
    );

    expect(editor.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      editor.getRoot().children[0]?.children?.[0],
    );

    expect(editor.getBlock(TOGGLE_LIST3_BLOCK.id)).toBe(
      editor.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(editor.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      editor.getRoot().children[0]?.children?.[0]?.children?.[0]?.children?.[0],
    );

    assertTreeIntegrity(editor["document"]);
  });

  test("whole update flow with different strategies", () => {
    // Arrange - Create editor with max 3 levels of nested children
    const initialDocument = createTestDocument([
      ["root", TOGGLE_LIST1_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
      [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
    ]);

    const editor = new Editor({ initialDocument });
    const INITIAL_DOCUMENT_JSON = editor.getDocumentJSON();

    const updateBlockEventCallback = vi.fn();
    const insertBlockEventCallback = vi.fn();

    editor.subscribe("block:update", updateBlockEventCallback);
    editor.subscribe("block:insert", insertBlockEventCallback);

    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    editor.subscribe("editor:persist", onPersist);
    editor.on("editor:change").subscribe(onEditorChange);

    // Assert - Initial state before any action
    expect(updateBlockEventCallback).not.toHaveBeenCalled();
    expect(insertBlockEventCallback).not.toHaveBeenCalled();

    expect(onPersist).not.toHaveBeenCalled();
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(editor.getRoot()).toEqual({
      id: editor.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: editor.ROOT_ID,
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST1_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    expect(editor.getHistory()).toEqual([INITIAL_DOCUMENT_JSON]);
    expect(editor.getCurrentHistoryRecord()).toBe(INITIAL_DOCUMENT_JSON);
    expect(editor.getCurrentPositionInHistory()).toBe(0);
    expect(editor.getHistory()).toHaveLength(1);

    assertTreeIntegrity(editor["document"]);

    // Act 1 - Update with "preserve" strategy
    editor.dispatchAction(
      updateBlock({
        blockId: TOGGLE_LIST1_BLOCK.id,
        newBlock: TOGGLE_LIST4_BLOCK,
        childrenStrategy: "preserve",
      }),
    );

    const DOCUMENT_JSON_AFTER_PRESERVE = editor.getDocumentJSON();

    // Assert - State after preserve action
    expect(editor.getRoot()).toEqual({
      id: editor.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: editor.ROOT_ID,
          children: [
            {
              ...TOGGLE_LIST2_BLOCK,
              parentId: TOGGLE_LIST4_BLOCK.id,
              children: [{ ...SAMPLE_BLOCK3, parentId: TOGGLE_LIST2_BLOCK.id }],
            },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(1, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_PRESERVE,
      history: editor.getHistory(),
      currentPositionInHistory: 1,
      root: editor.getRoot(),
      triggerAction: "block:update",
    });

    expect(onPersist).toHaveBeenNthCalledWith(1, {
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_PRESERVE,
      history: editor.getHistory(),
      triggerAction: "block:update",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(1, {
      type: "block:update",
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: TOGGLE_LIST4_BLOCK,
      childrenStrategy: "preserve",
    });

    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_PRESERVE);
    expect(editor.getCurrentPositionInHistory()).toBe(1);
    expect(editor.getHistory()).toHaveLength(2);

    expect(editor.getBlock(TOGGLE_LIST1_BLOCK.id)).toBeNull();
    expect(editor.getBlock(TOGGLE_LIST4_BLOCK.id)).toBe(
      editor.getRoot().children.at(0),
    );

    expect(editor.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(0),
    );

    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(0)?.children?.at(0),
    );

    assertTreeIntegrity(editor["document"]);

    // Act 2 - Update with "drop" strategy
    editor.dispatchAction(
      updateBlock({
        blockId: TOGGLE_LIST2_BLOCK.id,
        newBlock: SAMPLE_BLOCK4,
        childrenStrategy: "drop",
      }),
    );

    const DOCUMENT_JSON_AFTER_DROP = editor.getDocumentJSON();

    // Assert - State after drop action
    expect(editor.getRoot()).toEqual({
      id: editor.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: editor.ROOT_ID,
          children: [{ ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST4_BLOCK.id }],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(2, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_DROP,
      history: editor.getHistory(),
      currentPositionInHistory: 2,
      root: editor.getRoot(),
      triggerAction: "block:update",
    });

    expect(onPersist).toHaveBeenNthCalledWith(2, {
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_DROP,
      history: editor.getHistory(),
      triggerAction: "block:update",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(2, {
      type: "block:update",
      blockId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK4,
      childrenStrategy: "drop",
    });

    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_DROP);
    expect(editor.getCurrentPositionInHistory()).toBe(2);
    expect(editor.getHistory()).toHaveLength(3);

    expect(editor.getBlock(TOGGLE_LIST2_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK3.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(0),
    );

    assertTreeIntegrity(editor["document"]);

    // Act - Insert block with append strategy (non-update action between 2nd and 3rd update)
    editor.dispatchAction(
      insertBlock({
        targetId: TOGGLE_LIST4_BLOCK.id,
        newBlock: SAMPLE_BLOCK5,
        strategy: "append",
      }),
    );

    const DOCUMENT_JSON_AFTER_APPEND = editor.getDocumentJSON();

    // Assert - State after append action
    expect(editor.getRoot()).toEqual({
      id: editor.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: editor.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST4_BLOCK.id },
            { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST4_BLOCK.id },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(3, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_APPEND,
      history: editor.getHistory(),
      currentPositionInHistory: 3,
      root: editor.getRoot(),
      triggerAction: "block:insert",
    });

    expect(onPersist).toHaveBeenNthCalledWith(3, {
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_APPEND,
      history: editor.getHistory(),
      triggerAction: "block:insert",
    });

    expect(insertBlockEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK5.id,
      targetId: TOGGLE_LIST4_BLOCK.id,
      strategy: "append",
    });

    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
      DOCUMENT_JSON_AFTER_APPEND,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_APPEND);
    expect(editor.getCurrentPositionInHistory()).toBe(3);
    expect(editor.getHistory()).toHaveLength(4);

    expect(editor.getBlock(SAMPLE_BLOCK5.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(editor["document"]);

    // Act 3 - Update with "replace" strategy
    editor.dispatchAction(
      updateBlock({
        blockId: TOGGLE_LIST4_BLOCK.id,
        newBlock: {
          ...TOGGLE_LIST5_BLOCK,
          children: [SAMPLE_BLOCK6, SAMPLE_BLOCK9],
        },
        childrenStrategy: "replace",
      }),
    );

    const DOCUMENT_JSON_AFTER_REPLACE = editor.getDocumentJSON();

    // Assert - State after replace action
    expect(editor.getRoot()).toEqual({
      id: editor.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST5_BLOCK,
          parentId: editor.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK6, parentId: TOGGLE_LIST5_BLOCK.id },
            { ...SAMPLE_BLOCK9, parentId: TOGGLE_LIST5_BLOCK.id },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(4, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_REPLACE,
      history: editor.getHistory(),
      currentPositionInHistory: 4,
      root: editor.getRoot(),
      triggerAction: "block:update",
    });

    expect(onPersist).toHaveBeenNthCalledWith(4, {
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_REPLACE,
      history: editor.getHistory(),
      triggerAction: "block:update",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(3, {
      type: "block:update",
      blockId: TOGGLE_LIST4_BLOCK.id,
      newBlock: {
        ...TOGGLE_LIST5_BLOCK,
        children: [SAMPLE_BLOCK6, SAMPLE_BLOCK9],
      },
      childrenStrategy: "replace",
    });

    expect(editor.getHistory()).toEqual([
      INITIAL_DOCUMENT_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
      DOCUMENT_JSON_AFTER_APPEND,
      DOCUMENT_JSON_AFTER_REPLACE,
    ]);

    expect(editor.getCurrentHistoryRecord()).toBe(DOCUMENT_JSON_AFTER_REPLACE);
    expect(editor.getCurrentPositionInHistory()).toBe(4);
    expect(editor.getHistory()).toHaveLength(5);

    expect(editor.getBlock(TOGGLE_LIST4_BLOCK.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK4.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK5.id)).toBeNull();
    expect(editor.getBlock(TOGGLE_LIST5_BLOCK.id)).toBe(
      editor.getRoot().children.at(0),
    );

    expect(editor.getBlock(SAMPLE_BLOCK6.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(0),
    );

    expect(editor.getBlock(SAMPLE_BLOCK9.id)).toBe(
      editor.getRoot().children.at(0)?.children?.at(1),
    );

    assertTreeIntegrity(editor["document"]);
  });
});

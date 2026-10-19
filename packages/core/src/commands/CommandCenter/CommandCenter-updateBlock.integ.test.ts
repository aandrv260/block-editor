import { EditorDocument } from "../../document/EditorDocument";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK9,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
} from "../../document/utils/document-test.utils";
import { createCommandCenter } from "./CommandCenter-test.utils";

describe("CommandCenter update block", () => {
  it("executes the update block command based on the update block payload when dropping the children", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
      ]);

    const updateBlockEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:update", updateBlockEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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

    // Act
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK4,
      childrenStrategy: "drop",
    });

    // Assert
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: SAMPLE_BLOCK4.id,
              }),
            ],
          }),
        ],
      }),
    );

    expect(updateBlockEventCallback).toHaveBeenCalledWith({
      type: "block:update",
      blockId: TOGGLE_LIST2_BLOCK.id,
      newBlock: document.getBlock(SAMPLE_BLOCK4.id),
      childrenStrategy: "drop",
    });

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
  });

  it("executes the update block command based on the update block payload when preserving the children", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
      ]);

    const updateBlockEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:update", updateBlockEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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

    // Act
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: TOGGLE_LIST4_BLOCK,
      childrenStrategy: "preserve",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: document.ROOT_ID,
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

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(onEditorChange).toHaveBeenCalledWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    const CURRENT_DOCUMENT_JSON = document.toJSON();

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      CURRENT_DOCUMENT_JSON,
    ]);

    expect(history.getCurrent()).toBe(CURRENT_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("executes the update block command based on the update block payload when replacing the children", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
      ]);

    const updateBlockEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:update", updateBlockEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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

    // Act
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: {
        ...TOGGLE_LIST4_BLOCK,
        children: [SAMPLE_BLOCK4, SAMPLE_BLOCK5],
      },
      childrenStrategy: "replace",
    });

    // Assert
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            { ...SAMPLE_BLOCK4, parentId: TOGGLE_LIST4_BLOCK.id },
            { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST4_BLOCK.id },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(updateBlockEventCallback).toHaveBeenCalledWith({
      type: "block:update",
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: document.getBlock(TOGGLE_LIST4_BLOCK.id),
      childrenStrategy: "replace",
    });

    const CURRENT_DOCUMENT_JSON = document.toJSON();

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      CURRENT_DOCUMENT_JSON,
    ]);

    expect(history.getCurrent()).toBe(CURRENT_DOCUMENT_JSON);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);

    assertTreeIntegrity(document);
  });

  test("whole update flow with different strategies", () => {
    // Arrange - Create document with max 3 levels of nested children
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", TOGGLE_LIST1_BLOCK],
        [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
        [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
      ]);

    const updateBlockEventCallback = vi.fn();
    const insertBlockEventCallback = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:update", updateBlockEventCallback);
    eventBus.on("block:insert", insertBlockEventCallback);
    eventBus.on("editor:change", onEditorChange);

    // Assert - Initial state before any command
    expect(onEditorChange).not.toHaveBeenCalled();

    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST1_BLOCK,
          parentId: document.ROOT_ID,
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

    expect(history.getHistory()).toEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_HISTORY_DOC_JSON);
    expect(history.getCurrentPosition()).toBe(0);
    expect(history.getSize()).toBe(1);

    // Act 1 - Update with "preserve" strategy
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: TOGGLE_LIST4_BLOCK,
      childrenStrategy: "preserve",
    });

    const DOCUMENT_JSON_AFTER_PRESERVE = document.toJSON();

    // Assert - State after preserve command
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: document.ROOT_ID,
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
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(1, {
      type: "block:update",
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: document.getBlock(TOGGLE_LIST4_BLOCK.id),
      childrenStrategy: "preserve",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
    ]);
    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_PRESERVE);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);

    assertTreeIntegrity(document);

    // Act 2 - Update with "drop" strategy
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST2_BLOCK.id,
      newBlock: SAMPLE_BLOCK4,
      childrenStrategy: "drop",
    });

    const DOCUMENT_JSON_AFTER_DROP = document.toJSON();

    // Assert - State after drop command
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            {
              ...SAMPLE_BLOCK4,
              parentId: TOGGLE_LIST4_BLOCK.id,
            },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(2, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_DROP,
      history: history.getHistory(),
      currentPositionInHistory: 2,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(2, {
      type: "block:update",
      blockId: TOGGLE_LIST2_BLOCK.id,
      newBlock: document.getBlock(SAMPLE_BLOCK4.id),
      childrenStrategy: "drop",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
    ]);
    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_DROP);
    expect(history.getCurrentPosition()).toBe(2);
    expect(history.getSize()).toBe(3);

    assertTreeIntegrity(document);

    // Act - Insert block with append strategy (non-update command between 2nd and 3rd update)
    commandCenter.execute("insertBlock", {
      targetId: TOGGLE_LIST4_BLOCK.id,
      newBlock: SAMPLE_BLOCK5,
      strategy: "append",
    });

    const DOCUMENT_JSON_AFTER_APPEND = document.toJSON();

    // Assert - State after append command
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST4_BLOCK,
          parentId: document.ROOT_ID,
          children: [
            {
              ...SAMPLE_BLOCK4,
              parentId: TOGGLE_LIST4_BLOCK.id,
            },
            { ...SAMPLE_BLOCK5, parentId: TOGGLE_LIST4_BLOCK.id },
          ],
        },
      ],
    });

    expect(onEditorChange).toHaveBeenNthCalledWith(3, {
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_APPEND,
      history: history.getHistory(),
      currentPositionInHistory: 3,
      root: document.getRoot(),
      trigger: "insertBlock",
    });

    expect(insertBlockEventCallback).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK5.id,
      targetId: TOGGLE_LIST4_BLOCK.id,
      strategy: "append",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
      DOCUMENT_JSON_AFTER_APPEND,
    ]);
    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_APPEND);
    expect(history.getCurrentPosition()).toBe(3);
    expect(history.getSize()).toBe(4);

    assertTreeIntegrity(document);

    // Act 3 - Update with "replace" strategy
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST4_BLOCK.id,
      newBlock: {
        ...TOGGLE_LIST5_BLOCK,
        children: [SAMPLE_BLOCK6, SAMPLE_BLOCK9],
      },
      childrenStrategy: "replace",
    });

    const DOCUMENT_JSON_AFTER_REPLACE = document.toJSON();

    // Assert - State after replace command
    expect(document.getRoot()).toEqual({
      id: document.ROOT_ID,
      children: [
        {
          ...TOGGLE_LIST5_BLOCK,
          parentId: document.ROOT_ID,
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
      history: history.getHistory(),
      currentPositionInHistory: 4,
      root: document.getRoot(),
      trigger: "updateBlock",
    });

    expect(updateBlockEventCallback).toHaveBeenNthCalledWith(3, {
      type: "block:update",
      blockId: TOGGLE_LIST4_BLOCK.id,
      newBlock: document.getBlock(TOGGLE_LIST5_BLOCK.id),
      childrenStrategy: "replace",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_JSON_AFTER_PRESERVE,
      DOCUMENT_JSON_AFTER_DROP,
      DOCUMENT_JSON_AFTER_APPEND,
      DOCUMENT_JSON_AFTER_REPLACE,
    ]);
    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_REPLACE);
    expect(history.getCurrentPosition()).toBe(4);
    expect(history.getSize()).toBe(5);

    assertTreeIntegrity(document);
  });

  it("emits the block as it was saved, with tidy content and the kept children", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter();
    const onUpdate = vi.fn();

    eventBus.on("block:update", onUpdate);

    // Act
    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: {
        ...TOGGLE_LIST1_BLOCK,
        data: {
          open: true,
          content: [
            { text: "Ti", marks: [] },
            { text: "", marks: [{ type: "bold" }] },
            { text: "tle", marks: [] },
          ],
        },
      },
      childrenStrategy: "preserve",
    });

    // Assert
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
      type: "block:update",
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: {
        ...TOGGLE_LIST1_BLOCK,
        parentId: document.ROOT_ID,
        data: { open: true, content: [{ text: "Title", marks: [] }] },
        children: [
          { ...TOGGLE_LIST2_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
        ],
      },
      childrenStrategy: "preserve",
    });
  });

  it("emits a copy of the saved block that later commands do not change", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter();
    const onUpdate = vi.fn();

    eventBus.on("block:update", onUpdate);

    commandCenter.execute("updateBlock", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      newBlock: TOGGLE_LIST1_BLOCK,
      childrenStrategy: "preserve",
    });

    const emittedBlock = onUpdate.mock.calls[0][0].newBlock;
    const savedBlockAtUpdate = structuredClone(
      document.getBlock(TOGGLE_LIST1_BLOCK.id),
    );

    // Act
    commandCenter.execute("insertBlock", {
      targetId: TOGGLE_LIST1_BLOCK.id,
      strategy: "append",
      newBlock: SAMPLE_BLOCK3,
    });

    // Assert
    expect(emittedBlock).not.toBe(document.getBlock(TOGGLE_LIST1_BLOCK.id));
    expect(emittedBlock).toStrictEqual(savedBlockAtUpdate);
  });
});

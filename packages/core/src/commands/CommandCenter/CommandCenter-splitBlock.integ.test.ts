import { EditorDocument } from "../../document/EditorDocument";
import { BlockAlreadyExistsError } from "../../document/errors/common";
import type { BlockPayload } from "../../document/models/document-payload.models";
import {
  assertTreeIntegrity,
  BULLET_LIST_ITEM1_BLOCK,
  BULLET_LIST_ITEM2_BLOCK,
  MARKED_TEXT_BLOCK,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  TOGGLE_LIST1_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockToEditNotFoundError } from "../errors/edit-text/BlockToEditNotFoundError";
import { InvalidTextRangeError } from "../errors/edit-text/InvalidTextRangeError";
import { createCommandCenter } from "./CommandCenter-test.utils";

const TOGGLE_WITH_TITLE_BLOCK = {
  ...TOGGLE_LIST1_BLOCK,
  data: {
    open: true,
    content: [{ text: "Title", marks: [] }],
  },
} as const satisfies BlockPayload;

const EMPTY_TEXT_BLOCK = {
  id: "empty-text",
  type: "text",
  data: { content: [] },
} as const satisfies BlockPayload;

const CLOSED_TOGGLE_WITH_TITLE_BLOCK = {
  ...TOGGLE_WITH_TITLE_BLOCK,
  data: { ...TOGGLE_WITH_TITLE_BLOCK.data, open: false },
} as const satisfies BlockPayload;

describe("CommandCenter split block", () => {
  it("splits the block at the offset, records one history entry and emits the events in order", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onBlockEvent = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:update", onBlockEvent);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 8,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...MARKED_TEXT_BLOCK,
        parentId: document.ROOT_ID,
        data: {
          content: [
            { text: "Hello ", marks: [] },
            { text: "wo", marks: [{ type: "bold" }] },
          ],
        },
      },
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "text",
        data: {
          content: [{ text: "rld", marks: [{ type: "bold" }] }],
        },
      },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: "new-block",
          targetId: MARKED_TEXT_BLOCK.id,
          strategy: "after",
        },
      ],
      [
        {
          type: "block:update",
          blockId: MARKED_TEXT_BLOCK.id,
          newBlock: document.getBlock(MARKED_TEXT_BLOCK.id),
          childrenStrategy: "preserve",
        },
      ],
    ]);

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "splitBlock",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("turns the part after the offset into a text block when splitting a heading", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", SAMPLE_BLOCK1],
    ]);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: SAMPLE_BLOCK1.id,
      offset: 4,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...SAMPLE_BLOCK1,
        parentId: document.ROOT_ID,
        data: { content: [{ text: "some", marks: [] }], level: 1 },
      },
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "text",
        data: { content: [{ text: "_text", marks: [] }] },
      },
    ]);
  });

  it("inserts an empty block before the block and leaves the block as it is when the offset is at the start", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", SAMPLE_BLOCK1],
    ]);

    const blockBeforeSplit = document.getBlock(SAMPLE_BLOCK1.id);
    const onBlockEvent = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:update", onBlockEvent);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: SAMPLE_BLOCK1.id,
      offset: 0,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "text",
        data: { content: [] },
      },
      { ...SAMPLE_BLOCK1, parentId: document.ROOT_ID },
    ]);

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBe(blockBeforeSplit);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: "new-block",
          targetId: SAMPLE_BLOCK1.id,
          strategy: "before",
        },
      ],
    ]);

    assertTreeIntegrity(document);
  });

  it("inserts an empty block after the block when the offset is at the end", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", SAMPLE_BLOCK1],
    ]);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: SAMPLE_BLOCK1.id,
      offset: 9,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      { ...SAMPLE_BLOCK1, parentId: document.ROOT_ID },
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "text",
        data: { content: [] },
      },
    ]);
  });

  it("puts the split part at the top of the children of an open toggle list", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", TOGGLE_WITH_TITLE_BLOCK],
      [TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK2],
    ]);

    const onInsert = vi.fn();

    eventBus.on("block:insert", onInsert);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: TOGGLE_WITH_TITLE_BLOCK.id,
      offset: 2,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...TOGGLE_WITH_TITLE_BLOCK,
        parentId: document.ROOT_ID,
        data: { open: true, content: [{ text: "Ti", marks: [] }] },
        children: [
          {
            id: "new-block",
            parentId: TOGGLE_WITH_TITLE_BLOCK.id,
            type: "text",
            data: { content: [{ text: "tle", marks: [] }] },
          },
          { ...SAMPLE_BLOCK2, parentId: TOGGLE_WITH_TITLE_BLOCK.id },
        ],
      },
    ]);

    expect(onInsert).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: "new-block",
      targetId: SAMPLE_BLOCK2.id,
      strategy: "before",
    });

    assertTreeIntegrity(document);
  });

  it("puts the split part inside an open toggle list that has no children", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", TOGGLE_WITH_TITLE_BLOCK],
    ]);

    const onInsert = vi.fn();

    eventBus.on("block:insert", onInsert);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: TOGGLE_WITH_TITLE_BLOCK.id,
      offset: 5,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getBlock(TOGGLE_WITH_TITLE_BLOCK.id)?.children).toStrictEqual([
      {
        id: "new-block",
        parentId: TOGGLE_WITH_TITLE_BLOCK.id,
        type: "text",
        data: { content: [] },
      },
    ]);

    expect(onInsert).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: "new-block",
      targetId: TOGGLE_WITH_TITLE_BLOCK.id,
      strategy: "append",
    });

    assertTreeIntegrity(document);
  });

  it("creates a closed toggle list after a closed toggle list and keeps its children with it", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", CLOSED_TOGGLE_WITH_TITLE_BLOCK],
      [CLOSED_TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK2],
    ]);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: CLOSED_TOGGLE_WITH_TITLE_BLOCK.id,
      offset: 2,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...CLOSED_TOGGLE_WITH_TITLE_BLOCK,
        parentId: document.ROOT_ID,
        data: { open: false, content: [{ text: "Ti", marks: [] }] },
        children: [
          { ...SAMPLE_BLOCK2, parentId: CLOSED_TOGGLE_WITH_TITLE_BLOCK.id },
        ],
      },
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "toggle-list",
        data: { open: false, content: [{ text: "tle", marks: [] }] },
        children: [],
      },
    ]);

    assertTreeIntegrity(document);
  });

  it("inserts an empty closed toggle list before a toggle list split at the start of its title", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", TOGGLE_WITH_TITLE_BLOCK],
    ]);

    const onBlockEvent = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:update", onBlockEvent);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: TOGGLE_WITH_TITLE_BLOCK.id,
      offset: 0,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "toggle-list",
        data: { open: false, content: [] },
        children: [],
      },
      { ...TOGGLE_WITH_TITLE_BLOCK, parentId: document.ROOT_ID, children: [] },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: "new-block",
          targetId: TOGGLE_WITH_TITLE_BLOCK.id,
          strategy: "before",
        },
      ],
    ]);
  });

  it("inserts an empty text block after an empty block without updating it", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", EMPTY_TEXT_BLOCK],
    ]);

    const onBlockEvent = vi.fn();

    eventBus.on("block:insert", onBlockEvent);
    eventBus.on("block:update", onBlockEvent);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: EMPTY_TEXT_BLOCK.id,
      offset: 0,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      { ...EMPTY_TEXT_BLOCK, parentId: document.ROOT_ID },
      {
        id: "new-block",
        parentId: document.ROOT_ID,
        type: "text",
        data: { content: [] },
      },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: "new-block",
          targetId: EMPTY_TEXT_BLOCK.id,
          strategy: "after",
        },
      ],
    ]);
  });

  it("creates a bullet list item next to the bullet list item it splits", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", BULLET_LIST_ITEM1_BLOCK],
      [BULLET_LIST_ITEM1_BLOCK.id, BULLET_LIST_ITEM2_BLOCK],
    ]);

    // Act
    commandCenter.execute("splitBlock", {
      blockId: BULLET_LIST_ITEM2_BLOCK.id,
      offset: 2,
      newBlockId: "new-block",
    });

    // Assert
    expect(document.getBlock(BULLET_LIST_ITEM1_BLOCK.id)?.children).toStrictEqual([
      {
        ...BULLET_LIST_ITEM2_BLOCK,
        parentId: BULLET_LIST_ITEM1_BLOCK.id,
        data: { content: [{ text: "Eg", marks: [] }] },
      },
      {
        id: "new-block",
        parentId: BULLET_LIST_ITEM1_BLOCK.id,
        type: "bullet-list-item",
        data: { content: [{ text: "gs", marks: [] }] },
        children: [],
      },
    ]);

    assertTreeIntegrity(document);
  });

  it("brings back the block as it was with one undo", () => {
    // Arrange
    const { document, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    commandCenter.execute("splitBlock", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 8,
      newBlockId: "new-block",
    });

    // Act
    commandCenter.undo();

    // Assert
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it.each([
    [
      "the block does not exist",
      { blockId: "not_existing_block", offset: 0, newBlockId: "new-block" },
      {
        ExpectedErrorClass: BlockToEditNotFoundError,
        expectedCode: "COMMAND:BLOCK_TO_EDIT_NOT_FOUND",
        expectedMessage:
          "The block whose text you're trying to edit does not exist!",
        expectedContext: { blockId: "not_existing_block" },
      },
    ],
    [
      "the offset is after the end of the text",
      { blockId: MARKED_TEXT_BLOCK.id, offset: 12, newBlockId: "new-block" },
      {
        ExpectedErrorClass: InvalidTextRangeError,
        expectedCode: "COMMAND:INVALID_TEXT_RANGE",
        expectedMessage: "The text range does not fit inside the block's text!",
        expectedContext: {
          blockId: MARKED_TEXT_BLOCK.id,
          from: 12,
          to: 12,
          textLength: 11,
        },
      },
    ],
    [
      "the new block ID is already used",
      { blockId: MARKED_TEXT_BLOCK.id, offset: 8, newBlockId: MARKED_TEXT_BLOCK.id },
      {
        ExpectedErrorClass: BlockAlreadyExistsError,
        expectedCode: "DOCUMENT:BLOCK_ALREADY_EXISTS",
        expectedMessage: `Block with ID ${MARKED_TEXT_BLOCK.id} already exists in the document.`,
        expectedContext: { blockId: MARKED_TEXT_BLOCK.id },
      },
    ],
  ] as const)(
    "throws an error and changes nothing when %s",
    (_, payload, expectedError) => {
      // Arrange
      const {
        document,
        history,
        eventBus,
        commandCenter,
        INITIAL_HISTORY_DOC_JSON,
      } = createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

      const onEditorChange = vi.fn();

      eventBus.on("editor:change", onEditorChange);

      // Act and assert
      assertEngineError(
        () => commandCenter.execute("splitBlock", payload),
        expectedError,
      );

      expect(onEditorChange).not.toHaveBeenCalled();
      expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
      expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    },
  );
});

import { EditorDocument } from "../../document/EditorDocument";
import type { BlockPayload } from "../../document/models/document-payload.models";
import {
  assertTreeIntegrity,
  MARKED_TEXT_BLOCK,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  TOGGLE_LIST1_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockToMergeNotFoundError } from "../errors/merge-blocks/BlockToMergeNotFoundError";
import { NoBlockToMergeIntoError } from "../errors/merge-blocks/NoBlockToMergeIntoError";
import { createCommandCenter } from "./CommandCenter-test.utils";

const TOGGLE_WITH_TITLE_BLOCK = {
  ...TOGGLE_LIST1_BLOCK,
  data: {
    open: true,
    content: [{ text: "Title", marks: [] }],
  },
} as const satisfies BlockPayload;

describe("CommandCenter merge blocks", () => {
  it("merges the block into the block before it, records one history entry and emits the events in order", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", SAMPLE_BLOCK1],
        ["root", MARKED_TEXT_BLOCK],
      ]);

    const onBlockEvent = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("block:update", onBlockEvent);
    eventBus.on("block:move", onBlockEvent);
    eventBus.on("block:delete", onBlockEvent);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("mergeBlocks", { blockId: MARKED_TEXT_BLOCK.id });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...SAMPLE_BLOCK1,
        parentId: document.ROOT_ID,
        data: {
          content: [
            { text: "some_textHello ", marks: [] },
            { text: "world", marks: [{ type: "bold" }] },
          ],
          level: 1,
        },
      },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:update",
          blockId: SAMPLE_BLOCK1.id,
          newBlock: document.getBlock(SAMPLE_BLOCK1.id),
          childrenStrategy: "preserve",
        },
      ],
      [{ type: "block:delete", blockId: MARKED_TEXT_BLOCK.id }],
    ]);

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "mergeBlocks",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("moves the children of the merged block right after the block it merges into", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", SAMPLE_BLOCK1],
      ["root", TOGGLE_WITH_TITLE_BLOCK],
      [TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK2],
      [TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK3],
      ["root", MARKED_TEXT_BLOCK],
    ]);

    const onBlockEvent = vi.fn();

    eventBus.on("block:update", onBlockEvent);
    eventBus.on("block:move", onBlockEvent);
    eventBus.on("block:delete", onBlockEvent);

    // Act
    commandCenter.execute("mergeBlocks", { blockId: TOGGLE_WITH_TITLE_BLOCK.id });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...SAMPLE_BLOCK1,
        parentId: document.ROOT_ID,
        data: { content: [{ text: "some_textTitle", marks: [] }], level: 1 },
      },
      { ...SAMPLE_BLOCK2, parentId: document.ROOT_ID },
      { ...SAMPLE_BLOCK3, parentId: document.ROOT_ID },
      { ...MARKED_TEXT_BLOCK, parentId: document.ROOT_ID },
    ]);

    expect(onBlockEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:update",
          blockId: SAMPLE_BLOCK1.id,
          newBlock: document.getBlock(SAMPLE_BLOCK1.id),
          childrenStrategy: "preserve",
        },
      ],
      [
        {
          type: "block:move",
          blockId: SAMPLE_BLOCK2.id,
          targetId: SAMPLE_BLOCK1.id,
          strategy: "after",
        },
      ],
      [
        {
          type: "block:move",
          blockId: SAMPLE_BLOCK3.id,
          targetId: SAMPLE_BLOCK2.id,
          strategy: "after",
        },
      ],
      [{ type: "block:delete", blockId: TOGGLE_WITH_TITLE_BLOCK.id }],
    ]);

    assertTreeIntegrity(document);
  });

  it("keeps the children of the block it merges into", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", TOGGLE_WITH_TITLE_BLOCK],
      [TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK2],
      ["root", SAMPLE_BLOCK3],
    ]);

    // Act
    commandCenter.execute("mergeBlocks", { blockId: SAMPLE_BLOCK3.id });

    // Assert
    expect(document.getRoot().children).toStrictEqual([
      {
        ...TOGGLE_WITH_TITLE_BLOCK,
        parentId: document.ROOT_ID,
        data: { open: true, content: [{ text: "Title134314", marks: [] }] },
        children: [{ ...SAMPLE_BLOCK2, parentId: TOGGLE_WITH_TITLE_BLOCK.id }],
      },
    ]);

    assertTreeIntegrity(document);
  });

  it("brings back both blocks as they were with one undo", () => {
    // Arrange
    const { document, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([
        ["root", SAMPLE_BLOCK1],
        ["root", TOGGLE_WITH_TITLE_BLOCK],
        [TOGGLE_WITH_TITLE_BLOCK.id, SAMPLE_BLOCK2],
      ]);

    commandCenter.execute("mergeBlocks", { blockId: TOGGLE_WITH_TITLE_BLOCK.id });

    // Act
    commandCenter.undo();

    // Assert
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it.each([
    [
      "the block does not exist",
      "not_existing_block",
      {
        ExpectedErrorClass: BlockToMergeNotFoundError,
        expectedCode: "COMMAND:BLOCK_TO_MERGE_NOT_FOUND",
        expectedMessage: "The block you're trying to merge does not exist!",
        expectedContext: { blockId: "not_existing_block" },
      },
    ],
    [
      "there is no block before it",
      SAMPLE_BLOCK1.id,
      {
        ExpectedErrorClass: NoBlockToMergeIntoError,
        expectedCode: "COMMAND:NO_BLOCK_TO_MERGE_INTO",
        expectedMessage:
          "The block you're trying to merge has no block before it to merge into!",
        expectedContext: { blockId: SAMPLE_BLOCK1.id },
      },
    ],
  ] as const)(
    "throws an error and changes nothing when %s",
    (_, blockId, expectedError) => {
      // Arrange
      const {
        document,
        history,
        eventBus,
        commandCenter,
        INITIAL_HISTORY_DOC_JSON,
      } = createCommandCenter([
        ["root", SAMPLE_BLOCK1],
        ["root", MARKED_TEXT_BLOCK],
      ]);

      const onEditorChange = vi.fn();

      eventBus.on("editor:change", onEditorChange);

      // Act and assert
      assertEngineError(
        () => commandCenter.execute("mergeBlocks", { blockId }),
        expectedError,
      );

      expect(onEditorChange).not.toHaveBeenCalled();
      expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
      expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
    },
  );
});

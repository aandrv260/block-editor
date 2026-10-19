import { EditorDocument } from "../../document/EditorDocument";
import {
  assertTreeIntegrity,
  BULLET_LIST1_BLOCK,
  MARKED_TEXT_BLOCK,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockHasNoContentError } from "../errors/edit-text/BlockHasNoContentError";
import { BlockToEditNotFoundError } from "../errors/edit-text/BlockToEditNotFoundError";
import { InvalidTextRangeError } from "../errors/edit-text/InvalidTextRangeError";
import { createCommandCenter } from "./CommandCenter-test.utils";

describe("CommandCenter insert text", () => {
  it("inserts the text with the marks of the text before it, records the history and emits the events", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onInsertText = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("text:insert", onInsertText);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: document.ROOT_ID,
      data: {
        content: [
          { text: "Hello ", marks: [] },
          { text: "world!", marks: [{ type: "bold" }] },
        ],
      },
    });

    expect(onInsertText).toHaveBeenCalledExactlyOnceWith({
      type: "text:insert",
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "insertText",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("keeps the children of a toggle list when inserting text into its title", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: TOGGLE_LIST1_BLOCK.id,
      offset: 0,
      text: "Title",
    });

    // Assert
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toStrictEqual({
      ...TOGGLE_LIST1_BLOCK,
      parentId: document.ROOT_ID,
      data: { open: true, content: [{ text: "Title", marks: [] }] },
      children: [
        { ...TOGGLE_LIST2_BLOCK, parentId: TOGGLE_LIST1_BLOCK.id, children: [] },
      ],
    });

    assertTreeIntegrity(document);
  });

  it("throws an error and changes nothing when the block does not exist", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.execute("insertText", {
          blockId: "not_existing_block",
          offset: 0,
          text: "Hello",
        }),
      {
        ExpectedErrorClass: BlockToEditNotFoundError,
        expectedCode: "COMMAND:BLOCK_TO_EDIT_NOT_FOUND",
        expectedMessage:
          "The block whose text you're trying to edit does not exist!",
        expectedContext: { blockId: "not_existing_block" },
      },
    );

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it("throws an error and changes nothing when the block has no text", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", BULLET_LIST1_BLOCK]]);

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.execute("insertText", {
          blockId: BULLET_LIST1_BLOCK.id,
          offset: 0,
          text: "Hello",
        }),
      {
        ExpectedErrorClass: BlockHasNoContentError,
        expectedCode: "COMMAND:BLOCK_HAS_NO_CONTENT",
        expectedMessage: "The block you're trying to edit has no text!",
        expectedContext: { blockId: BULLET_LIST1_BLOCK.id },
      },
    );

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it.each([
    ["is negative", -1],
    ["is after the end of the text", 12],
    ["is not a whole number", 1.5],
  ])("throws an error and changes nothing when the offset %s", (_, offset) => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.execute("insertText", {
          blockId: MARKED_TEXT_BLOCK.id,
          offset,
          text: "Hello",
        }),
      {
        ExpectedErrorClass: InvalidTextRangeError,
        expectedCode: "COMMAND:INVALID_TEXT_RANGE",
        expectedMessage: "The text range does not fit inside the block's text!",
        expectedContext: {
          blockId: MARKED_TEXT_BLOCK.id,
          from: offset,
          to: offset,
          textLength: 11,
        },
      },
    );

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });
});

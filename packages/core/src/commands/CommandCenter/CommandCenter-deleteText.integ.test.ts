import { EditorDocument } from "../../document/EditorDocument";
import {
  assertTreeIntegrity,
  BULLET_LIST1_BLOCK,
  MARKED_TEXT_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockHasNoContentError } from "../errors/edit-text/BlockHasNoContentError";
import { BlockToEditNotFoundError } from "../errors/edit-text/BlockToEditNotFoundError";
import { InvalidTextRangeError } from "../errors/edit-text/InvalidTextRangeError";
import { createCommandCenter } from "./CommandCenter-test.utils";

describe("CommandCenter delete text", () => {
  it("deletes the text in the range, records the history and emits the events", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onDeleteText = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("text:delete", onDeleteText);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("deleteText", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 3,
      to: 8,
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: document.ROOT_ID,
      data: {
        content: [
          { text: "Hel", marks: [] },
          { text: "rld", marks: [{ type: "bold" }] },
        ],
      },
    });

    expect(onDeleteText).toHaveBeenCalledExactlyOnceWith({
      type: "text:delete",
      blockId: MARKED_TEXT_BLOCK.id,
      from: 3,
      to: 8,
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "deleteText",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("leaves empty content when the whole text is deleted", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", MARKED_TEXT_BLOCK],
    ]);

    // Act
    commandCenter.execute("deleteText", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 11,
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)?.data).toStrictEqual({
      content: [],
    });
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
        commandCenter.execute("deleteText", {
          blockId: "not_existing_block",
          from: 0,
          to: 1,
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
        commandCenter.execute("deleteText", {
          blockId: BULLET_LIST1_BLOCK.id,
          from: 0,
          to: 0,
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
    ["starts before the text", -1, 2],
    ["ends after the text", 0, 12],
    ["ends before it starts", 3, 2],
    ["is not made of whole numbers", 0.5, 2],
  ])("throws an error and changes nothing when the range %s", (_, from, to) => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.execute("deleteText", {
          blockId: MARKED_TEXT_BLOCK.id,
          from,
          to,
        }),
      {
        ExpectedErrorClass: InvalidTextRangeError,
        expectedCode: "COMMAND:INVALID_TEXT_RANGE",
        expectedMessage: "The text range does not fit inside the block's text!",
        expectedContext: { blockId: MARKED_TEXT_BLOCK.id, from, to, textLength: 11 },
      },
    );

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(history.getHistory()).toStrictEqual([INITIAL_HISTORY_DOC_JSON]);
    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });
});

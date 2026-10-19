import { EditorDocument } from "../../document/EditorDocument";
import {
  assertTreeIntegrity,
  MARKED_TEXT_BLOCK,
} from "../../document/utils/document-test.utils";
import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { BlockToEditNotFoundError } from "../errors/edit-text/BlockToEditNotFoundError";
import { InvalidTextRangeError } from "../errors/edit-text/InvalidTextRangeError";
import { createCommandCenter } from "./CommandCenter-test.utils";

describe("CommandCenter toggle mark", () => {
  it("adds the mark when only part of the range has it, records the history and emits the events", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onAddMark = vi.fn();
    const onRemoveMark = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("mark:add", onAddMark);
    eventBus.on("mark:remove", onRemoveMark);
    eventBus.on("editor:change", onEditorChange);

    // Act
    commandCenter.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 3,
      to: 8,
      mark: { type: "bold" },
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: document.ROOT_ID,
      data: {
        content: [
          { text: "Hel", marks: [] },
          { text: "lo world", marks: [{ type: "bold" }] },
        ],
      },
    });

    expect(onAddMark).toHaveBeenCalledExactlyOnceWith({
      type: "mark:add",
      blockId: MARKED_TEXT_BLOCK.id,
      from: 3,
      to: 8,
      mark: { type: "bold" },
    });

    expect(onRemoveMark).not.toHaveBeenCalled();

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      trigger: "toggleMark",
    });

    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    assertTreeIntegrity(document);
    expect(EditorDocument.fromJSON(document.toJSON())).toStrictEqual(document);
  });

  it("removes the mark when all of the range has it and emits the remove event", () => {
    // Arrange
    const { document, eventBus, commandCenter } = createCommandCenter([
      ["root", MARKED_TEXT_BLOCK],
    ]);

    const onAddMark = vi.fn();
    const onRemoveMark = vi.fn();

    eventBus.on("mark:add", onAddMark);
    eventBus.on("mark:remove", onRemoveMark);

    // Act
    commandCenter.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 6,
      to: 11,
      mark: { type: "bold" },
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)?.data).toStrictEqual({
      content: [{ text: "Hello world", marks: [] }],
    });

    expect(onRemoveMark).toHaveBeenCalledExactlyOnceWith({
      type: "mark:remove",
      blockId: MARKED_TEXT_BLOCK.id,
      from: 6,
      to: 11,
      mark: { type: "bold" },
    });

    expect(onAddMark).not.toHaveBeenCalled();
  });

  it("replaces a link when the text links to a different address", () => {
    // Arrange
    const { document, commandCenter } = createCommandCenter([
      ["root", MARKED_TEXT_BLOCK],
    ]);

    commandCenter.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 5,
      mark: { type: "link", href: "https://first.com" },
    });

    // Act
    commandCenter.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 5,
      mark: { type: "link", href: "https://second.com" },
    });

    // Assert
    expect(document.getBlock(MARKED_TEXT_BLOCK.id)?.data).toStrictEqual({
      content: [
        { text: "Hello", marks: [{ type: "link", href: "https://second.com" }] },
        { text: " ", marks: [] },
        { text: "world", marks: [{ type: "bold" }] },
      ],
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
        commandCenter.execute("toggleMark", {
          blockId: "not_existing_block",
          from: 0,
          to: 1,
          mark: { type: "bold" },
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

  it.each([
    ["starts before the text", -1, 2],
    ["ends after the text", 0, 12],
    ["ends before it starts", 3, 2],
    ["is not made of whole numbers", 0, 2.5],
  ])("throws an error and changes nothing when the range %s", (_, from, to) => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter([["root", MARKED_TEXT_BLOCK]]);

    const onEditorChange = vi.fn();

    eventBus.on("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(
      () =>
        commandCenter.execute("toggleMark", {
          blockId: MARKED_TEXT_BLOCK.id,
          from,
          to,
          mark: { type: "bold" },
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

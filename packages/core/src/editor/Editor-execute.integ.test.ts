import { createEditor } from "./Editor-test.utils";
import { Editor } from "./Editor";
import {
  assertTreeIntegrity,
  MARKED_TEXT_BLOCK,
  SAMPLE_BLOCK1,
} from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { UnknownCommandError } from "@/commands/errors/unknown-command/UnknownCommandError";
import { InvalidBlockError } from "@/document/errors/common";
import { defineExtension } from "@/extensions/defineExtension";
// Simulates a caller without types, such as plain JavaScript, to reach the runtime guard.
const executeWithoutTypes = (editor: Editor, type: string) =>
  (editor as unknown as { execute: (type: string) => void }).execute(type);

const DeleteFirstBlockExtension = defineExtension({
  name: "DeleteFirstBlockExtension",
  commands: ({ createCommand }) => ({
    deleteFirstBlock: createCommand(({ document, createEvent }) => {
      const firstBlockId = document.getRoot().children[0].id;

      document.remove(firstBlockId);

      return createEvent("block:delete", { blockId: firstBlockId });
    }),
  }),
});

const createEditorWithCustomCommand = () =>
  new Editor({ extensions: [DeleteFirstBlockExtension] });

describe("Editor execute", () => {
  it("executes a built-in command, records the history and emits its events", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onInsert = vi.fn();
    const onEditorChange = vi.fn();

    editor.subscribe("block:insert", onInsert);
    editor.subscribe("editor:change", onEditorChange);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBe(editor.getRoot().children[0]);

    expect(onInsert).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.ROOT_ID,
      strategy: "append",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: "insertBlock" }),
    );

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      editor.getDocumentJSON(),
    ]);

    assertTreeIntegrity(editor["document"]);
  });

  it("executes a command without a payload and emits the event it returns", () => {
    // Arrange
    const editor = createEditorWithCustomCommand();
    const onDelete = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.subscribe("block:delete", onDelete);

    // Act
    editor.execute("deleteFirstBlock");

    // Assert
    expect(onDelete).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(editor.getHistory()).toHaveLength(3);
  });

  it("throws an UnknownCommandError and changes nothing when the type is not registered", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onEditorChange = vi.fn();

    editor.subscribe("editor:change", onEditorChange);

    // Act and assert
    assertEngineError(() => executeWithoutTypes(editor, "unknownCommand"), {
      ExpectedErrorClass: UnknownCommandError,
      expectedCode: "COMMAND:UNKNOWN_COMMAND",
      expectedMessage:
        'There is no command registered for the type "unknownCommand"!',
      expectedContext: { type: "unknownCommand" },
    });

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
  });

  it("throws an InvalidBlockError and changes nothing when inserting an invalid block", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const data = {
      content: [{ text: "some_text", marks: [] }],
      color: "red",
    };
    const onInsert = vi.fn();
    const onEditorChange = vi.fn();

    editor.subscribe("block:insert", onInsert);
    editor.subscribe("editor:change", onEditorChange);

    // Act
    const insert = () =>
      editor.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: { id: "node2", type: "text", data },
      });

    // Assert
    expect(insert).toThrowError(InvalidBlockError);
    expect(onInsert).not.toHaveBeenCalled();
    expect(onEditorChange).not.toHaveBeenCalled();
    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
  });

  it("throws an InvalidBlockError and changes nothing when updating a block to an invalid one", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const data = {
      content: [{ text: "some_text", marks: [] }],
      color: "red",
    };
    const onUpdate = vi.fn();
    const onEditorChange = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    const documentJSONBeforeUpdate = editor.getDocumentJSON();

    editor.subscribe("block:update", onUpdate);
    editor.subscribe("editor:change", onEditorChange);

    // Act
    const update = () =>
      editor.execute("updateBlock", {
        blockId: SAMPLE_BLOCK1.id,
        newBlock: { id: SAMPLE_BLOCK1.id, type: "text", data },
        childrenStrategy: "drop",
      });

    // Assert
    expect(update).toThrowError(InvalidBlockError);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onEditorChange).not.toHaveBeenCalled();
    expect(editor.getDocumentJSON()).toBe(documentJSONBeforeUpdate);
    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONBeforeUpdate,
    ]);
  });

  it("does not treat inherited object keys as registered commands", () => {
    // Arrange
    const { editor } = createEditor();

    // Act and assert
    expect(() => executeWithoutTypes(editor, "toString")).toThrowError(
      UnknownCommandError,
    );
  });

  it("inserts text into a block and emits the text insert event", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onInsertText = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: MARKED_TEXT_BLOCK,
    });

    const documentJSONBeforeInsert = editor.getDocumentJSON();

    editor.subscribe("text:insert", onInsertText);

    // Act
    editor.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 6,
      text: "big ",
    });

    // Assert
    expect(editor.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: editor.ROOT_ID,
      data: {
        content: [
          { text: "Hello big ", marks: [] },
          { text: "world", marks: [{ type: "bold" }] },
        ],
      },
    });

    expect(onInsertText).toHaveBeenCalledExactlyOnceWith({
      type: "text:insert",
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 6,
      text: "big ",
    });

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONBeforeInsert,
      editor.getDocumentJSON(),
    ]);
  });

  it("deletes text from a block and emits the text delete event", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onDeleteText = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: MARKED_TEXT_BLOCK,
    });

    const documentJSONBeforeDelete = editor.getDocumentJSON();

    editor.subscribe("text:delete", onDeleteText);

    // Act
    editor.execute("deleteText", { blockId: MARKED_TEXT_BLOCK.id, from: 0, to: 6 });

    // Assert
    expect(editor.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: editor.ROOT_ID,
      data: {
        content: [{ text: "world", marks: [{ type: "bold" }] }],
      },
    });

    expect(onDeleteText).toHaveBeenCalledExactlyOnceWith({
      type: "text:delete",
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 6,
    });

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONBeforeDelete,
      editor.getDocumentJSON(),
    ]);
  });

  it("toggles a mark on the text of a block and emits the mark add event", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onAddMark = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: MARKED_TEXT_BLOCK,
    });

    const documentJSONBeforeToggle = editor.getDocumentJSON();

    editor.subscribe("mark:add", onAddMark);

    // Act
    editor.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 11,
      mark: { type: "italic" },
    });

    // Assert
    expect(editor.getBlock(MARKED_TEXT_BLOCK.id)).toStrictEqual({
      ...MARKED_TEXT_BLOCK,
      parentId: editor.ROOT_ID,
      data: {
        content: [
          { text: "Hello ", marks: [{ type: "italic" }] },
          { text: "world", marks: [{ type: "bold" }, { type: "italic" }] },
        ],
      },
    });

    expect(onAddMark).toHaveBeenCalledExactlyOnceWith({
      type: "mark:add",
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 11,
      mark: { type: "italic" },
    });

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONBeforeToggle,
      editor.getDocumentJSON(),
    ]);
  });

  it("splits a block and emits the insert and update events", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onBlockEvent = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: MARKED_TEXT_BLOCK,
    });

    const documentJSONBeforeSplit = editor.getDocumentJSON();

    editor.subscribe("block:insert", onBlockEvent);
    editor.subscribe("block:update", onBlockEvent);

    // Act
    editor.execute("splitBlock", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 6,
      newBlockId: "new-block",
    });

    // Assert
    expect(editor.getRoot().children).toStrictEqual([
      {
        ...MARKED_TEXT_BLOCK,
        parentId: editor.ROOT_ID,
        data: {
          content: [{ text: "Hello ", marks: [] }],
        },
      },
      {
        id: "new-block",
        parentId: editor.ROOT_ID,
        type: "text",
        data: {
          content: [{ text: "world", marks: [{ type: "bold" }] }],
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
          newBlock: editor.getBlock(MARKED_TEXT_BLOCK.id),
          childrenStrategy: "preserve",
        },
      ],
    ]);

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      documentJSONBeforeSplit,
      editor.getDocumentJSON(),
    ]);
  });

  it("merges a block into the block before it and emits the update and delete events", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onBlockEvent = vi.fn();

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: MARKED_TEXT_BLOCK,
    });

    const documentJSONBeforeMerge = editor.getDocumentJSON();

    editor.subscribe("block:update", onBlockEvent);
    editor.subscribe("block:delete", onBlockEvent);

    // Act
    editor.execute("mergeBlocks", { blockId: MARKED_TEXT_BLOCK.id });

    // Assert
    expect(editor.getRoot().children).toStrictEqual([
      {
        ...SAMPLE_BLOCK1,
        parentId: editor.ROOT_ID,
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
          newBlock: editor.getBlock(SAMPLE_BLOCK1.id),
          childrenStrategy: "preserve",
        },
      ],
      [{ type: "block:delete", blockId: MARKED_TEXT_BLOCK.id }],
    ]);

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      expect.any(String),
      documentJSONBeforeMerge,
      editor.getDocumentJSON(),
    ]);
  });
});

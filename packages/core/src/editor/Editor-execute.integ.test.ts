import { createEditor } from "./Editor-test.utils";
import { Editor } from "./Editor";
import { insertBlock } from "@/actions/actions";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
} from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { UnknownCommandError } from "@/commands/errors/unknown-command/UnknownCommandError";
import type { DefaultCommands } from "@/commands/executors/defaultCommands";
import type {
  CommandArgsMapOf,
  CommandContext,
} from "@/commands/executors/commandExecutors.models";
import { createDeleteBlockEvent } from "@/events/editor-event-bus/editorEvent.emits";
import type { Blocks } from "./editor-schema.models";

const deleteFirstBlockCommand = ({ document }: CommandContext<void>) => {
  const firstBlockId = document.getRoot().children[0].id;

  document.remove(firstBlockId);

  return createDeleteBlockEvent({ blockId: firstBlockId });
};

const CUSTOM_COMMANDS = {
  "test:delete-first-block": deleteFirstBlockCommand,
};

type SchemaWithCustomCommand = {
  commands: CommandArgsMapOf<DefaultCommands & typeof CUSTOM_COMMANDS>;
  blocks: Blocks;
};

// Simulates a caller without types, such as plain JavaScript, to reach the runtime guard.
const executeWithoutTypes = (editor: Editor, type: string) =>
  (editor as unknown as { execute: (type: string) => void }).execute(type);

const createEditorWithCustomCommand = () =>
  new Editor<SchemaWithCustomCommand>({ commands: CUSTOM_COMMANDS });

describe("Editor execute", () => {
  it("executes a built-in command, records the history and emits its events", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onInsert = vi.fn();
    const onEditorChange = vi.fn();

    editor.subscribe("block:insert", onInsert);
    editor.subscribe("editor:change", onEditorChange);

    // Act
    editor.execute("block:insert", {
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
      expect.objectContaining({ triggerAction: "block:insert" }),
    );

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      editor.getDocumentJSON(),
    ]);

    assertTreeIntegrity(editor["document"]);
  });

  it("gives the same result as dispatching the equivalent action", () => {
    // Arrange
    const payload = {
      targetId: "root",
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    } as const;

    const { editor: executingEditor } = createEditor();
    const { editor: dispatchingEditor } = createEditor();

    // Act
    executingEditor.execute("block:insert", payload);
    dispatchingEditor.dispatchAction(insertBlock(payload));

    // Assert
    expect(executingEditor.getDocumentJSON()).toBe(
      dispatchingEditor.getDocumentJSON(),
    );

    expect(executingEditor.getHistory()).toStrictEqual(
      dispatchingEditor.getHistory(),
    );
  });

  it("executes a command without a payload and emits the event it returns", () => {
    // Arrange
    const editor = createEditorWithCustomCommand();
    const onDelete = vi.fn();

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.subscribe("block:delete", onDelete);

    // Act
    editor.execute("test:delete-first-block");

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
    assertEngineError(() => executeWithoutTypes(editor, "test:unknown"), {
      ExpectedErrorClass: UnknownCommandError,
      expectedCode: "COMMAND:UNKNOWN_COMMAND",
      expectedMessage: 'There is no command registered for the type "test:unknown"!',
      expectedContext: { type: "test:unknown" },
    });

    expect(onEditorChange).not.toHaveBeenCalled();
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
  });

  it("does not treat inherited object keys as registered commands", () => {
    // Arrange
    const { editor } = createEditor();

    // Act and assert
    expect(() => executeWithoutTypes(editor, "toString")).toThrowError(
      UnknownCommandError,
    );
  });
});

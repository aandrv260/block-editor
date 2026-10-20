import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
} from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { BlockToDeleteNotFoundError } from "@/commands/errors/delete-block/BlockToDeleteNotFoundError";
import { defineExtension } from "@/extensions/defineExtension";
import { ExtensionLoopError } from "@/extensions/errors/ExtensionLoopError";
import { ExtensionErrorCodes } from "@/extensions/errors/ExtensionErrorCodes";
import { MAX_EXTENSION_DEPTH } from "@/extensions/ExtensionManager/ExtensionManager";
import { AsyncExtensionHookError } from "@/extensions/errors/AsyncExtensionHookError";
import type {
  Extension,
  TransactionHook,
} from "@/extensions/models/extension.models";
import { Editor } from "./Editor";

const createEditorWithExtensions = (extensions: Extension[]) => {
  const editor = new Editor({ extensions });
  const INITIAL_DOCUMENT_JSON = editor.getDocumentJSON();

  return { editor, INITIAL_DOCUMENT_JSON };
};

const GreetNewHeadingsExtension = defineExtension({
  name: "GreetNewHeadingsExtension",
  onAfterCommand: ({ command, execute }) => {
    if (
      command.type === "insertBlock" &&
      command.payload.newBlock.type === "heading"
    ) {
      execute("insertText", {
        blockId: command.payload.newBlock.id,
        offset: 0,
        text: "Hello ",
      });
    }
  },
});

const ASYNC_HOOK_EXTENSIONS = {
  onBeforeCommand: {
    name: "AsyncBeforeCommandExtension",
    onBeforeCommand: (() =>
      Promise.resolve()) as unknown as Extension["onBeforeCommand"],
  },
  onAfterCommand: {
    name: "AsyncAfterCommandExtension",
    onAfterCommand: async () => {},
  },
  onBeforeCommit: {
    name: "AsyncBeforeCommitExtension",
    onBeforeCommit: async () => {},
  },
} satisfies Record<TransactionHook, Extension>;

describe("Editor extension hooks", () => {
  it("runs the command that a before command hook returns instead of the original one", () => {
    // Arrange
    const { editor } = createEditorWithExtensions([
      {
        name: "ReplaceBlockExtension",
        onBeforeCommand: ({ command }) => {
          if (command.type === "insertBlock") {
            return {
              type: "insertBlock",
              payload: { ...command.payload, newBlock: SAMPLE_BLOCK2 },
            };
          }
        },
      },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(editor.getBlock(SAMPLE_BLOCK2.id)).toStrictEqual({
      ...SAMPLE_BLOCK2,
      parentId: editor.ROOT_ID,
    });
  });

  it("rolls back the whole transaction without an error when a before command hook aborts", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      {
        name: "PreventDeletesExtension",
        onBeforeCommand: ({ command, abort }) => {
          if (command.type === "deleteBlock") {
            abort();
          }
        },
      },
    ]);

    const onEditorChange = vi.fn();

    editor.subscribe("editor:change", onEditorChange);

    // Act
    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.execute("deleteBlock", { blockId: SAMPLE_BLOCK1.id });
    });

    // Assert
    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: "rollback" }),
    );
  });

  it("records a command and the follow-up commands of its after command hooks as one history record", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      GreetNewHeadingsExtension,
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toStrictEqual({
      ...SAMPLE_BLOCK1,
      parentId: editor.ROOT_ID,
      data: {
        ...SAMPLE_BLOCK1.data,
        content: [{ text: "Hello some_text", marks: [] }],
      },
    });

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      editor.getDocumentJSON(),
    ]);

    assertTreeIntegrity(editor["document"]);
  });

  it("undoes a command and its follow-up commands with one undo", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      GreetNewHeadingsExtension,
    ]);

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Act
    editor.undo();

    // Assert
    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
  });

  it("runs follow-up commands through the before command hooks again", () => {
    // Arrange
    const seenCommands: string[] = [];

    const { editor } = createEditorWithExtensions([
      {
        name: "RecorderExtension",
        onBeforeCommand: ({ command }) => {
          seenCommands.push(command.type);
        },
      },
      GreetNewHeadingsExtension,
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(seenCommands).toStrictEqual(["insertBlock", "insertText"]);
  });

  it("emits the events of follow-up commands after the events of the command", () => {
    // Arrange
    const { editor } = createEditorWithExtensions([GreetNewHeadingsExtension]);
    const emittedEvents: string[] = [];

    editor.subscribe("block:insert", event => emittedEvents.push(event.type));
    editor.subscribe("text:insert", event => emittedEvents.push(event.type));

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(emittedEvents).toStrictEqual(["block:insert", "text:insert"]);
  });

  it("runs the before commit hooks once per transaction with every event of the transaction", () => {
    // Arrange
    const onBeforeCommit = vi.fn();
    const { editor } = createEditorWithExtensions([
      GreetNewHeadingsExtension,
      { name: "CommitWatcherExtension", onBeforeCommit },
    ]);

    // Act
    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      });
    });

    // Assert
    expect(onBeforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        events: [
          {
            type: "block:insert",
            blockId: SAMPLE_BLOCK1.id,
            targetId: editor.ROOT_ID,
            strategy: "append",
          },
          {
            type: "text:insert",
            blockId: SAMPLE_BLOCK1.id,
            offset: 0,
            text: "Hello ",
          },
          {
            type: "block:insert",
            blockId: SAMPLE_BLOCK2.id,
            targetId: editor.ROOT_ID,
            strategy: "append",
          },
        ],
      }),
    );
  });

  it("gives the before commit hooks every command that ran, including replacements and follow-up commands", () => {
    // Arrange
    const onBeforeCommit = vi.fn();
    const { editor } = createEditorWithExtensions([
      {
        name: "ReplaceBlockExtension",
        onBeforeCommand: ({ command }) => {
          if (
            command.type === "insertBlock" &&
            command.payload.newBlock.id === SAMPLE_BLOCK2.id
          ) {
            return {
              type: "insertBlock",
              payload: { ...command.payload, newBlock: SAMPLE_BLOCK1 },
            };
          }
        },
      },
      GreetNewHeadingsExtension,
      { name: "CommitWatcherExtension", onBeforeCommit },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Assert
    expect(onBeforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        commands: [
          {
            type: "insertBlock",
            payload: {
              targetId: editor.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK1,
            },
            source: { type: "editor" },
          },
          {
            type: "insertText",
            payload: { blockId: SAMPLE_BLOCK1.id, offset: 0, text: "Hello " },
            source: { type: "extension", name: "GreetNewHeadingsExtension" },
          },
        ],
      }),
    );
  });

  it("adds the follow-up commands of a before commit hook to the same history record", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      {
        name: "AppendTrailingBlockExtension",
        onBeforeCommit: ({ document, execute }) => {
          if (!document.getBlock(SAMPLE_BLOCK2.id)) {
            execute("insertBlock", {
              targetId: document.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK2,
            });
          }
        },
      },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getRoot().children.map(block => block.id)).toStrictEqual([
      SAMPLE_BLOCK1.id,
      SAMPLE_BLOCK2.id,
    ]);

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      editor.getDocumentJSON(),
    ]);
  });

  it("gives each before commit hook the follow-up commands of the before commit hooks before it", () => {
    // Arrange
    const onBeforeCommit = vi.fn();
    const { editor } = createEditorWithExtensions([
      {
        name: "AppendSecondBlockExtension",
        onBeforeCommit: ({ document, execute }) => {
          if (!document.getBlock(SAMPLE_BLOCK2.id)) {
            execute("insertBlock", {
              targetId: document.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK2,
            });
          }
        },
      },
      { name: "CommitWatcherExtension", onBeforeCommit },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(onBeforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        commands: [
          {
            type: "insertBlock",
            payload: {
              targetId: editor.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK1,
            },
            source: { type: "editor" },
          },
          {
            type: "insertBlock",
            payload: {
              targetId: editor.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK2,
            },
            source: { type: "extension", name: "AppendSecondBlockExtension" },
          },
        ],
        events: [
          {
            type: "block:insert",
            blockId: SAMPLE_BLOCK1.id,
            targetId: editor.ROOT_ID,
            strategy: "append",
          },
          {
            type: "block:insert",
            blockId: SAMPLE_BLOCK2.id,
            targetId: editor.ROOT_ID,
            strategy: "append",
          },
        ],
      }),
    );
  });

  it("keeps the commands of a before commit hook unchanged while the hook runs follow-up commands", () => {
    // Arrange
    const commandCountsAfterFollowUps: number[] = [];

    const { editor } = createEditorWithExtensions([
      {
        name: "GreetEveryHeadingExtension",
        onBeforeCommit: ({ commands, execute }) => {
          commands.forEach(command => {
            if (command.type === "insertBlock") {
              execute("insertText", {
                blockId: command.payload.newBlock.id,
                offset: 0,
                text: "Hello ",
              });
            }
          });

          commandCountsAfterFollowUps.push(commands.length);
        },
      },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(commandCountsAfterFollowUps).toStrictEqual([1]);
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toStrictEqual({
      ...SAMPLE_BLOCK1,
      parentId: editor.ROOT_ID,
      data: {
        ...SAMPLE_BLOCK1.data,
        content: [{ text: "Hello some_text", marks: [] }],
      },
    });
  });

  it("rolls back the transaction and throws an extension loop error when extensions keep triggering each other", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      {
        name: "EndlessTypingExtension",
        onAfterCommand: ({ execute }) =>
          execute("insertText", { blockId: SAMPLE_BLOCK1.id, offset: 0, text: "a" }),
      },
    ]);

    // Act and assert
    assertEngineError(
      () =>
        editor.execute("insertBlock", {
          targetId: editor.ROOT_ID,
          strategy: "append",
          newBlock: SAMPLE_BLOCK1,
        }),
      {
        ExpectedErrorClass: ExtensionLoopError,
        expectedCode: ExtensionErrorCodes.EXTENSION_LOOP,
        expectedMessage: `Extensions ran follow-up commands more than ${MAX_EXTENSION_DEPTH} levels deep. They probably keep triggering each other!`,
        expectedContext: { maxDepth: MAX_EXTENSION_DEPTH },
      },
    );

    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
  });

  it("rolls back the transaction and rethrows the error when a follow-up command fails", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
      {
        name: "DeleteMissingBlockExtension",
        onAfterCommand: ({ command, execute }) => {
          if (command.type === "insertBlock") {
            execute("deleteBlock", { blockId: "not_existing_block" });
          }
        },
      },
    ]);

    // Act and assert
    expect(() =>
      editor.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      }),
    ).toThrow(BlockToDeleteNotFoundError);

    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
  });

  it("runs the hooks of every extension for the commands of another extension", () => {
    // Arrange
    const seenCommands: string[] = [];

    const DeleteSampleBlockExtension = defineExtension({
      name: "DeleteSampleBlockExtension",
      commands: ({ createCommand }) => ({
        deleteSampleBlock: createCommand(({ document, createEvent }) => {
          document.remove(SAMPLE_BLOCK1.id);

          return createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });
        }),
      }),
    });

    const editor = new Editor({
      extensions: [
        DeleteSampleBlockExtension,
        {
          name: "RecorderExtension",
          onBeforeCommand: ({ command }) => {
            seenCommands.push(command.type);
          },
        },
      ],
    });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Act
    editor.execute("deleteSampleBlock");

    // Assert
    expect(seenCommands).toStrictEqual(["insertBlock", "deleteSampleBlock"]);
  });

  it.each<TransactionHook>(["onBeforeCommand", "onAfterCommand", "onBeforeCommit"])(
    "rolls back the transaction and throws an async extension hook error when the %s hook returns a promise",
    hook => {
      // Arrange
      const extension = ASYNC_HOOK_EXTENSIONS[hook];
      const { editor, INITIAL_DOCUMENT_JSON } = createEditorWithExtensions([
        extension,
      ]);

      // Act and assert
      assertEngineError(
        () =>
          editor.execute("insertBlock", {
            targetId: editor.ROOT_ID,
            strategy: "append",
            newBlock: SAMPLE_BLOCK1,
          }),
        {
          ExpectedErrorClass: AsyncExtensionHookError,
          expectedCode: ExtensionErrorCodes.ASYNC_EXTENSION_HOOK,
          expectedMessage: `The "${hook}" hook of the extension "${extension.name}" must be synchronous and cannot return a promise!`,
          expectedContext: { name: extension.name, hook },
        },
      );

      expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
      expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
    },
  );

  it("does not run the hooks on undo and redo", () => {
    // Arrange
    const onBeforeCommand = vi.fn();
    const onAfterCommand = vi.fn();
    const onBeforeCommit = vi.fn();

    const { editor } = createEditorWithExtensions([
      { name: "WatcherExtension", onBeforeCommand, onAfterCommand, onBeforeCommit },
    ]);

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    vi.clearAllMocks();

    // Act
    editor.undo();
    editor.redo();

    // Assert
    expect(onBeforeCommand).not.toHaveBeenCalled();
    expect(onAfterCommand).not.toHaveBeenCalled();
    expect(onBeforeCommit).not.toHaveBeenCalled();
  });

  it("saves every text edit as its own history record when an after command hook adds a follow-up command", () => {
    // Arrange
    vi.useFakeTimers();

    const { editor } = createEditorWithExtensions([
      {
        name: "MirrorTextExtension",
        onAfterCommand: ({ command, execute }) => {
          if (
            command.type === "insertText" &&
            command.payload.blockId === SAMPLE_BLOCK2.id
          ) {
            execute("insertText", {
              blockId: SAMPLE_BLOCK1.id,
              offset: 0,
              text: command.payload.text,
            });
          }
        },
      },
    ]);

    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK2,
      });
    });

    // Act
    editor.execute("insertText", {
      blockId: SAMPLE_BLOCK2.id,
      offset: 0,
      text: "a",
    });
    vi.advanceTimersByTime(100);
    editor.execute("insertText", {
      blockId: SAMPLE_BLOCK2.id,
      offset: 1,
      text: "b",
    });

    // Assert
    expect(editor.getHistory()).toHaveLength(4);

    vi.useRealTimers();
  });

  it("tells the command hooks whether app code or an extension ran the command", () => {
    // Arrange
    const sources: unknown[] = [];

    const { editor } = createEditorWithExtensions([
      GreetNewHeadingsExtension,
      {
        name: "SourceRecorderExtension",
        onBeforeCommand: ({ command, source }) => {
          sources.push({ hook: "onBeforeCommand", command: command.type, source });
        },
        onAfterCommand: ({ command, source }) => {
          sources.push({ hook: "onAfterCommand", command: command.type, source });
        },
      },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    const followUpSource = {
      type: "extension",
      name: "GreetNewHeadingsExtension",
    };

    expect(sources).toStrictEqual([
      {
        hook: "onBeforeCommand",
        command: "insertBlock",
        source: { type: "editor" },
      },
      { hook: "onBeforeCommand", command: "insertText", source: followUpSource },
      { hook: "onAfterCommand", command: "insertText", source: followUpSource },
      { hook: "onAfterCommand", command: "insertBlock", source: { type: "editor" } },
    ]);
  });

  it("keeps the source of a command that a before command hook replaces", () => {
    // Arrange
    const onBeforeCommit = vi.fn();

    const { editor } = createEditorWithExtensions([
      {
        name: "ReplaceBlockExtension",
        onBeforeCommand: ({ command }) => {
          if (command.type === "insertBlock") {
            return {
              type: "insertBlock",
              payload: { ...command.payload, newBlock: SAMPLE_BLOCK2 },
            };
          }
        },
      },
      { name: "CommitWatcherExtension", onBeforeCommit },
    ]);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(onBeforeCommit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        commands: [
          {
            type: "insertBlock",
            payload: {
              targetId: editor.ROOT_ID,
              strategy: "append",
              newBlock: SAMPLE_BLOCK2,
            },
            source: { type: "editor" },
          },
        ],
      }),
    );
  });
});

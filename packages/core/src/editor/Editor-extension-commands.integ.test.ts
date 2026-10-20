import { SAMPLE_BLOCK1 } from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { defineEvents } from "@/events/editor-event-bus/defineEvents";
import { defineExtension } from "@/extensions/defineExtension";
import { DuplicateCommandError } from "@/extensions/errors/DuplicateCommandError";
import { ExtensionErrorCodes } from "@/extensions/errors/ExtensionErrorCodes";
import type {
  Extension,
  ExtensionCommand,
} from "@/extensions/models/extension.models";
import { Editor } from "./Editor";

const CalloutsExtension = defineExtension({
  name: "CalloutsExtension",
  events: defineEvents<{
    "callout:insert": { blockId: string; color: string };
  }>(),
  commands: ({ createCommand }) => ({
    insertCallout: createCommand<{ id: string; color: string }>(
      ({ payload, document, createEvent }) => {
        document.appendChild(document.ROOT_ID, {
          id: payload.id,
          type: "callout",
          data: { content: [] },
        });

        return createEvent("callout:insert", {
          blockId: payload.id,
          color: payload.color,
        });
      },
    ),
  }),
});

const DeleteSampleBlockExtension = defineExtension({
  name: "DeleteSampleBlockExtension",
  commands: ({ createCommand }) => ({
    deleteSampleBlock: createCommand(({ document, createEvent }) => {
      document.remove(SAMPLE_BLOCK1.id);
      return createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });
    }),
  }),
});

describe("Editor extension commands", () => {
  it("executes the commands of several extensions next to the built-in ones", () => {
    // Arrange
    const editor = new Editor({
      extensions: [CalloutsExtension, DeleteSampleBlockExtension],
    });

    const onCalloutInsert = vi.fn();
    const onBlockDelete = vi.fn();

    editor.subscribe("callout:insert", onCalloutInsert);
    editor.subscribe("block:delete", onBlockDelete);

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Act
    editor.execute("insertCallout", { id: "callout", color: "yellow" });
    editor.execute("deleteSampleBlock");

    // Assert
    expect(onCalloutInsert).toHaveBeenCalledExactlyOnceWith({
      type: "callout:insert",
      blockId: "callout",
      color: "yellow",
    });

    expect(onBlockDelete).toHaveBeenCalledExactlyOnceWith({
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(editor.getRoot().children.map(block => block.id)).toStrictEqual([
      "callout",
    ]);
  });

  it("calls an extension listener for the extension's own custom event", () => {
    // Arrange
    const onCalloutColor = vi.fn();

    const ListenedCalloutsExtension = defineExtension({
      name: "ListenedCalloutsExtension",
      events: defineEvents<{
        "callout:insert": { blockId: string; color: string };
      }>(),
      commands: ({ createCommand }) => ({
        insertCallout: createCommand<{ id: string; color: string }>(
          ({ payload, createEvent }) =>
            createEvent("callout:insert", {
              blockId: payload.id,
              color: payload.color,
            }),
        ),
      }),
      onEditorInit: ({ subscribe }) => {
        subscribe("callout:insert", event => onCalloutColor(event.color));
      },
    });

    const editor = new Editor({ extensions: [ListenedCalloutsExtension] });

    // Act
    editor.execute("insertCallout", { id: "callout", color: "yellow" });

    // Assert
    expect(onCalloutColor).toHaveBeenCalledExactlyOnceWith("yellow");
  });

  it("lets a hook run a command of its own extension as a follow-up command", () => {
    // Arrange
    const AutoCalloutExtension = defineExtension({
      name: "AutoCalloutExtension",
      events: defineEvents<{
        "callout:insert": { blockId: string; color: string };
      }>(),
      commands: ({ createCommand }) => ({
        insertCallout: createCommand<{ id: string; color: string }>(
          ({ payload, document, createEvent }) => {
            document.appendChild(document.ROOT_ID, {
              id: payload.id,
              type: "callout",
              data: { content: [] },
            });

            return createEvent("callout:insert", {
              blockId: payload.id,
              color: payload.color,
            });
          },
        ),
      }),
      onAfterCommand: ({ command, execute }) => {
        if (command.type === "insertBlock") {
          execute("insertCallout", {
            id: `${command.payload.newBlock.id}-callout`,
            color: "blue",
          });
        }
      },
    });

    const editor = new Editor({ extensions: [AutoCalloutExtension] });
    const initialDocumentJSON = editor.getDocumentJSON();

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getRoot().children.map(block => block.id)).toStrictEqual([
      SAMPLE_BLOCK1.id,
      `${SAMPLE_BLOCK1.id}-callout`,
    ]);

    expect(editor.getHistory()).toStrictEqual([
      initialDocumentJSON,
      editor.getDocumentJSON(),
    ]);
  });

  it("replays the commands that a before commit hook received on another editor", () => {
    // Arrange
    const recordedCommands: ExtensionCommand[] = [];

    const sourceEditor = new Editor({
      extensions: [
        {
          name: "CommandRecorderExtension",
          onBeforeCommit: ({ commands }) => {
            recordedCommands.push(...commands);
          },
        },
      ],
    });

    const replayEditor = new Editor();

    sourceEditor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: sourceEditor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.execute("insertText", {
        blockId: SAMPLE_BLOCK1.id,
        offset: 0,
        text: "Hi ",
      });
    });

    // Act
    replayEditor.transaction(tx => {
      recordedCommands.forEach(command =>
        tx.execute(command.type, command.payload as never),
      );
    });

    // Assert
    expect(replayEditor.getDocumentJSON()).toBe(sourceEditor.getDocumentJSON());
  });

  it("throws a duplicate command error when two extensions define the same command", () => {
    // Arrange
    const SecondCalloutsExtension = defineExtension({
      name: "SecondCalloutsExtension",
      commands: ({ createCommand }) => ({
        insertCallout: createCommand(({ createEvent }) =>
          createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
        ),
      }),
    });

    // Act and assert
    assertEngineError(
      () => new Editor({ extensions: [CalloutsExtension, SecondCalloutsExtension] }),
      {
        ExpectedErrorClass: DuplicateCommandError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_COMMAND,
        expectedMessage:
          'The command "insertCallout" of the extension "SecondCalloutsExtension" is already registered!',
        expectedContext: {
          command: "insertCallout",
          extension: "SecondCalloutsExtension",
        },
      },
    );
  });

  it("throws a duplicate command error when an extension reuses a built-in command name", () => {
    // Arrange
    const UntypedInsertBlockExtension = {
      name: "UntypedInsertBlockExtension",
      commands: () => ({ insertBlock: () => [] }),
    } as unknown as Extension;

    // Act and assert
    assertEngineError(
      () => new Editor({ extensions: [UntypedInsertBlockExtension] }),
      {
        ExpectedErrorClass: DuplicateCommandError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_COMMAND,
        expectedMessage:
          'The command "insertBlock" of the extension "UntypedInsertBlockExtension" is already registered!',
        expectedContext: {
          command: "insertBlock",
          extension: "UntypedInsertBlockExtension",
        },
      },
    );
  });
});

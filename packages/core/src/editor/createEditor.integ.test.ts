import { createEditor } from "./createEditor";
import type { CommandBuilder } from "./editor-commands.models";
import { SAMPLE_BLOCK1, SAMPLE_BLOCK2 } from "@/document/utils/document-test.utils";
import { createTestDocument } from "@/commands/executors/utils/commandExecutors-test.utils";
import type { NoCustomEvents } from "@/events/editor-event-bus/editorEvent.models";
import { defineExtension } from "@/extensions/defineExtension";

const createDeleteCommands = ({
  createCommand,
}: CommandBuilder<NoCustomEvents>) => ({
  deleteFirstBlock: createCommand(({ document, createEvent }) => {
    const firstBlockId = document.getRoot().children[0].id;

    document.remove(firstBlockId);

    return createEvent("block:delete", { blockId: firstBlockId });
  }),

  deleteBlockById: createCommand<{ id: string }>(
    ({ payload, document, createEvent }) => {
      document.remove(payload.id);

      return createEvent("block:delete", { blockId: payload.id });
    },
  ),
});

describe("createEditor", () => {
  it("executes the built-in commands when no custom commands are passed", () => {
    // Arrange
    const editor = createEditor();
    const onInsert = vi.fn();

    editor.subscribe("block:insert", onInsert);

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBe(editor.getRoot().children[0]);
    expect(onInsert).toHaveBeenCalledOnce();
  });

  it("starts from the initial document and keeps the history within the limit", () => {
    // Arrange
    const initialDocument = createTestDocument([["root", SAMPLE_BLOCK1]]);

    // Act
    const editor = createEditor({ initialDocument, historyLimit: 1 });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBe(editor.getRoot().children[0]);
    expect(editor.getHistory()).toStrictEqual([editor.getDocumentJSON()]);
  });

  it("executes the custom commands of an extension next to the built-in ones", () => {
    // Arrange
    const DeleteBlocksExtension = defineExtension({
      name: "DeleteBlocksExtension",
      commands: ({ createCommand }) => ({
        deleteFirstBlock: createCommand(({ document, createEvent }) => {
          const firstBlockId = document.getRoot().children[0].id;

          document.remove(firstBlockId);

          return createEvent("block:delete", { blockId: firstBlockId });
        }),

        deleteBlockById: createCommand<{ id: string }>(
          ({ payload, document, createEvent }) => {
            document.remove(payload.id);

            return createEvent("block:delete", { blockId: payload.id });
          },
        ),
      }),
    });

    const editor = createEditor({ extensions: [DeleteBlocksExtension] });
    const onDelete = vi.fn();

    editor.subscribe("block:delete", onDelete);

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Act
    editor.execute("deleteFirstBlock");
    editor.execute("deleteBlockById", { id: SAMPLE_BLOCK2.id });

    // Assert
    expect(onDelete).toHaveBeenNthCalledWith(1, {
      type: "block:delete",
      blockId: SAMPLE_BLOCK1.id,
    });

    expect(onDelete).toHaveBeenNthCalledWith(2, {
      type: "block:delete",
      blockId: SAMPLE_BLOCK2.id,
    });

    expect(editor.getRoot().children).toStrictEqual([]);
    expect(editor.getHistory()).toHaveLength(5);
  });

  it("executes the custom commands of a builder declared apart from its extension", () => {
    // Arrange
    const DeleteCommandsExtension = defineExtension({
      name: "DeleteCommandsExtension",
      commands: createDeleteCommands,
    });

    const editor = createEditor({ extensions: [DeleteCommandsExtension] });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Act
    editor.execute("deleteFirstBlock");
    editor.execute("deleteBlockById", { id: SAMPLE_BLOCK2.id });

    // Assert
    expect(editor.getRoot().children).toStrictEqual([]);
  });
});

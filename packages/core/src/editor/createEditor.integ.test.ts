import { createEditor } from "./createEditor";
import { SAMPLE_BLOCK1, SAMPLE_BLOCK2 } from "@/document/utils/document-test.utils";
import { createTestDocument } from "@/commands/executors/utils/commandExecutors-test.utils";
import type {
  CommandContext,
  Commands,
} from "@/commands/executors/commandExecutors.models";
import { createDeleteBlockEvent } from "@/events/editor-event-bus/editorEvent.emits";

const deleteFirstBlockCommand = ({ document }: CommandContext<void>) => {
  const firstBlockId = document.getRoot().children[0].id;

  document.remove(firstBlockId);

  return createDeleteBlockEvent({ blockId: firstBlockId });
};

const deleteBlockByIdCommand = ({
  payload,
  document,
}: CommandContext<{ id: string }>) => {
  document.remove(payload.id);

  return createDeleteBlockEvent({ blockId: payload.id });
};

describe("createEditor", () => {
  it("executes the built-in commands when no custom commands are passed", () => {
    // Arrange
    const editor = createEditor();
    const onInsert = vi.fn();

    editor.subscribe("block:insert", onInsert);

    // Act
    editor.execute("block:insert", {
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

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Assert
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBe(editor.getRoot().children[0]);
    expect(editor.getHistory()).toStrictEqual([editor.getDocumentJSON()]);
  });

  it("executes the custom commands next to the built-in ones", () => {
    // Arrange
    const editor = createEditor({
      commands: {
        "test:delete-first-block": deleteFirstBlockCommand,
        "test:delete-block-by-id": deleteBlockByIdCommand,
      },
    });

    const onDelete = vi.fn();

    editor.subscribe("block:delete", onDelete);

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Act
    editor.execute("test:delete-first-block");
    editor.execute("test:delete-block-by-id", { id: SAMPLE_BLOCK2.id });

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

  it("executes an inline custom command", () => {
    // Arrange
    const editor = createEditor({
      commands: {
        "test:delete-first-block": ctx => {
          const firstBlockId = ctx.document.getRoot().children[0].id;

          ctx.document.remove(firstBlockId);

          return createDeleteBlockEvent({ blockId: firstBlockId });
        },
      },
    });

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Act
    editor.execute("test:delete-first-block");

    // Assert
    expect(editor.getRoot().children).toStrictEqual([]);
  });

  it("executes the custom commands from an object declared apart from the editor", () => {
    // Arrange
    const commands = {
      "test:delete-first-block": ctx => {
        const firstBlockId = ctx.document.getRoot().children[0].id;

        ctx.document.remove(firstBlockId);

        return createDeleteBlockEvent({ blockId: firstBlockId });
      },
      "test:delete-block-by-id": deleteBlockByIdCommand,
    } satisfies Commands;

    const editor = createEditor({ commands });

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.execute("block:insert", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK2,
    });

    // Act
    editor.execute("test:delete-first-block");
    editor.execute("test:delete-block-by-id", { id: SAMPLE_BLOCK2.id });

    // Assert
    expect(editor.getRoot().children).toStrictEqual([]);
  });
});

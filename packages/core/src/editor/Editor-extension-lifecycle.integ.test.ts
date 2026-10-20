import { SAMPLE_BLOCK1 } from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { DuplicateExtensionError } from "@/extensions/errors/DuplicateExtensionError";
import { NoopExtensionError } from "@/extensions/errors/NoopExtensionError";
import { defineEvents } from "@/events/editor-event-bus/defineEvents";
import { ExtensionErrorCodes } from "@/extensions/errors/ExtensionErrorCodes";
import { defineExtension } from "@/extensions/defineExtension";
import { Editor } from "./Editor";

describe("Editor extension lifecycle", () => {
  it("calls the init hooks in array order with the editor's document when the editor is created", () => {
    // Arrange
    const calls: string[] = [];
    const documentSizes: number[] = [];

    // Act
    new Editor({
      extensions: [
        {
          name: "FirstExtension",
          onEditorInit: ({ document }) => {
            calls.push("first");
            documentSizes.push(document.size);
          },
        },
        { name: "SecondExtension", onEditorInit: () => calls.push("second") },
      ],
    });

    // Assert
    expect(calls).toStrictEqual(["first", "second"]);
    expect(documentSizes).toStrictEqual([1]);
  });

  it("calls the destroy hooks when the editor is cleaned up", () => {
    // Arrange
    const onEditorDestroy = vi.fn();
    const editor = new Editor({
      extensions: [{ name: "FirstExtension", onEditorDestroy }],
    });

    // Act
    editor.cleanup();

    // Assert
    expect(onEditorDestroy).toHaveBeenCalledOnce();
  });

  it("calls the listeners that an init hook subscribed after a command changes the editor", () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const editor = new Editor({
      extensions: [
        {
          name: "FirstExtension",
          onEditorInit: ({ subscribe }) => {
            subscribe("block:insert", onBlockInsert);
          },
        },
      ],
    });

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(onBlockInsert).toHaveBeenCalledExactlyOnceWith({
      type: "block:insert",
      blockId: SAMPLE_BLOCK1.id,
      targetId: editor.ROOT_ID,
      strategy: "append",
    });
  });

  it("stops calling the subscribed listeners after the editor is cleaned up", () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const editor = new Editor({
      extensions: [
        {
          name: "FirstExtension",
          onEditorInit: ({ subscribe }) => {
            subscribe("block:insert", onBlockInsert);
          },
        },
      ],
    });

    editor.cleanup();

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Assert
    expect(onBlockInsert).not.toHaveBeenCalled();
  });

  it("throws a duplicate extension error when two extensions share a name", () => {
    // Act and assert
    assertEngineError(
      () =>
        new Editor({
          extensions: [
            { name: "AutosaveExtension", onEditorInit: () => {} },
            { name: "AutosaveExtension", onEditorDestroy: () => {} },
          ],
        }),
      {
        ExpectedErrorClass: DuplicateExtensionError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_EXTENSION,
        expectedMessage:
          'An extension with the name "AutosaveExtension" is already registered!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("throws a noop extension error when an extension defines only events", () => {
    // Act and assert
    assertEngineError(
      () =>
        new Editor({
          extensions: [
            {
              name: "AutosaveExtension",
              events: defineEvents<{ "autosave:done": { at: number } }>(),
            },
          ],
        }),
      {
        ExpectedErrorClass: NoopExtensionError,
        expectedCode: ExtensionErrorCodes.NOOP_EXTENSION,
        expectedMessage:
          'The extension "AutosaveExtension" defines no hooks and no commands, so it does nothing!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("accepts async init hooks, destroy hooks and listeners", async () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const onEditorDestroy = vi.fn();

    const editor = new Editor({
      extensions: [
        {
          name: "AsyncLifecycleExtension",
          onEditorInit: async ({ subscribe }) => {
            subscribe("block:insert", async event => onBlockInsert(event));
          },
          onEditorDestroy: async () => onEditorDestroy(),
        },
      ],
    });

    // Act
    editor.execute("insertBlock", {
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    editor.cleanup();
    await Promise.resolve();

    // Assert
    expect(onBlockInsert).toHaveBeenCalledOnce();
    expect(onEditorDestroy).toHaveBeenCalledOnce();
  });

  it("keeps the state of a factory extension apart for each editor", () => {
    // Arrange
    const CounterExtension = () => {
      let insertedBlocks = 0;

      return defineExtension({
        name: "CounterExtension",
        onEditorInit: ({ subscribe }) => {
          subscribe("block:insert", () => {
            insertedBlocks++;
          });
        },
        onEditorDestroy: () => counts.push(insertedBlocks),
      });
    };

    const counts: number[] = [];
    const firstEditor = new Editor({ extensions: [CounterExtension()] });
    const secondEditor = new Editor({ extensions: [CounterExtension()] });

    firstEditor.execute("insertBlock", {
      targetId: firstEditor.ROOT_ID,
      strategy: "append",
      newBlock: SAMPLE_BLOCK1,
    });

    // Act
    firstEditor.cleanup();
    secondEditor.cleanup();

    // Assert
    expect(counts).toStrictEqual([1, 0]);
  });

  it("releases what an init hook created when the editor is cleaned up", () => {
    // Arrange
    vi.useFakeTimers();

    const onTick = vi.fn();

    const editor = new Editor({
      extensions: [
        {
          name: "TickerExtension",
          onEditorInit: ({ onCleanup }) => {
            const interval = setInterval(onTick, 100);

            onCleanup(() => clearInterval(interval));
          },
        },
      ],
    });

    vi.advanceTimersByTime(100);

    // Act
    editor.cleanup();
    vi.advanceTimersByTime(300);

    // Assert
    expect(onTick).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });
});

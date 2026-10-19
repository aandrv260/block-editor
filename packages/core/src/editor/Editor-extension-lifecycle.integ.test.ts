import { SAMPLE_BLOCK1 } from "@/document/utils/document-test.utils";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { DuplicateExtensionError } from "@/extensions/errors/DuplicateExtensionError";
import { ExtensionWithoutHooksError } from "@/extensions/errors/ExtensionWithoutHooksError";
import { ExtensionErrorCodes } from "@/extensions/errors/ExtensionErrorCodes";
import { Editor } from "./Editor";

describe("Editor extension lifecycle", () => {
  it("calls the create hooks in array order with the editor's document when the editor is created", () => {
    // Arrange
    const calls: string[] = [];
    const documentSizes: number[] = [];

    // Act
    new Editor({
      extensions: [
        {
          name: "FirstExtension",
          onCreate: ({ document }) => {
            calls.push("first");
            documentSizes.push(document.size);
          },
        },
        { name: "SecondExtension", onCreate: () => calls.push("second") },
      ],
    });

    // Assert
    expect(calls).toStrictEqual(["first", "second"]);
    expect(documentSizes).toStrictEqual([1]);
  });

  it("calls the destroy hooks when the editor is cleaned up", () => {
    // Arrange
    const onDestroy = vi.fn();
    const editor = new Editor({
      extensions: [{ name: "FirstExtension", onDestroy }],
    });

    // Act
    editor.cleanup();

    // Assert
    expect(onDestroy).toHaveBeenCalledOnce();
  });

  it("calls the extension listeners after a command changes the editor", () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const editor = new Editor({
      extensions: [
        { name: "FirstExtension", on: { "block:insert": onBlockInsert } },
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

  it("stops calling the extension listeners after the editor is cleaned up", () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const editor = new Editor({
      extensions: [
        { name: "FirstExtension", on: { "block:insert": onBlockInsert } },
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
            { name: "AutosaveExtension", onCreate: () => {} },
            { name: "AutosaveExtension", onDestroy: () => {} },
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

  it("throws an extension without hooks error when an extension defines no hooks", () => {
    // Act and assert
    assertEngineError(
      () => new Editor({ extensions: [{ name: "AutosaveExtension" }] }),
      {
        ExpectedErrorClass: ExtensionWithoutHooksError,
        expectedCode: ExtensionErrorCodes.EXTENSION_WITHOUT_HOOKS,
        expectedMessage:
          'The extension "AutosaveExtension" does not define any hooks, so it would never run!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("accepts async create hooks, destroy hooks and listeners", async () => {
    // Arrange
    const onBlockInsert = vi.fn();
    const onDestroy = vi.fn();

    const editor = new Editor({
      extensions: [
        {
          name: "AsyncLifecycleExtension",
          onCreate: async () => {},
          onDestroy: async () => onDestroy(),
          on: { "block:insert": async event => onBlockInsert(event) },
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
    expect(onDestroy).toHaveBeenCalledOnce();
  });
});

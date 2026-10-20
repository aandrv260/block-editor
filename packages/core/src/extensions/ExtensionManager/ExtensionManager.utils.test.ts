import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { defineEvents } from "@/events/editor-event-bus/defineEvents";
import { AsyncExtensionHookError } from "../errors/AsyncExtensionHookError";
import { DuplicateCommandError } from "../errors/DuplicateCommandError";
import { DuplicateExtensionError } from "../errors/DuplicateExtensionError";
import { NoopExtensionError } from "../errors/NoopExtensionError";
import { ExtensionErrorCodes } from "../errors/ExtensionErrorCodes";
import { defineExtension } from "../defineExtension";
import type { Extension } from "../models/extension.models";
import {
  ensureHookIsSynchronous,
  ensureNoNoopExtensions,
  ensureUniqueExtensionNames,
  mergeExtensionCommands,
} from "./ExtensionManager.utils";

const deleteBlock = () => ({ type: "block:delete", blockId: "block-1" });

const GreetExtension = defineExtension({
  name: "GreetExtension",
  commands: ({ createCommand }) => ({
    greet: createCommand(({ createEvent }) =>
      createEvent("block:delete", { blockId: "block-1" }),
    ),
  }),
});

const WaveExtension = defineExtension({
  name: "WaveExtension",
  commands: ({ createCommand }) => ({
    wave: createCommand(({ createEvent }) =>
      createEvent("block:delete", { blockId: "block-1" }),
    ),
  }),
});

describe("ensureNoNoopExtensions()", () => {
  it("throws a noop extension error when an extension defines only its name", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureNoNoopExtensions([
          { name: "AnalyticsExtension", onEditorInit: () => {} },
          { name: "AutosaveExtension" },
        ]),
      {
        ExpectedErrorClass: NoopExtensionError,
        expectedCode: ExtensionErrorCodes.NOOP_EXTENSION,
        expectedMessage:
          'The extension "AutosaveExtension" defines no hooks and no commands, so it does nothing!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("throws a noop extension error when an extension defines only events", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureNoNoopExtensions([
          {
            name: "AutosaveExtension",
            events: defineEvents<{ "autosave:done": { at: number } }>(),
          },
        ]),
      {
        ExpectedErrorClass: NoopExtensionError,
        expectedCode: ExtensionErrorCodes.NOOP_EXTENSION,
        expectedMessage:
          'The extension "AutosaveExtension" defines no hooks and no commands, so it does nothing!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("throws a noop extension error for an extension factory that was never called", () => {
    // Arrange
    const AutosaveExtension = () =>
      defineExtension({ name: "AutosaveExtension", onEditorInit: () => {} });

    // Act and assert
    assertEngineError(
      () => ensureNoNoopExtensions([AutosaveExtension as unknown as Extension]),
      {
        ExpectedErrorClass: NoopExtensionError,
        expectedCode: ExtensionErrorCodes.NOOP_EXTENSION,
        expectedMessage:
          'The extension "AutosaveExtension" defines no hooks and no commands, so it does nothing!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("does not throw when every extension defines a hook or a command", () => {
    // Act and assert
    expect(() =>
      ensureNoNoopExtensions([
        { name: "AnalyticsExtension", onEditorInit: () => {} },
        { name: "AutosaveExtension", onEditorDestroy: () => {} },
        GreetExtension,
      ]),
    ).not.toThrow();
  });
});

describe("mergeExtensionCommands()", () => {
  it("returns the built-in commands and the commands of every extension", () => {
    // Act
    const commands = mergeExtensionCommands({ deleteBlock }, [
      GreetExtension,
      WaveExtension,
    ]);

    // Assert
    expect(Object.keys(commands)).toStrictEqual(["deleteBlock", "greet", "wave"]);
    expect(commands.deleteBlock).toBe(deleteBlock);
  });

  it("does not change the built-in commands it receives", () => {
    // Arrange
    const builtInCommands = { deleteBlock };

    // Act
    mergeExtensionCommands(builtInCommands, [GreetExtension]);

    // Assert
    expect(builtInCommands).toStrictEqual({ deleteBlock });
  });

  it("throws a duplicate command error when two extensions define the same command", () => {
    // Arrange
    const SecondGreetExtension = defineExtension({
      name: "SecondGreetExtension",
      commands: ({ createCommand }) => ({
        greet: createCommand(({ createEvent }) =>
          createEvent("block:delete", { blockId: "block-1" }),
        ),
      }),
    });

    // Act and assert
    assertEngineError(
      () =>
        mergeExtensionCommands({ deleteBlock }, [
          GreetExtension,
          SecondGreetExtension,
        ]),
      {
        ExpectedErrorClass: DuplicateCommandError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_COMMAND,
        expectedMessage:
          'The command "greet" of the extension "SecondGreetExtension" is already registered!',
        expectedContext: { command: "greet", extension: "SecondGreetExtension" },
      },
    );
  });

  it("throws a duplicate command error when an extension reuses a built-in command name", () => {
    // Arrange
    const UntypedDeleteBlockExtension = {
      name: "UntypedDeleteBlockExtension",
      commands: () => ({ deleteBlock }),
    } as unknown as Extension;

    // Act and assert
    assertEngineError(
      () => mergeExtensionCommands({ deleteBlock }, [UntypedDeleteBlockExtension]),
      {
        ExpectedErrorClass: DuplicateCommandError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_COMMAND,
        expectedMessage:
          'The command "deleteBlock" of the extension "UntypedDeleteBlockExtension" is already registered!',
        expectedContext: {
          command: "deleteBlock",
          extension: "UntypedDeleteBlockExtension",
        },
      },
    );
  });
});

describe("ensureUniqueExtensionNames()", () => {
  it("throws a duplicate extension error when two extensions share a name", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureUniqueExtensionNames([
          { name: "AutosaveExtension", onEditorInit: () => {} },
          { name: "AutosaveExtension", onEditorDestroy: () => {} },
        ]),
      {
        ExpectedErrorClass: DuplicateExtensionError,
        expectedCode: ExtensionErrorCodes.DUPLICATE_EXTENSION,
        expectedMessage:
          'An extension with the name "AutosaveExtension" is already registered!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("does not throw when every extension has its own name", () => {
    // Act and assert
    expect(() =>
      ensureUniqueExtensionNames([
        { name: "AutosaveExtension", onEditorInit: () => {} },
        { name: "AnalyticsExtension", onEditorInit: () => {} },
      ]),
    ).not.toThrow();
  });
});

describe("ensureHookIsSynchronous()", () => {
  it("throws an async extension hook error when a hook returns a promise", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureHookIsSynchronous(
          Promise.resolve(),
          "AutosaveExtension",
          "onAfterCommand",
        ),
      {
        ExpectedErrorClass: AsyncExtensionHookError,
        expectedCode: ExtensionErrorCodes.ASYNC_EXTENSION_HOOK,
        expectedMessage:
          'The "onAfterCommand" hook of the extension "AutosaveExtension" must be synchronous and cannot return a promise!',
        expectedContext: { name: "AutosaveExtension", hook: "onAfterCommand" },
      },
    );
  });

  it("does not throw when a hook returns nothing or a command", () => {
    // Act and assert
    expect(() =>
      ensureHookIsSynchronous(undefined, "AutosaveExtension", "onBeforeCommand"),
    ).not.toThrow();

    expect(() =>
      ensureHookIsSynchronous(
        { type: "deleteBlock", payload: { blockId: "block-1" } },
        "AutosaveExtension",
        "onBeforeCommand",
      ),
    ).not.toThrow();
  });
});

import { EditorDocument } from "@/document/EditorDocument";
import { createEvent } from "@/events/editor-event-bus/createEvent";
import type { EditorEventBus } from "@/events/editor-event-bus/editorEvent.models";
import { EventBus } from "@/events/event-bus/EventBus";
import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { SAMPLE_BLOCK1, SAMPLE_BLOCK2 } from "@/document/utils/document-test.utils";
import { ExtensionLoopError } from "../errors/ExtensionLoopError";
import { ExtensionErrorCodes } from "../errors/ExtensionErrorCodes";
import type { Extension, ExtensionHookActions } from "../models/extension.models";
import { ExtensionManager, MAX_EXTENSION_DEPTH } from "./ExtensionManager";

const createExtensionManager = (extensions: Extension[] = []) => {
  const document = new EditorDocument();
  const eventBus: EditorEventBus = new EventBus();
  const extensionManager = new ExtensionManager({ extensions, document, eventBus });

  const actions: ExtensionHookActions = {
    document,
    execute: vi.fn(),
    abort: vi.fn<() => never>(),
  };

  return { extensionManager, document, eventBus, actions };
};

const INSERT_BLOCK1_COMMAND = {
  type: "insertBlock",
  payload: { targetId: "root", strategy: "append", newBlock: SAMPLE_BLOCK1 },
} as const;

const INSERT_BLOCK2_COMMAND = {
  type: "insertBlock",
  payload: { targetId: "root", strategy: "append", newBlock: SAMPLE_BLOCK2 },
} as const;

const runNestedLevels = (extensionManager: ExtensionManager, levels: number) => {
  if (levels === 0) {
    return;
  }

  extensionManager.runWithLoopGuard(() =>
    runNestedLevels(extensionManager, levels - 1),
  );
};

describe("ExtensionManager", () => {
  it("passes the command through every before command hook in array order", () => {
    // Arrange
    const calls: string[] = [];

    const { extensionManager, actions } = createExtensionManager([
      {
        name: "FirstExtension",
        beforeCommand: () => {
          calls.push("first");
          return INSERT_BLOCK2_COMMAND;
        },
      },
      {
        name: "SecondExtension",
        beforeCommand: ({ command }) => {
          if (command.type === "insertBlock") {
            calls.push(`second:${command.payload.newBlock.id}`);
          }
        },
      },
    ]);

    // Act
    const command = extensionManager.runBeforeCommand(
      INSERT_BLOCK1_COMMAND,
      actions,
    );

    // Assert
    expect(calls).toStrictEqual(["first", `second:${SAMPLE_BLOCK2.id}`]);
    expect(command).toBe(INSERT_BLOCK2_COMMAND);
  });

  it("keeps the command when no before command hook replaces it", () => {
    // Arrange
    const { extensionManager, actions } = createExtensionManager([
      { name: "FirstExtension", beforeCommand: () => {} },
    ]);

    // Act
    const command = extensionManager.runBeforeCommand(
      INSERT_BLOCK1_COMMAND,
      actions,
    );

    // Assert
    expect(command).toBe(INSERT_BLOCK1_COMMAND);
  });

  it("runs the after command and before commit hooks in array order", () => {
    // Arrange
    const calls: string[] = [];
    const events = [createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id })];

    const { extensionManager, actions } = createExtensionManager([
      {
        name: "FirstExtension",
        afterCommand: () => calls.push("first:afterCommand"),
        beforeCommit: () => calls.push("first:beforeCommit"),
      },
      {
        name: "SecondExtension",
        afterCommand: () => calls.push("second:afterCommand"),
        beforeCommit: () => calls.push("second:beforeCommit"),
      },
    ]);

    // Act
    extensionManager.runAfterCommand(INSERT_BLOCK1_COMMAND, events, actions);
    extensionManager.runBeforeCommit([INSERT_BLOCK1_COMMAND], events, actions);

    // Assert
    expect(calls).toStrictEqual([
      "first:afterCommand",
      "second:afterCommand",
      "first:beforeCommit",
      "second:beforeCommit",
    ]);
  });

  it("allows follow-up commands up to the maximum depth", () => {
    // Arrange
    const { extensionManager } = createExtensionManager();

    // Act and assert
    expect(() =>
      runNestedLevels(extensionManager, MAX_EXTENSION_DEPTH),
    ).not.toThrow();
  });

  it("throws an extension loop error when follow-up commands go deeper than the maximum depth", () => {
    // Arrange
    const { extensionManager } = createExtensionManager();

    // Act and assert
    assertEngineError(
      () => runNestedLevels(extensionManager, MAX_EXTENSION_DEPTH + 1),
      {
        ExpectedErrorClass: ExtensionLoopError,
        expectedCode: ExtensionErrorCodes.EXTENSION_LOOP,
        expectedMessage: `Extensions ran follow-up commands more than ${MAX_EXTENSION_DEPTH} levels deep. They probably keep triggering each other!`,
        expectedContext: { maxDepth: MAX_EXTENSION_DEPTH },
      },
    );
  });

  it("resets the depth after a loop error so later commands can run", () => {
    // Arrange
    const { extensionManager } = createExtensionManager();

    expect(() => runNestedLevels(extensionManager, MAX_EXTENSION_DEPTH + 1)).toThrow(
      ExtensionLoopError,
    );

    // Act and assert
    expect(() =>
      runNestedLevels(extensionManager, MAX_EXTENSION_DEPTH),
    ).not.toThrow();
  });

  it("adds the extension listeners before it calls the create hooks", () => {
    // Arrange
    const calls: string[] = [];

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        on: { "block:delete": () => calls.push("first:listener") },
        onCreate: () => {
          calls.push("first:onCreate");
          eventBus.emit(
            "block:delete",
            createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
          );
        },
      },
      {
        name: "SecondExtension",
        onCreate: () => calls.push("second:onCreate"),
      },
    ]);

    // Act
    extensionManager.init();

    // Assert
    expect(calls).toStrictEqual([
      "first:onCreate",
      "first:listener",
      "second:onCreate",
    ]);
  });

  it("calls the destroy hooks and removes the extension listeners when it is destroyed", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    const onDestroy = vi.fn();

    const { extensionManager, eventBus, document } = createExtensionManager([
      { name: "FirstExtension", on: { "block:delete": onBlockDelete }, onDestroy },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();

    eventBus.emit(
      "block:delete",
      createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
    );

    // Assert
    expect(onDestroy).toHaveBeenCalledExactlyOnceWith({ document });
    expect(onBlockDelete).not.toHaveBeenCalled();
  });

  it("removes the extension listeners only after every destroy hook ran", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    const deleteEvent = createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        on: { "block:delete": onBlockDelete },
        onDestroy: () => eventBus.emit("block:delete", deleteEvent),
      },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();

    // Assert
    expect(onBlockDelete).toHaveBeenCalledExactlyOnceWith(deleteEvent);
  });
});

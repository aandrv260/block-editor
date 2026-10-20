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
    createExecute: () => vi.fn(),
    abort: vi.fn<() => never>(),
  };

  return { extensionManager, document, eventBus, actions };
};

const EDITOR_SOURCE = { type: "editor" } as const;

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
        onBeforeCommand: () => {
          calls.push("first");
          return INSERT_BLOCK2_COMMAND;
        },
      },
      {
        name: "SecondExtension",
        onBeforeCommand: ({ command }) => {
          if (command.type === "insertBlock") {
            calls.push(`second:${command.payload.newBlock.id}`);
          }
        },
      },
    ]);

    // Act
    const command = extensionManager.runBeforeCommand(
      INSERT_BLOCK1_COMMAND,
      EDITOR_SOURCE,
      actions,
    );

    // Assert
    expect(calls).toStrictEqual(["first", `second:${SAMPLE_BLOCK2.id}`]);
    expect(command).toBe(INSERT_BLOCK2_COMMAND);
  });

  it("keeps the command when no before command hook replaces it", () => {
    // Arrange
    const { extensionManager, actions } = createExtensionManager([
      { name: "FirstExtension", onBeforeCommand: () => {} },
    ]);

    // Act
    const command = extensionManager.runBeforeCommand(
      INSERT_BLOCK1_COMMAND,
      EDITOR_SOURCE,
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
        onAfterCommand: () => calls.push("first:onAfterCommand"),
        onBeforeCommit: () => calls.push("first:onBeforeCommit"),
      },
      {
        name: "SecondExtension",
        onAfterCommand: () => calls.push("second:onAfterCommand"),
        onBeforeCommit: () => calls.push("second:onBeforeCommit"),
      },
    ]);

    // Act
    extensionManager.runAfterCommand(
      INSERT_BLOCK1_COMMAND,
      EDITOR_SOURCE,
      events,
      actions,
    );

    extensionManager.runBeforeCommit(
      [{ ...INSERT_BLOCK1_COMMAND, source: EDITOR_SOURCE }],
      events,
      actions,
    );

    // Assert
    expect(calls).toStrictEqual([
      "first:onAfterCommand",
      "second:onAfterCommand",
      "first:onBeforeCommit",
      "second:onBeforeCommit",
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

  it("gives each extension that defines a hook an execute that marks its follow-up commands with the extension", () => {
    // Arrange
    const createExecute = vi.fn(() => vi.fn());
    const events = [createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id })];

    const { extensionManager, actions } = createExtensionManager([
      { name: "FirstExtension", onAfterCommand: () => {}, onBeforeCommit: () => {} },
      { name: "SecondExtension", onAfterCommand: () => {} },
    ]);

    // Act
    extensionManager.runAfterCommand(INSERT_BLOCK1_COMMAND, EDITOR_SOURCE, events, {
      ...actions,
      createExecute,
    });

    extensionManager.runBeforeCommit([], events, { ...actions, createExecute });

    // Assert
    expect(createExecute.mock.calls).toStrictEqual([
      [{ type: "extension", name: "FirstExtension" }],
      [{ type: "extension", name: "SecondExtension" }],
      [{ type: "extension", name: "FirstExtension" }],
    ]);
  });

  it("calls the init hooks in array order with a listener that receives the events", () => {
    // Arrange
    const calls: string[] = [];
    const deleteEvent = createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe }) => {
          calls.push("first:onEditorInit");
          subscribe("block:delete", event =>
            calls.push(`listener:${event.blockId}`),
          );
        },
      },
      {
        name: "SecondExtension",
        onEditorInit: () => calls.push("second:onEditorInit"),
      },
    ]);

    // Act
    extensionManager.init();
    eventBus.emit("block:delete", deleteEvent);

    // Assert
    expect(calls).toStrictEqual([
      "first:onEditorInit",
      "second:onEditorInit",
      `listener:${SAMPLE_BLOCK1.id}`,
    ]);
  });

  it("gives the init hooks the editor's document", () => {
    // Arrange
    const onEditorInit = vi.fn();
    const { extensionManager, document } = createExtensionManager([
      { name: "FirstExtension", onEditorInit },
    ]);

    // Act
    extensionManager.init();

    // Assert
    expect(onEditorInit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ document }),
    );
  });

  it("stops calling a listener after its own unsubscribe function runs", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    let unsubscribe: VoidFunction = () => {};

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe }) => {
          unsubscribe = subscribe("block:delete", onBlockDelete);
        },
      },
    ]);

    extensionManager.init();

    // Act
    unsubscribe();
    eventBus.emit(
      "block:delete",
      createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
    );

    // Assert
    expect(onBlockDelete).not.toHaveBeenCalled();
  });

  it("calls the destroy hooks and removes the subscribed listeners when it is destroyed", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    const onEditorDestroy = vi.fn();

    const { extensionManager, eventBus, document } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe }) => {
          subscribe("block:delete", onBlockDelete);
        },
        onEditorDestroy,
      },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();

    eventBus.emit(
      "block:delete",
      createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
    );

    // Assert
    expect(onEditorDestroy).toHaveBeenCalledExactlyOnceWith({ document });
    expect(onBlockDelete).not.toHaveBeenCalled();
  });

  it("removes the subscribed listeners only after every destroy hook ran", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    const deleteEvent = createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe }) => {
          subscribe("block:delete", onBlockDelete);
        },
        onEditorDestroy: () => eventBus.emit("block:delete", deleteEvent),
      },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();

    // Assert
    expect(onBlockDelete).toHaveBeenCalledExactlyOnceWith(deleteEvent);
  });

  it("ignores a subscription made after it is destroyed", () => {
    // Arrange
    const onBlockDelete = vi.fn();
    let lateSubscribe: (() => void) | undefined;

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe }) => {
          lateSubscribe = () => subscribe("block:delete", onBlockDelete);
        },
      },
    ]);

    extensionManager.init();
    extensionManager.destroy();

    // Act
    lateSubscribe?.();
    eventBus.emit(
      "block:delete",
      createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id }),
    );

    // Assert
    expect(onBlockDelete).not.toHaveBeenCalled();
  });

  it("runs the cleanups in order after the destroy hooks and before removing the listeners", () => {
    // Arrange
    const calls: string[] = [];
    const deleteEvent = createEvent("block:delete", { blockId: SAMPLE_BLOCK1.id });

    const { extensionManager, eventBus } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ subscribe, onCleanup }) => {
          subscribe("block:delete", () => calls.push("listener"));

          onCleanup(() => {
            calls.push("first cleanup");
            eventBus.emit("block:delete", deleteEvent);
          });

          onCleanup(() => calls.push("second cleanup"));
        },
        onEditorDestroy: () => calls.push("onEditorDestroy"),
      },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();

    // Assert
    expect(calls).toStrictEqual([
      "onEditorDestroy",
      "first cleanup",
      "listener",
      "second cleanup",
    ]);
  });

  it("runs each cleanup only once", () => {
    // Arrange
    const cleanup = vi.fn();
    const { extensionManager } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ onCleanup }) => onCleanup(cleanup),
      },
    ]);

    extensionManager.init();

    // Act
    extensionManager.destroy();
    extensionManager.destroy();

    // Assert
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it("runs a cleanup right away when it is registered after it is destroyed", () => {
    // Arrange
    const cleanup = vi.fn();
    let lateOnCleanup: (() => void) | undefined;

    const { extensionManager } = createExtensionManager([
      {
        name: "FirstExtension",
        onEditorInit: ({ onCleanup }) => {
          lateOnCleanup = () => onCleanup(cleanup);
        },
      },
    ]);

    extensionManager.init();
    extensionManager.destroy();

    // Act
    lateOnCleanup?.();

    // Assert
    expect(cleanup).toHaveBeenCalledOnce();
  });
});

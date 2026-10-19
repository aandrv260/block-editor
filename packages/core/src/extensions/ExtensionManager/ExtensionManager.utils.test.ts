import { assertEngineError } from "@/errors/test-utils/error-test.utils";
import { AsyncExtensionHookError } from "../errors/AsyncExtensionHookError";
import { DuplicateExtensionError } from "../errors/DuplicateExtensionError";
import { ExtensionWithoutHooksError } from "../errors/ExtensionWithoutHooksError";
import { ExtensionErrorCodes } from "../errors/ExtensionErrorCodes";
import {
  ensureExtensionsHaveHooks,
  ensureHookIsSynchronous,
  ensureUniqueExtensionNames,
} from "./ExtensionManager.utils";

describe("ensureExtensionsHaveHooks()", () => {
  it("throws an extension without hooks error when an extension defines no hooks", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureExtensionsHaveHooks([
          { name: "AnalyticsExtension", onCreate: () => {} },
          { name: "AutosaveExtension" },
        ]),
      {
        ExpectedErrorClass: ExtensionWithoutHooksError,
        expectedCode: ExtensionErrorCodes.EXTENSION_WITHOUT_HOOKS,
        expectedMessage:
          'The extension "AutosaveExtension" does not define any hooks, so it would never run!',
        expectedContext: { name: "AutosaveExtension" },
      },
    );
  });

  it("does not throw when every extension defines at least one hook", () => {
    // Act and assert
    expect(() =>
      ensureExtensionsHaveHooks([
        { name: "AnalyticsExtension", onCreate: () => {} },
        { name: "AutosaveExtension", on: { "block:insert": () => {} } },
      ]),
    ).not.toThrow();
  });
});

describe("ensureUniqueExtensionNames()", () => {
  it("throws a duplicate extension error when two extensions share a name", () => {
    // Act and assert
    assertEngineError(
      () =>
        ensureUniqueExtensionNames([
          { name: "AutosaveExtension", onCreate: () => {} },
          { name: "AutosaveExtension", onDestroy: () => {} },
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
        { name: "AutosaveExtension", onCreate: () => {} },
        { name: "AnalyticsExtension", onCreate: () => {} },
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
          "afterCommand",
        ),
      {
        ExpectedErrorClass: AsyncExtensionHookError,
        expectedCode: ExtensionErrorCodes.ASYNC_EXTENSION_HOOK,
        expectedMessage:
          'The "afterCommand" hook of the extension "AutosaveExtension" must be synchronous and cannot return a promise!',
        expectedContext: { name: "AutosaveExtension", hook: "afterCommand" },
      },
    );
  });

  it("does not throw when a hook returns nothing or a command", () => {
    // Act and assert
    expect(() =>
      ensureHookIsSynchronous(undefined, "AutosaveExtension", "beforeCommand"),
    ).not.toThrow();

    expect(() =>
      ensureHookIsSynchronous(
        { type: "deleteBlock", payload: { blockId: "block-1" } },
        "AutosaveExtension",
        "beforeCommand",
      ),
    ).not.toThrow();
  });
});

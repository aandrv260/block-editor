import { createEvent } from "./createEvent";
import { isEventOfType } from "./editorEvent.utils";

describe("isEventOfType()", () => {
  it("returns true when the event has the given built-in type", () => {
    // Arrange
    const event = createEvent("text:insert", {
      blockId: "block",
      offset: 0,
      text: "a",
    });

    // Assert
    expect(isEventOfType(event, "text:insert")).toBe(true);
  });

  it.each([
    ["another built-in event", createEvent("block:delete", { blockId: "block" })],
    ["a custom event", { type: "callout:insert", blockId: "callout" }],
  ])("returns false for %s", (_, event) => {
    // Assert
    expect(isEventOfType(event, "text:insert")).toBe(false);
  });
});

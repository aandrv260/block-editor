import { createEvent } from "../../events/editor-event-bus/createEvent";
import type { CommandResult } from "../executors/commandExecutors.models";
import { toCommandEvents } from "./CommandCenter.utils";

describe("toCommandEvents()", () => {
  it("wraps a single event in an array", () => {
    // Arrange
    const event = createEvent("block:delete", { blockId: "block-1" });

    // Assert
    expect(toCommandEvents(event)).toStrictEqual([event]);
  });

  it("returns the same array of events in the same order", () => {
    // Arrange
    const events: CommandResult = [
      createEvent("block:delete", { blockId: "block-1" }),
      createEvent("block:delete", { blockId: "block-2" }),
    ];

    // Assert
    expect(toCommandEvents(events)).toBe(events);
  });
});

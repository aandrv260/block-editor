import { createEvent } from "@/events/editor-event-bus/createEvent";
import type { CommandEvent } from "@/events/editor-event-bus/editorEvent.models";
import type { RecordedChange } from "../models/recorded-change.models";
import { canMergeWithLastChange } from "./HistoryManager.utils";

const createChange = (time: number, ...events: CommandEvent[]): RecordedChange => ({
  events,
  time,
});

const insertText = (offset: number, text: string, blockId = "block") =>
  createEvent("text:insert", { blockId, offset, text });

const deleteText = (from: number, to: number) =>
  createEvent("text:delete", { blockId: "block", from, to });

describe("canMergeWithLastChange()", () => {
  it("merges text inserted right where the last insert stopped", () => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, insertText(2, "ab")),
        createChange(100, insertText(4, "c")),
        500,
      ),
    ).toBe(true);
  });

  it("merges a change that comes exactly when the group delay ends", () => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, insertText(0, "a")),
        createChange(500, insertText(1, "b")),
        500,
      ),
    ).toBe(true);
  });

  it.each([
    ["with backspace", deleteText(4, 5), deleteText(3, 4)],
    ["with forward delete", deleteText(4, 5), deleteText(4, 5)],
  ])("merges text deleted in a row %s", (_, lastEvent, newEvent) => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, lastEvent),
        createChange(100, newEvent),
        500,
      ),
    ).toBe(true);
  });

  it("does not merge when there is no last change", () => {
    // Assert
    expect(
      canMergeWithLastChange(null, createChange(0, insertText(0, "a")), 500),
    ).toBe(false);
  });

  it("does not merge after a pause longer than the group delay", () => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, insertText(0, "a")),
        createChange(501, insertText(1, "b")),
        500,
      ),
    ).toBe(false);
  });

  it.each([
    [
      "the insert does not start where the last one stopped",
      insertText(0, "a"),
      insertText(3, "b"),
    ],
    [
      "the insert is in another block",
      insertText(0, "a"),
      insertText(1, "b", "other-block"),
    ],
    ["the delete is not next to the last one", deleteText(4, 5), deleteText(1, 2)],
    ["an insert follows a delete", deleteText(4, 5), insertText(4, "a")],
    [
      "the change is not a text edit",
      insertText(0, "a"),
      createEvent("block:delete", { blockId: "block" }),
    ],
  ])("does not merge when %s", (_, lastEvent, newEvent) => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, lastEvent),
        createChange(100, newEvent),
        500,
      ),
    ).toBe(false);
  });

  it("does not merge a change that has more than one event", () => {
    // Assert
    expect(
      canMergeWithLastChange(
        createChange(0, insertText(0, "a")),
        createChange(100, insertText(1, "b"), insertText(2, "c")),
        500,
      ),
    ).toBe(false);
  });
});

import { Editor } from "./Editor";
import { defineEvents } from "@/events/editor-event-bus/defineEvents";
import { defineExtension } from "@/extensions/defineExtension";

const CalloutsExtension = defineExtension({
  name: "CalloutsExtension",
  events: defineEvents<{
    "callout:insert": { blockId: string; color: string };
  }>(),

  commands: ({ createCommand }) => ({
    insertCallout: createCommand<{ id: string; color: string }>(
      ({ payload, document, createEvent }) => {
        document.appendChild(document.ROOT_ID, {
          id: payload.id,
          type: "callout",
          data: { content: [] },
        });

        return createEvent("callout:insert", {
          blockId: payload.id,
          color: payload.color,
        });
      },
    ),

    insertCalloutWithBlockEvent: createCommand<{ id: string; color: string }>(
      ({ payload, document, createEvent }) => {
        document.appendChild(document.ROOT_ID, {
          id: payload.id,
          type: "callout",
          data: { content: [] },
        });

        return [
          createEvent("block:insert", {
            blockId: payload.id,
            targetId: document.ROOT_ID,
            strategy: "append",
          }),
          createEvent("callout:insert", {
            blockId: payload.id,
            color: payload.color,
          }),
        ];
      },
    ),
  }),
});

const createCalloutEditor = () => new Editor({ extensions: [CalloutsExtension] });

describe("Editor custom events", () => {
  it("emits the custom event of a custom command to its listener", () => {
    // Arrange
    const editor = createCalloutEditor();
    const onCalloutInsert = vi.fn();

    editor.subscribe("callout:insert", onCalloutInsert);

    // Act
    editor.execute("insertCallout", { id: "callout", color: "yellow" });

    // Assert
    expect(onCalloutInsert).toHaveBeenCalledExactlyOnceWith({
      type: "callout:insert",
      blockId: "callout",
      color: "yellow",
    });

    expect(editor.getBlock("callout")).toStrictEqual({
      id: "callout",
      parentId: editor.ROOT_ID,
      type: "callout",
      data: { content: [] },
    });
  });

  it("streams a custom event through on()", () => {
    // Arrange
    const editor = createCalloutEditor();
    const onColor = vi.fn();

    editor
      .on("callout:insert")
      .map(event => event.color)
      .subscribe(onColor);

    // Act
    editor.execute("insertCallout", { id: "callout", color: "yellow" });

    // Assert
    expect(onColor).toHaveBeenCalledExactlyOnceWith("yellow");
  });

  it("stops calling the listener of a custom event after it unsubscribes", () => {
    // Arrange
    const editor = createCalloutEditor();
    const onCalloutInsert = vi.fn();

    editor.subscribe("callout:insert", onCalloutInsert);
    editor.unsubscribe("callout:insert", onCalloutInsert);

    // Act
    editor.execute("insertCallout", { id: "callout", color: "yellow" });

    // Assert
    expect(onCalloutInsert).not.toHaveBeenCalled();
  });

  it("emits the built-in and custom events of one command in order and records one history record", () => {
    // Arrange
    const editor = createCalloutEditor();
    const initialHistory = editor.getHistory();
    const onEvent = vi.fn();

    editor.subscribe("block:insert", onEvent);
    editor.subscribe("callout:insert", onEvent);

    // Act
    editor.execute("insertCalloutWithBlockEvent", {
      id: "callout",
      color: "yellow",
    });

    // Assert
    expect(onEvent.mock.calls).toStrictEqual([
      [
        {
          type: "block:insert",
          blockId: "callout",
          targetId: editor.ROOT_ID,
          strategy: "append",
        },
      ],
      [{ type: "callout:insert", blockId: "callout", color: "yellow" }],
    ]);

    expect(editor.getHistory()).toStrictEqual([
      ...initialHistory,
      editor.getDocumentJSON(),
    ]);
  });

  it("emits the custom events of a transaction only after it commits", () => {
    // Arrange
    const editor = createCalloutEditor();
    const onCalloutInsert = vi.fn();
    let callsBeforeCommit = 0;

    editor.subscribe("callout:insert", onCalloutInsert);

    // Act
    editor.transaction(tx => {
      tx.execute("insertCallout", { id: "first", color: "yellow" });
      tx.execute("insertCallout", { id: "second", color: "blue" });

      callsBeforeCommit = onCalloutInsert.mock.calls.length;
    });

    // Assert
    expect(callsBeforeCommit).toBe(0);

    expect(onCalloutInsert.mock.calls).toStrictEqual([
      [{ type: "callout:insert", blockId: "first", color: "yellow" }],
      [{ type: "callout:insert", blockId: "second", color: "blue" }],
    ]);
  });

  it("does not emit the custom events of an aborted transaction", () => {
    // Arrange
    const editor = createCalloutEditor();
    const onCalloutInsert = vi.fn();

    editor.subscribe("callout:insert", onCalloutInsert);

    // Act
    editor.transaction(tx => {
      tx.execute("insertCallout", { id: "callout", color: "yellow" });
      tx.abort();
    });

    // Assert
    expect(onCalloutInsert).not.toHaveBeenCalled();
    expect(editor.getBlock("callout")).toBeNull();
  });

  it("undoes a command that returns a custom event with one undo", () => {
    // Arrange
    const editor = createCalloutEditor();
    const initialDocumentJSON = editor.getDocumentJSON();

    editor.execute("insertCallout", { id: "callout", color: "yellow" });

    // Act
    editor.undo();

    // Assert
    expect(editor.getDocumentJSON()).toBe(initialDocumentJSON);
  });
});

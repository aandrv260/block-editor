import { createCommandCenter } from "./CommandCenter-test.utils";
import type { CommandCenter } from "./CommandCenter";
import type { DefaultCommands } from "../executors/defaultCommands";
import type { DocumentHistory } from "../../history/DocumentHistory";
import {
  MARKED_TEXT_BLOCK,
  SAMPLE_BLOCK2,
} from "../../document/utils/document-test.utils";

const createTypingCommandCenter = () =>
  createCommandCenter([
    ["root", MARKED_TEXT_BLOCK],
    ["root", SAMPLE_BLOCK2],
  ]);

describe("CommandCenter history grouping", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves text typed in a row as one history record that one undo reverts", () => {
    // Arrange
    const { document, history, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createTypingCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });
    vi.advanceTimersByTime(100);
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 12,
      text: "!",
    });
    vi.advanceTimersByTime(100);
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 13,
      text: "?",
    });

    // Assert
    expect(history.getHistory()).toStrictEqual([
      INITIAL_HISTORY_DOC_JSON,
      document.toJSON(),
    ]);

    commandCenter.undo();

    expect(document.toJSON()).toBe(INITIAL_HISTORY_DOC_JSON);
  });

  it("saves text deleted in a row with backspace as one history record", () => {
    // Arrange
    const { history, commandCenter } = createTypingCommandCenter();

    // Act
    commandCenter.execute("deleteText", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 10,
      to: 11,
    });
    commandCenter.execute("deleteText", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 9,
      to: 10,
    });
    commandCenter.execute("deleteText", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 8,
      to: 9,
    });

    // Assert
    expect(history.getSize()).toBe(2);
  });

  it("starts a new history record after a pause longer than the group delay", () => {
    // Arrange
    const { history, commandCenter } = createTypingCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });
    vi.advanceTimersByTime(501);
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 12,
      text: "!",
    });

    // Assert
    expect(history.getSize()).toBe(3);
  });

  it("starts a new history record when the text is not added where the last edit stopped", () => {
    // Arrange
    const { history, commandCenter } = createTypingCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 0,
      text: "!",
    });

    // Assert
    expect(history.getSize()).toBe(3);
  });

  it("starts a new history record when the text is typed in another block", () => {
    // Arrange
    const { history, commandCenter } = createTypingCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });
    commandCenter.execute("insertText", {
      blockId: SAMPLE_BLOCK2.id,
      offset: 0,
      text: "!",
    });

    // Assert
    expect(history.getSize()).toBe(3);
  });

  it("starts a new history record for every command that is not a text edit", () => {
    // Arrange
    const { history, commandCenter } = createTypingCommandCenter();

    // Act
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 11,
      text: "!",
    });
    commandCenter.execute("toggleMark", {
      blockId: MARKED_TEXT_BLOCK.id,
      from: 0,
      to: 5,
      mark: { type: "italic" },
    });
    commandCenter.execute("insertText", {
      blockId: MARKED_TEXT_BLOCK.id,
      offset: 12,
      text: "!",
    });

    // Assert
    expect(history.getSize()).toBe(4);
  });

  it.each<
    [
      string,
      (
        commandCenter: CommandCenter<DefaultCommands>,
        history: DocumentHistory,
      ) => void,
      number,
    ]
  >([
    ["undo", commandCenter => commandCenter.undo(), 2],
    ["jumpTo", commandCenter => commandCenter.jumpTo(0), 2],
    [
      "setHistory",
      (commandCenter, history) => commandCenter.setHistory(history.getHistory()),
      3,
    ],
  ])(
    "starts a new history record for a text edit right after %s",
    (_, moveInHistory, expectedHistorySize) => {
      // Arrange
      const { history, commandCenter, INITIAL_HISTORY_DOC_JSON } =
        createTypingCommandCenter();

      commandCenter.execute("deleteText", {
        blockId: MARKED_TEXT_BLOCK.id,
        from: 10,
        to: 11,
      });

      moveInHistory(commandCenter, history);

      // Act
      commandCenter.execute("deleteText", {
        blockId: MARKED_TEXT_BLOCK.id,
        from: 9,
        to: 10,
      });

      // Assert
      expect(history.getSize()).toBe(expectedHistorySize);
      expect(history.getHistory()[0]).toBe(INITIAL_HISTORY_DOC_JSON);
    },
  );
});

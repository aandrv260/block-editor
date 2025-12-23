import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST3_BLOCK,
} from "../../../document/utils/document-test.utils";
import {
  createCommand,
  createTestDocument,
  type DocumentBlocksInitialization,
} from "../utils/commandExecutors-test.utils";
import { HistorySetCommand } from "./HistorySetCommand";

const DEFAULT_DOCUMENT_BLOCKS: DocumentBlocksInitialization[] = [
  ["root", TOGGLE_LIST3_BLOCK],
  ["root", SAMPLE_BLOCK2],
  [TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK3],
];

interface CreateHistorySetCommandConfig {
  newHistortRecords: readonly string[];
}

const createHistorySetCommand = ({
  newHistortRecords,
}: CreateHistorySetCommandConfig) => {
  const { command, eventBus, history, document, ...commandUtils } =
    createCommand<"history:set">({
      command: HistorySetCommand,
      payload: { history: newHistortRecords },
      documentBlocks: DEFAULT_DOCUMENT_BLOCKS,
    });

  return {
    ...commandUtils,
    historySetCommand: command,
    eventBus,
    history,
    document,
  };
};

describe("HistorySetCommand", () => {
  it("throws an error if the last record of the new history is not equal to the current document's JSON", () => {
    // Arrange
    const document = createTestDocument([["root", SAMPLE_BLOCK1]]);

    const { historySetCommand } = createHistorySetCommand({
      newHistortRecords: [document.toJSON()],
    });

    // Assert
    expect(() => historySetCommand.execute()).toThrowError(
      "The last record in the history is not the same as the current document!",
    );
  });

  it("sets the history correctly if the new history input is an empty array", () => {
    // Arrange
    const {
      history,
      historySetCommand,
      assertInitialHistoryIsCorrect,
      INITIAL_DOCUMENT_JSON,
    } = createHistorySetCommand({
      newHistortRecords: [],
    });

    // Assert
    assertInitialHistoryIsCorrect(INITIAL_DOCUMENT_JSON);

    // Act
    historySetCommand.execute();

    // Assert
    expect(history.getHistory()).toEqual([]);
    expect(history.getCurrent()).toBeNull();
    expect(history.getCurrentPosition()).toBe(-1);
  });

  it("sets the history correctly if the new history input is not an empty array", () => {
    // Arrange
    const outerDocument = createTestDocument(DEFAULT_DOCUMENT_BLOCKS);
    const lastInHistory = outerDocument.toJSON();

    const newDocument1 = createTestDocument([
      ["root", SAMPLE_BLOCK2],
      ["root", SAMPLE_BLOCK4],
    ]);

    const { history, historySetCommand, INITIAL_DOCUMENT_JSON } =
      createHistorySetCommand({
        newHistortRecords: [newDocument1.toJSON(), lastInHistory],
      });

    // Assert
    expect(history.getHistory()).toEqual([INITIAL_DOCUMENT_JSON]);
    expect(history.getCurrent()).toBe(INITIAL_DOCUMENT_JSON);
    expect(INITIAL_DOCUMENT_JSON).toBe(lastInHistory);

    // Act
    historySetCommand.execute();

    // Assert
    expect(history.getHistory()).toEqual([newDocument1.toJSON(), lastInHistory]);

    expect(history.getCurrent()).toBe(lastInHistory);
    expect(history.getCurrentPosition()).toBe(1);
    expect(history.getSize()).toBe(2);
  });

  it("emits the correct history:set event", () => {
    // Arrange
    const outerDocument = createTestDocument(DEFAULT_DOCUMENT_BLOCKS);
    const lastInHistory = outerDocument.toJSON();

    const newDocument1 = createTestDocument([
      ["root", SAMPLE_BLOCK2],
      ["root", SAMPLE_BLOCK4],
    ]);

    const { history, eventBus, historySetCommand } = createHistorySetCommand({
      newHistortRecords: [newDocument1.toJSON(), lastInHistory],
    });

    const onHistorySet = vi.fn();
    eventBus.on("history:set", onHistorySet);

    // Act
    historySetCommand.execute();

    // Assert
    expect(onHistorySet).toHaveBeenCalledExactlyOnceWith({
      type: "history:set",
      history: history.getHistory(),
      currentPosition: history.getCurrentPosition(),
      currentRecord: history.getCurrent(),
    });
  });
});

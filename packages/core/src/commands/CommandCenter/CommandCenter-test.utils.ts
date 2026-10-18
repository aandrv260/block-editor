import {
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import { EventBus } from "../../events/event-bus/EventBus";
import {
  createTestDocument,
  type DocumentBlocksInitialization,
} from "../executors/utils/commandExecutors-test.utils";
import { CommandCenter } from "./CommandCenter";
import { DocumentHistory } from "../../history/DocumentHistory";
import { DEFAULT_COMMANDS } from "../executors/defaultCommands";
import type { DefaultEditorSchema } from "../../editor/editor-schema.models";

export const DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS: DocumentBlocksInitialization[] =
  [
    ["root", TOGGLE_LIST1_BLOCK],
    [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
  ];

interface CreateCommandCenterOptions {
  historyLimit?: number;
}

export const createCommandCenter = (
  documentBlocks: DocumentBlocksInitialization[] = DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS,
  { historyLimit }: CreateCommandCenterOptions = {},
) => {
  const eventBus: EditorEventBus = new EventBus();
  const document = createTestDocument(documentBlocks);

  const history = new DocumentHistory({
    initialDocumentJSON: document.toJSON(),
    limit: historyLimit,
  });

  const commandCenter = new CommandCenter<DefaultEditorSchema["commands"]>({
    document,
    eventBus,
    history,
    commands: DEFAULT_COMMANDS,
  });

  const assertInitialDefaultDocumentStructure = () => {
    const root = document.getRoot();

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(root.children[0]);
    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      root.children[0]?.children?.[0],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [],
              }),
            ],
          }),
        ],
      }),
    );
  };

  return {
    eventBus,
    document,
    history,
    commandCenter,
    INITIAL_HISTORY_DOC_JSON: document.toJSON(),
    assertInitialDefaultDocumentStructure,
  };
};

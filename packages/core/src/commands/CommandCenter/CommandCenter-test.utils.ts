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

export const DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS: DocumentBlocksInitialization[] =
  [
    ["root", TOGGLE_LIST1_BLOCK],
    [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
  ];

export const createCommandCenter = (
  documentBlocks: DocumentBlocksInitialization[] = DEFAULT_COMMAND_CENTER_DOCUMENT_BLOCKS,
) => {
  const eventBus: EditorEventBus = new EventBus();
  const document = createTestDocument(documentBlocks);

  const history = new DocumentHistory({
    initialDocumentJSON: document.toJSON(),
  });

  const commandCenter = new CommandCenter({
    document,
    eventBus,
    history,
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

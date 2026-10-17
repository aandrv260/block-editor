import type {
  EditorActionMap,
  EditorActionType,
} from "../../../actions/actions.models";
import { EditorDocument } from "../../../document/EditorDocument";
import type { CommandConstructor } from "../commandExecutors.models";
import type { BlockPayload } from "../../../document/models/document-payload.models";
import {
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../../document/utils/document-test.utils";

export type DocumentBlocksInitialization = [
  parentBlockId: string,
  block: BlockPayload,
];

interface CreateCommandConfig<T extends EditorActionType> {
  command: CommandConstructor<T>;
  payload: EditorActionMap[T]["payload"];
  documentBlocks?: DocumentBlocksInitialization[];
}

export const DEFAULT_INITIAL_BLOCKS: DocumentBlocksInitialization[] = [
  ["root", TOGGLE_LIST1_BLOCK],
  [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
  [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
  [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK4],
];

export const createTestDocument = (
  documentBlocks?: DocumentBlocksInitialization[],
) => {
  const document = new EditorDocument();

  documentBlocks?.forEach(blockData => {
    const [parentBlockId, blockPayload] = blockData;
    document.appendChild(parentBlockId, blockPayload);
  });

  return document;
};

export const createCommand = <T extends EditorActionType>({
  command,
  payload,
  documentBlocks,
}: CreateCommandConfig<T>) => {
  const Command = command;
  const document = createTestDocument(documentBlocks);

  const INITIAL_DOCUMENT_JSON = document.toJSON();

  const assertInitialDefaultDocumentStructure = () => {
    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK4.id)).toBe(
      document.getRoot().children[0]?.children?.[0]?.children?.[1],
    );

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                parentId: TOGGLE_LIST1_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK3.id,
                    parentId: TOGGLE_LIST2_BLOCK.id,
                  }),

                  expect.objectContaining({
                    id: SAMPLE_BLOCK4.id,
                    parentId: TOGGLE_LIST2_BLOCK.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  };

  return {
    command: new Command(payload, document),
    document,
    assertInitialDefaultDocumentStructure,
    INITIAL_DOCUMENT_JSON,
  };
};

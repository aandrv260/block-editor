import { EditorDocument } from "../../../document/EditorDocument";
import type { BlockPayload } from "../../../document/models/document-payload.models";

export type DocumentBlocksInitialization = [
  parentBlockId: string,
  block: BlockPayload,
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

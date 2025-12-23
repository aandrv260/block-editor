import type { BlockPayload } from "../../document/models/document-payload.models";
import { EditorDocument } from "../../document/EditorDocument";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
} from "../../document/utils/document-test.utils";
import { DocumentHistory } from "./DocumentHistory";

export const createEditorDocument = (...payload: BlockPayload[]): EditorDocument => {
  const document = new EditorDocument();

  payload.forEach(item => {
    document.appendChild(document.ROOT_ID, item);
  });

  return document;
};

interface CreateHistoryConfig {
  limit?: number;
}

export const createHistory = ({ limit }: CreateHistoryConfig = {}): {
  document: EditorDocument;
  history: DocumentHistory;
} => {
  const document = createEditorDocument(SAMPLE_BLOCK1, SAMPLE_BLOCK2);
  const history = new DocumentHistory({
    initialDocumentJSON: document.toJSON(),
    limit,
  });

  return { document, history };
};

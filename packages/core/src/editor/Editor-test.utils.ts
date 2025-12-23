import { EditorDocument } from "@/document/EditorDocument";
import type { ConstructableDocumentElement } from "@/document/models/document.models";
import {
  SAMPLE_BLOCK10,
  TOGGLE_LIST3_BLOCK,
} from "@/document/utils/document-test.utils";
import { Editor } from "./Editor";

interface AssertHistoryConfig {
  expectedDocumentHistory: string[];
  expectedCurrentPositionInHistory: number;
  expectedHistorySize: number;
}

interface CreateEditorConfig {
  initialDocument?: ConstructableDocumentElement;
  historyLimit?: number;
}

export const createDocumentToSwapWith = () => {
  const documentToSwapWith = new EditorDocument();

  documentToSwapWith.appendChild(documentToSwapWith.ROOT_ID, TOGGLE_LIST3_BLOCK);
  documentToSwapWith.appendChild(TOGGLE_LIST3_BLOCK.id, SAMPLE_BLOCK10);

  return documentToSwapWith;
};

export const createEditor = ({
  initialDocument,
  historyLimit,
}: CreateEditorConfig = {}) => {
  const editor = new Editor({ initialDocument, historyLimit });
  const document = editor.getRoot();
  const INITIAL_DOCUMENT_JSON = editor.getDocumentJSON();

  const assertHistory = ({
    expectedDocumentHistory,
    expectedCurrentPositionInHistory,
    expectedHistorySize,
  }: AssertHistoryConfig) => {
    expect(editor.getHistory()).toStrictEqual(expectedDocumentHistory);

    expect(editor.getCurrentPositionInHistory()).toBe(
      expectedCurrentPositionInHistory,
    );

    expect(editor.getHistory()).toHaveLength(expectedHistorySize);
  };

  const assertCorrectRootStructure = () => {
    expect(editor.getRoot()).toStrictEqual(editor["document"].getRoot());
  };

  return {
    editor,
    document,
    assertHistory,
    assertCorrectRootStructure,
    INITIAL_DOCUMENT_JSON,
  };
};

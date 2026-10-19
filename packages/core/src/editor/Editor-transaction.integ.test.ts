import { createEditor } from "./Editor-test.utils";
import {
  assertTreeIntegrity,
  MARKED_TEXT_BLOCK,
  SAMPLE_BLOCK1,
} from "@/document/utils/document-test.utils";

describe("Editor transaction", () => {
  it("runs several commands as one history record and emits one change event", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();
    const onEditorChange = vi.fn();

    editor.subscribe("editor:change", onEditorChange);

    // Act
    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: MARKED_TEXT_BLOCK,
      });

      tx.execute("toggleMark", {
        blockId: MARKED_TEXT_BLOCK.id,
        from: 0,
        to: 5,
        mark: { type: "italic" },
      });
    });

    // Assert
    expect(editor.getRoot().children).toStrictEqual([
      {
        ...MARKED_TEXT_BLOCK,
        parentId: editor.ROOT_ID,
        data: {
          content: [
            { text: "Hello", marks: [{ type: "italic" }] },
            { text: " ", marks: [] },
            { text: "world", marks: [{ type: "bold" }] },
          ],
        },
      },
    ]);

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ trigger: "transaction" }),
    );

    expect(editor.getHistory()).toStrictEqual([
      INITIAL_DOCUMENT_JSON,
      editor.getDocumentJSON(),
    ]);

    assertTreeIntegrity(editor["document"]);
  });

  it("undoes every command of a transaction with one undo", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();

    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.execute("insertText", { blockId: SAMPLE_BLOCK1.id, offset: 0, text: "A " });
    });

    // Act
    editor.undo();

    // Assert
    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
  });

  it("leaves the document and history unchanged when the transaction is aborted", () => {
    // Arrange
    const { editor, INITIAL_DOCUMENT_JSON } = createEditor();

    // Act
    editor.transaction(tx => {
      tx.execute("insertBlock", {
        targetId: editor.ROOT_ID,
        strategy: "append",
        newBlock: SAMPLE_BLOCK1,
      });

      tx.abort();
    });

    // Assert
    expect(editor.getDocumentJSON()).toBe(INITIAL_DOCUMENT_JSON);
    expect(editor.getHistory()).toStrictEqual([INITIAL_DOCUMENT_JSON]);
    expect(editor.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
  });
});

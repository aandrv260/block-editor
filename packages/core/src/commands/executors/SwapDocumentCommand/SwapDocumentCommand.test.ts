import { DocumentRoot } from "../../../document/DocumentRoot/DocumentRoot";
import { EditorDocument } from "../../../document/EditorDocument/EditorDocument";
import type { ConstructableDocumentElement } from "../../../document/models/document.models";
import {
  assertTreeIntegrity,
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../../document/utils/document-test.utils";
import { createCommand } from "../utils/commandExecutors-test.utils";
import { SwapDocumentCommand } from "./SwapDocumentCommand";

interface CreateSwapDocumentCommandConfig {
  elementToSwapWith: ConstructableDocumentElement;
  clearHistory?: boolean;
}

const createSwapDocumentCommand = ({
  elementToSwapWith,
  clearHistory,
}: CreateSwapDocumentCommandConfig) => {
  const {
    command: swapDocumentCommand,
    document,
    ...commandUtils
  } = createCommand<"document:swap">({
    command: SwapDocumentCommand,
    payload: { element: elementToSwapWith, clearHistory },
    documentBlocks: [
      ["root", TOGGLE_LIST1_BLOCK],
      [TOGGLE_LIST1_BLOCK.id, TOGGLE_LIST2_BLOCK],
      [TOGGLE_LIST2_BLOCK.id, SAMPLE_BLOCK3],
    ],
  });

  const assertInitialDocumentStructure = () => {
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: TOGGLE_LIST1_BLOCK.id,
            children: [
              expect.objectContaining({
                id: TOGGLE_LIST2_BLOCK.id,
                children: [
                  expect.objectContaining({
                    id: SAMPLE_BLOCK3.id,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );

    expect(document.getBlock(TOGGLE_LIST1_BLOCK.id)).toBe(
      document.getRoot().children[0],
    );

    expect(document.getBlock(TOGGLE_LIST2_BLOCK.id)).toBe(
      document.getRoot().children?.[0]?.children?.[0],
    );

    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBe(
      document.getRoot().children?.[0]?.children?.[0]?.children?.[0],
    );

    expect(document.getBlock("h1")).toBeNull();
    expect(document.getBlock("p1")).toBeNull();
  };

  return {
    ...commandUtils,
    swapDocumentCommand,
    document,
    assertInitialDocumentStructure,
  };
};

const json = `
{
  "id": "root",
  "children": [
    {
      "id": "h1",
      "parentId": "root",
      "type": "heading",
      "data": { "text": "Heading 1", "level": 1 }
    },
    {
      "id": "p1",
      "parentId": "root",
      "type": "text",
      "data": { "text": "Paragraph 1 after Heading 1" }
    }
  ]
}
`;

const rootToSwapWith = new DocumentRoot("root", [
  {
    id: "h1",
    type: "heading",
    parentId: "root",
    data: { text: "Heading 1", level: 1 },
  },
  {
    id: "p1",
    type: "text",
    parentId: "root",
    data: { text: "Paragraph 1 after Heading 1" },
  },
]);

describe("SwapDocumentCommand", () => {
  it("swaps the document with a new one correctly when a JSON string is passed", () => {
    // Arrange
    const { swapDocumentCommand, document, assertInitialDocumentStructure } =
      createSwapDocumentCommand({
        elementToSwapWith: json,
      });

    // Assert
    assertInitialDocumentStructure();

    // Act
    swapDocumentCommand.execute();

    // Assert
    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: "h1",
            parentId: "root",
            type: "heading",
            data: { text: "Heading 1", level: 1 },
          }),
          expect.objectContaining({
            id: "p1",
            parentId: "root",
            type: "text",
            data: { text: "Paragraph 1 after Heading 1" },
          }),
        ],
      }),
    );

    expect(document.getBlock("h1")).toBe(document.getRoot().children[0]);
    expect(document.getBlock("p1")).toBe(document.getRoot().children[1]);
    assertTreeIntegrity(document);
  });

  it("swaps the document with a new one correctly when a DocumentRoot instance is passed", () => {
    // Arrange

    const { swapDocumentCommand, document, assertInitialDocumentStructure } =
      createSwapDocumentCommand({
        elementToSwapWith: rootToSwapWith,
      });

    // Assert
    assertInitialDocumentStructure();

    // Act
    swapDocumentCommand.execute();

    // Assert
    expect(document.getRoot()).toStrictEqual(rootToSwapWith);

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getBlock("h1")).toBe(document.getRoot().children[0]);
    expect(document.getBlock("p1")).toBe(document.getRoot().children[1]);

    assertTreeIntegrity(document);
  });

  it("swaps the document with a new one correctly when a DocumentElement instance is passed", () => {
    // Arrange
    const documentToSwapWith = EditorDocument.fromJSON(json);

    const { swapDocumentCommand, document, assertInitialDocumentStructure } =
      createSwapDocumentCommand({
        elementToSwapWith: documentToSwapWith,
      });

    // Assert
    assertInitialDocumentStructure();

    // Act
    swapDocumentCommand.execute();

    // Assert
    expect(document).toStrictEqual(documentToSwapWith);
    expect(document.toJSON()).toBe(documentToSwapWith.toJSON());

    expect(document.getBlock(SAMPLE_BLOCK1.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK2.id)).toBeNull();
    expect(document.getBlock(SAMPLE_BLOCK3.id)).toBeNull();

    expect(document.getBlock("h1")).toBe(document.getRoot().children[0]);
    expect(document.getBlock("p1")).toBe(document.getRoot().children[1]);

    assertTreeIntegrity(document);
  });

  it("returns the document:swap event when a JSON is passed as the element to construct the new document from", () => {
    // Arrange
    const { swapDocumentCommand } = createSwapDocumentCommand({
      elementToSwapWith: json,
      clearHistory: true,
    });

    // Act
    const event = swapDocumentCommand.execute();

    // Assert
    expect(event).toStrictEqual({
      type: "document:swap",
      element: json,
      historyCleared: true,
    });
  });

  it("returns the document:swap event when a DocumentRoot is passed as the element to construct the new document from", () => {
    // Arrange
    const { swapDocumentCommand } = createSwapDocumentCommand({
      elementToSwapWith: rootToSwapWith,
      clearHistory: false,
    });

    // Act
    const event = swapDocumentCommand.execute();

    // Assert
    expect(event).toStrictEqual({
      type: "document:swap",
      element: rootToSwapWith,
      historyCleared: false,
    });
  });

  it("returns the document:swap event when an EditorDocument is passed as the element to construct the new document from", () => {
    // Arrange
    const editorDocumentToSwapWith = EditorDocument.fromJSON(json);

    const { swapDocumentCommand, document } = createSwapDocumentCommand({
      elementToSwapWith: editorDocumentToSwapWith,
      clearHistory: false,
    });

    // Act
    const event = swapDocumentCommand.execute();

    // Assert
    expect(document.toJSON()).toBe(editorDocumentToSwapWith.toJSON());
    expect(event).toStrictEqual({
      type: "document:swap",
      element: editorDocumentToSwapWith,
      historyCleared: false,
    });
  });
});

import { insertBlock, swapDocument } from "../../actions/actions";
import {
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import { DocumentRoot } from "../../document/DocumentRoot/DocumentRoot";
import { EditorDocument } from "../../document/EditorDocument";
import { createCommandCenter } from "./CommandCenter-test.utils";

const json = `
  {
    "id": "root",
    "children": [
      {
        "id": "toggle-list1",
        "parentId": "root",
        "type": "toggle-list",
        "data": { "open": false },
        "children": []
      },
      {
        "id": "toggle-list2",
        "parentId": "root",
        "type": "toggle-list",
        "data": { "open": true },
        "children": []
      }
    ]
  }
`;

describe("CommandCenter swap command", () => {
  test.each([[false], [undefined]])(
    "executes the swap document command based on the swap document action input correctly with clearHistory=%s and constructs the document from JSON",
    clearHistory => {
      // Arrange
      const {
        document,
        history,
        eventBus,
        commandCenter,
        INITIAL_HISTORY_DOC_JSON,
      } = createCommandCenter();

      const onSwap = vi.fn();
      const onPersist = vi.fn();
      const onEditorChange = vi.fn();

      eventBus.on("document:swap", onSwap);
      eventBus.on("editor:persist", onPersist);
      eventBus.on("editor:change", onEditorChange);

      commandCenter.processAction(
        insertBlock({
          targetId: TOGGLE_LIST2_BLOCK.id,
          newBlock: SAMPLE_BLOCK3,
          strategy: "append",
        }),
      );

      const DOCUMENT_JSON_AFTER_INSERT1 = document.toJSON();

      // Assert
      expect(onPersist).toHaveBeenCalledExactlyOnceWith({
        type: "editor:persist",
        documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
        history: history.getHistory(),
        triggerAction: "block:insert",
      });

      expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
        type: "editor:change",
        documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
        history: history.getHistory(),
        currentPositionInHistory: 1,
        root: document.getRoot(),
        triggerAction: "block:insert",
      });

      expect(history.getHistory()).toEqual([
        INITIAL_HISTORY_DOC_JSON,
        DOCUMENT_JSON_AFTER_INSERT1,
      ]);

      expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_INSERT1);
      expect(history.getCurrentPosition()).toBe(1);

      // Act
      vi.clearAllMocks();
      commandCenter.processAction(
        swapDocument({
          element: json,
          clearHistory,
        }),
      );

      const DOCUMENT_JSON_AFTER_SWAP = document.toJSON();

      // Assert
      expect(onPersist).toHaveBeenCalledExactlyOnceWith({
        type: "editor:persist",
        documentJSON: DOCUMENT_JSON_AFTER_SWAP,
        history: history.getHistory(),
        triggerAction: "document:swap",
      });

      expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
        type: "editor:change",
        documentJSON: DOCUMENT_JSON_AFTER_SWAP,
        history: history.getHistory(),
        currentPositionInHistory: 2,
        root: document.getRoot(),
        triggerAction: "document:swap",
      });

      expect(history.getHistory()).toEqual([
        INITIAL_HISTORY_DOC_JSON,
        DOCUMENT_JSON_AFTER_INSERT1,
        DOCUMENT_JSON_AFTER_SWAP,
      ]);

      expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_SWAP);
      expect(history.getCurrentPosition()).toBe(2);

      expect(document.getBlock("toggle-list1")).toBe(document.getRoot().children[0]);
      expect(document.getBlock("toggle-list2")).toBe(document.getRoot().children[1]);

      expect(document.getRoot()).toStrictEqual(
        expect.objectContaining({
          id: document.ROOT_ID,
          children: [
            expect.objectContaining({
              id: "toggle-list1",
              type: "toggle-list",
              data: { open: false },
              children: [],
            }),

            expect.objectContaining({
              id: "toggle-list2",
              type: "toggle-list",
              data: { open: true },
              children: [],
            }),
          ],
        }),
      );

      expect(onSwap).toHaveBeenCalledExactlyOnceWith({
        type: "document:swap",
        element: json,
        historyCleared: clearHistory ?? false,
      });
    },
  );

  it("executes the swap document command based on the swap document action input correctly with clearHistory=true and constructs the document from JSON", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onSwap = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("document:swap", onSwap);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    commandCenter.processAction(
      insertBlock({
        targetId: TOGGLE_LIST2_BLOCK.id,
        newBlock: SAMPLE_BLOCK3,
        strategy: "append",
      }),
    );

    const DOCUMENT_JSON_AFTER_INSERT1 = document.toJSON();

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
      history: history.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_INSERT1,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_JSON_AFTER_INSERT1,
    ]);

    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_INSERT1);
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    vi.clearAllMocks();
    commandCenter.processAction(
      swapDocument({
        element: json,
        clearHistory: true,
      }),
    );

    const DOCUMENT_JSON_AFTER_SWAP = document.toJSON();

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: DOCUMENT_JSON_AFTER_SWAP,
      history: history.getHistory(),
      triggerAction: "document:swap",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: DOCUMENT_JSON_AFTER_SWAP,
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "document:swap",
    });

    expect(history.getHistory()).toEqual([DOCUMENT_JSON_AFTER_SWAP]);

    expect(history.getCurrent()).toBe(DOCUMENT_JSON_AFTER_SWAP);
    expect(history.getCurrentPosition()).toBe(0);

    expect(document.getBlock("toggle-list1")).toBe(document.getRoot().children[0]);
    expect(document.getBlock("toggle-list2")).toBe(document.getRoot().children[1]);

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: document.ROOT_ID,
        children: [
          expect.objectContaining({
            id: "toggle-list1",
            type: "toggle-list",
            data: { open: false },
            children: [],
          }),

          expect.objectContaining({
            id: "toggle-list2",
            type: "toggle-list",
            data: { open: true },
            children: [],
          }),
        ],
      }),
    );

    expect(onSwap).toHaveBeenCalledExactlyOnceWith({
      type: "document:swap",
      element: json,
      historyCleared: true,
    });
  });

  test.each([[false], [undefined]])(
    "executes the swap document command based on the swap document action input correctly with clearHistory=%s and constructs the document from DocumentRoot",
    clearHistory => {
      // Arrange
      const {
        document,
        history,
        eventBus,
        commandCenter,
        INITIAL_HISTORY_DOC_JSON,
      } = createCommandCenter();

      const documentRootToSwapWith = new DocumentRoot("root", [
        { ...SAMPLE_BLOCK4, parentId: "root" },
        { ...SAMPLE_BLOCK3, parentId: "root" },
      ]);

      const onSwap = vi.fn();
      const onPersist = vi.fn();
      const onEditorChange = vi.fn();

      eventBus.on("document:swap", onSwap);
      eventBus.on("editor:persist", onPersist);
      eventBus.on("editor:change", onEditorChange);

      commandCenter.processAction(
        insertBlock({
          targetId: TOGGLE_LIST2_BLOCK.id,
          newBlock: SAMPLE_BLOCK3,
          strategy: "append",
        }),
      );

      const DOCUMENT_HISTORY_AFTER_INSERT1 = document.toJSON();

      // Assert
      expect(onPersist).toHaveBeenCalledExactlyOnceWith({
        type: "editor:persist",
        documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
        history: history.getHistory(),
        triggerAction: "block:insert",
      });

      expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
        type: "editor:change",
        documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
        history: history.getHistory(),
        currentPositionInHistory: 1,
        root: document.getRoot(),
        triggerAction: "block:insert",
      });

      expect(history.getHistory()).toEqual([
        INITIAL_HISTORY_DOC_JSON,
        DOCUMENT_HISTORY_AFTER_INSERT1,
      ]);

      expect(history.getCurrent()).toBe(DOCUMENT_HISTORY_AFTER_INSERT1);
      expect(history.getCurrentPosition()).toBe(1);

      // Act
      vi.clearAllMocks();
      commandCenter.processAction(
        swapDocument({
          element: documentRootToSwapWith,
          clearHistory,
        }),
      );

      // Assert
      expect(onPersist).toHaveBeenCalledExactlyOnceWith({
        type: "editor:persist",
        documentJSON: document.toJSON(),
        history: history.getHistory(),
        triggerAction: "document:swap",
      });

      expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
        type: "editor:change",
        documentJSON: document.toJSON(),
        history: history.getHistory(),
        currentPositionInHistory: 2,
        root: document.getRoot(),
        triggerAction: "document:swap",
      });

      expect(document.getRoot()).toStrictEqual(
        expect.objectContaining({
          id: "root",
          children: [
            expect.objectContaining({
              id: SAMPLE_BLOCK4.id,
            }),

            expect.objectContaining({
              id: SAMPLE_BLOCK3.id,
            }),
          ],
        }),
      );

      expect(history.getHistory()).toEqual([
        INITIAL_HISTORY_DOC_JSON,
        DOCUMENT_HISTORY_AFTER_INSERT1,
        document.toJSON(),
      ]);

      expect(history.getCurrent()).toBe(document.toJSON());
      expect(history.getCurrentPosition()).toBe(2);

      expect(onSwap).toHaveBeenCalledExactlyOnceWith({
        type: "document:swap",
        element: documentRootToSwapWith,
        historyCleared: clearHistory ?? false,
      });
    },
  );

  it("executes the swap document command based on the swap document action input correctly with clearHistory=true and constructs the document from DocumentRoot", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const documentRootToSwapWith = new DocumentRoot("root", [
      { ...SAMPLE_BLOCK4, parentId: "root" },
      { ...SAMPLE_BLOCK3, parentId: "root" },
    ]);

    const onSwap = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("document:swap", onSwap);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    commandCenter.processAction(
      insertBlock({
        targetId: TOGGLE_LIST2_BLOCK.id,
        newBlock: SAMPLE_BLOCK3,
        strategy: "append",
      }),
    );

    const DOCUMENT_HISTORY_AFTER_INSERT1 = document.toJSON();

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
      history: history.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_HISTORY_AFTER_INSERT1,
    ]);

    expect(history.getCurrent()).toBe(DOCUMENT_HISTORY_AFTER_INSERT1);
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    vi.clearAllMocks();
    commandCenter.processAction(
      swapDocument({
        element: documentRootToSwapWith,
        clearHistory: true,
      }),
    );

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "document:swap",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "document:swap",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: SAMPLE_BLOCK4.id,
          }),

          expect.objectContaining({
            id: SAMPLE_BLOCK3.id,
          }),
        ],
      }),
    );

    expect(history.getHistory()).toEqual([document.toJSON()]);

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(0);

    expect(onSwap).toHaveBeenCalledExactlyOnceWith({
      type: "document:swap",
      element: documentRootToSwapWith,
      historyCleared: true,
    });
  });

  it("executes the swap document command based on the swap document action input correctly with clearHistory=true and constructs the document from EditorDocument", () => {
    // Arrange
    const { document, history, eventBus, commandCenter, INITIAL_HISTORY_DOC_JSON } =
      createCommandCenter();

    const onSwap = vi.fn();
    const onPersist = vi.fn();
    const onEditorChange = vi.fn();

    eventBus.on("document:swap", onSwap);
    eventBus.on("editor:persist", onPersist);
    eventBus.on("editor:change", onEditorChange);

    const documentToSwapWith = EditorDocument.fromJSON(json);

    commandCenter.processAction(
      insertBlock({
        targetId: TOGGLE_LIST2_BLOCK.id,
        newBlock: SAMPLE_BLOCK3,
        strategy: "append",
      }),
    );

    const DOCUMENT_HISTORY_AFTER_INSERT1 = document.toJSON();

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
      history: history.getHistory(),
      triggerAction: "block:insert",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: DOCUMENT_HISTORY_AFTER_INSERT1,
      history: history.getHistory(),
      currentPositionInHistory: 1,
      root: document.getRoot(),
      triggerAction: "block:insert",
    });

    expect(history.getHistory()).toEqual([
      INITIAL_HISTORY_DOC_JSON,
      DOCUMENT_HISTORY_AFTER_INSERT1,
    ]);

    expect(history.getCurrent()).toBe(DOCUMENT_HISTORY_AFTER_INSERT1);
    expect(history.getCurrentPosition()).toBe(1);

    // Act
    vi.clearAllMocks();
    commandCenter.processAction(
      swapDocument({
        element: documentToSwapWith,
        clearHistory: true,
      }),
    );

    // Assert
    expect(onPersist).toHaveBeenCalledExactlyOnceWith({
      type: "editor:persist",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      triggerAction: "document:swap",
    });

    expect(onEditorChange).toHaveBeenCalledExactlyOnceWith({
      type: "editor:change",
      documentJSON: document.toJSON(),
      history: history.getHistory(),
      currentPositionInHistory: 0,
      root: document.getRoot(),
      triggerAction: "document:swap",
    });

    expect(document.getRoot()).toStrictEqual(
      expect.objectContaining({
        id: "root",
        children: [
          expect.objectContaining({
            id: "toggle-list1",
            data: { open: false },
            children: [],
          }),

          expect.objectContaining({
            id: "toggle-list2",
            data: { open: true },
            children: [],
          }),
        ],
      }),
    );

    expect(history.getHistory()).toEqual([document.toJSON()]);

    expect(history.getCurrent()).toBe(document.toJSON());
    expect(history.getCurrentPosition()).toBe(0);

    expect(onSwap).toHaveBeenCalledExactlyOnceWith({
      type: "document:swap",
      element: documentToSwapWith,
      historyCleared: true,
    });
  });
});

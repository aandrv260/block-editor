import { Editor, insertBlock } from "@block-editor/core";

// TODO: Expose createEditor function from the core package.
export const createEditor = () => {
  const editor = new Editor();

  editor.dispatchAction(
    insertBlock({
      targetId: editor.ROOT_ID,
      strategy: "append",
      newBlock: {
        id: crypto.randomUUID(),
        type: "heading",
        data: { text: "\n", level: 1 },
      },
    }),
  );

  return editor;
};

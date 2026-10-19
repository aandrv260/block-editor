import { createEditor } from "@block-editor/core";
import { useEditor } from "@block-editor/react";

export const editor = createEditor();

editor.execute("insertBlock", {
  targetId: editor.ROOT_ID,
  strategy: "append",
  newBlock: {
    id: crypto.randomUUID(),
    type: "heading",
    data: { content: [], level: 1 },
  },
});

export const useAppEditor = useEditor.withTypes<typeof editor>();

import { createEditor } from "@block-editor/core";
import { EditorProvider } from "@block-editor/react";
import Playground from "./components/Playground";

const editor = createEditor();

editor.execute("block:insert", {
  targetId: editor.ROOT_ID,
  strategy: "append",
  newBlock: {
    id: crypto.randomUUID(),
    type: "heading",
    data: { text: "", level: 1 },
  },
});

export default function App() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <EditorProvider editor={editor}>
        <Playground />
      </EditorProvider>
    </div>
  );
}

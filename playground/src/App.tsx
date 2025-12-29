import { EditorProvider } from "@block-editor/react";
import Playground from "./components/Playground";
import { createEditor } from "./createEditor";

const editor = createEditor();

export default function App() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <EditorProvider editor={editor}>
        <Playground />
      </EditorProvider>
    </div>
  );
}

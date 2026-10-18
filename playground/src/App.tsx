import { EditorProvider } from "@block-editor/react";
import Playground from "./components/Playground";
import { editor } from "./editor";

export default function App() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <EditorProvider editor={editor}>
        <Playground />
      </EditorProvider>
    </div>
  );
}

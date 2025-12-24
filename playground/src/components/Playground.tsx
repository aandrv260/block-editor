import { Editor } from "@block-editor/core";
import { EditorDocument, EditorProvider } from "@block-editor/react";
import EditorInfo from "./EditorInfo";

const editor = new Editor();

export default function Playground() {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <EditorProvider editor={editor}>
        <EditorInfo />
        <EditorDocument />
      </EditorProvider>
    </div>
  );
}

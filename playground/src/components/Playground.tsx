import { EditorDocument } from "@block-editor/react";
import EditorInfo from "./EditorInfo";
import EditorState from "./editor-state/EditorState";

export default function Playground() {
  return (
    <div>
      <EditorInfo />
      <EditorDocument />
      <EditorState className="mt-5" />
    </div>
  );
}

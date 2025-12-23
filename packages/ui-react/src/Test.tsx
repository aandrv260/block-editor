import { EditorDocument } from "@block-editor/core";
import { useState } from "react";

export const Test = () => {
  const [editorDocument] = useState<EditorDocument | null>(
    () => new EditorDocument(),
  );

  return (
    <div>
      <p>Test</p>
      <p>{editorDocument?.toJSON()}</p>
    </div>
  );
};

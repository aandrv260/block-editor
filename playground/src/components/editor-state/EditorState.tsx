import { useEditor, useHistory } from "@block-editor/react";
import { useState } from "react";
import EditorStateTab from "./EditorStateTab";
import { cls } from "@/common/cls";

// TODO: This functionality will soon come from the Editor class in the core package. Along with other useful things related to serializing the editor state.
const serializeHistory = (history: readonly string[]) => {
  return JSON.stringify(
    history.map(record => JSON.parse(record)),
    null,
    2,
  );
};

interface Props {
  className?: string;
}

export default function EditorState({ className }: Props) {
  const [activeTab, setActiveTab] = useState<"document" | "history">("document");
  const { documentRoot } = useEditor();
  const { history } = useHistory();

  const content =
    activeTab === "document"
      ? JSON.stringify(documentRoot, null, 2)
      : serializeHistory(history);

  return (
    <div
      className={cls(
        "bg-gray-900 text-white  rounded-md overflow-auto h-105",
        className,
      )}
    >
      <div className="flex gap-5 mb-1 px-4 border-b border-gray-700">
        <EditorStateTab
          onClick={() => setActiveTab("document")}
          active={activeTab === "document"}
        >
          Document tree
        </EditorStateTab>

        <EditorStateTab
          onClick={() => setActiveTab("history")}
          active={activeTab === "history"}
        >
          History
        </EditorStateTab>
      </div>

      <div className="p-4">
        <pre id="formatted-editor-state">{content}</pre>
      </div>
    </div>
  );
}

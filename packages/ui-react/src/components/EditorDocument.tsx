import { useEffect } from "react";
import { useEditor } from "../hooks/useEditor";
import { useHistoryActions } from "../hooks/actions/useHistoryActions";
import { useEditorKeymap } from "../hooks/keymap/useEditorKeymap";
import { useHistory } from "../hooks/history/useHistory/useHistory";
import RenderBlock from "./RenderBlock";

export default function EditorDocument() {
  const { documentRoot } = useEditor();
  const { shouldUndo, shouldRedo } = useEditorKeymap();
  const { isHistoryEmpty } = useHistory();
  const { undo, redo } = useHistoryActions();

  useEffect(() => {
    const onUndo = (event: KeyboardEvent) => {
      if (isHistoryEmpty) return;

      if (shouldRedo(event)) {
        event.preventDefault();
        redo();
        return;
      }

      if (shouldUndo(event)) {
        event.preventDefault();
        undo();
        return;
      }
    };

    window.addEventListener("keydown", onUndo);

    return () => window.removeEventListener("keydown", onUndo);
  }, [isHistoryEmpty, shouldUndo, shouldRedo, undo, redo]);

  return (
    <div>
      {documentRoot.children.map(child => (
        <RenderBlock block={child} key={child.id} />
      ))}
    </div>
  );
}

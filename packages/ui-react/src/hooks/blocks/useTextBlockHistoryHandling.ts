import { useEffect } from "react";
import {
  getPlainText,
  type DeepReadonly,
  type HeadingBlock,
} from "@block-editor/core";
import { useEditor } from "../useEditor";

/**
 * Handles undo/redo keyboard shortcuts for text blocks.
 *
 * Should be used in each text block component separately because this is very specific to text blocks (including headings).
 */
export const useTextBlockHistoryHandling = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
  updateIsEmptyText: (newValue: string) => void,
) => {
  const { editor } = useEditor();

  useEffect(() => {
    const onHistoryChange = (block: DeepReadonly<HeadingBlock> | null) => {
      if (!headingRef.current || !block) return;

      const text = getPlainText(block.data.content);

      headingRef.current.innerText = text;
      updateIsEmptyText(text);
    };

    const unsubscribeFromUndo = editor
      .on("history:undo")
      .map(() => editor.getBlock<HeadingBlock>(block.id))
      .filter(block => Boolean(block))
      .subscribe(onHistoryChange);

    const unsubscribeFromRedo = editor
      .on("history:redo")
      .map(() => editor.getBlock<HeadingBlock>(block.id))
      .filter(block => Boolean(block))
      .subscribe(onHistoryChange);

    return () => {
      unsubscribeFromUndo();
      unsubscribeFromRedo();
    };
  }, [editor, block, headingRef, updateIsEmptyText]);
};

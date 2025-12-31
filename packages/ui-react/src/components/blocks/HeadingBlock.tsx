import { useEffect, useRef } from "react";
import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useBlockTextInput } from "@/hooks/blocks/useBlockTextInput";
import { useBlockIsEmptyState } from "@/hooks/blocks/useBlockIsEmptyState";
import { useTextBlockHistoryHandling } from "@/hooks/blocks/useTextBlockHistoryHandling";
import { useBlockMapPersistence } from "@/hooks/blocks/useBlockMapPersistence";
import { useEditor } from "@/hooks/useEditor";
import { focusCaretTo } from "@/utils/caret/focus-caret.utils";
import { DEFAULT_BLOCK_EMPTY_TEXT_PLACEHOLDER } from "@/utils/blocks/block-placeholder.utils";
import { useBlockKeyDown } from "@/hooks/blocks/useBlockKeyDown";

interface Props {
  block: DeepReadonly<HeadingBlock>;
}

// It won't be bad if later when I see what's common between all blocks (no matter the type) I create a base component for all blocks like BlockBase that will call common hooks like useBlockMapPersistence and useEnterKeyBlockCreation so I don't have to repeat the same code in each block component. For now, it will stay like this until I see the shared logic between all of them.
export default function HeadingBlock({ block }: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { editor } = useEditor();

  const {
    showEmptyText,
    updateIsEmptyText,
    showEmptyTextOnFocus,
    removeEmptyTextOnBlur,
  } = useBlockIsEmptyState(block, headingRef);

  const onInput = useBlockTextInput(block, headingRef, updateIsEmptyText);
  const onKeyDown = useBlockKeyDown(block, headingRef);

  useTextBlockHistoryHandling(block, headingRef, updateIsEmptyText);
  useBlockMapPersistence(block, headingRef);

  useEffect(() => {
    if (!headingRef.current) return;

    const isFirstBlockInDocument = editor.getRoot().children.at(0)?.id === block.id;

    if (isFirstBlockInDocument) {
      focusCaretTo("end", headingRef.current);
    }
  }, [editor, block.id]);

  return (
    <h1
      className={`editor-block ${showEmptyText ? "show-empty-text" : ""} outline-none`}
      ref={headingRef}
      id={block.id}
      data-empty-text={DEFAULT_BLOCK_EMPTY_TEXT_PLACEHOLDER}
      data-block-type="heading"
      aria-label={showEmptyText ? DEFAULT_BLOCK_EMPTY_TEXT_PLACEHOLDER : undefined}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onFocus={showEmptyTextOnFocus}
      onBlur={removeEmptyTextOnBlur}
      onKeyDown={onKeyDown}
    ></h1>
  );
}

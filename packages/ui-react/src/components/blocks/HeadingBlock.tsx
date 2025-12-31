import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useEffect, useRef } from "react";
import { isBackspaceKey, isEnterKey } from "@/common/dom-events/keyboard.utils";
import { useBackspaceBlockDeletion } from "@/hooks/blocks/useBackspaceBlockDeletion";
import { useBlockTextInput } from "@/hooks/blocks/useBlockTextInput";
import { useBlockIsEmptyState } from "@/hooks/blocks/useBlockIsEmptyState";
import { useTextBlockHistoryHandling } from "@/hooks/blocks/useTextBlockHistoryHandling";
import { focusCaretTo } from "@/utils/focus-caret.utils";
import { useBlockMapPersistence } from "@/hooks/blocks/useBlockMapPersistence";
import { useBlockEnterKeyDown } from "@/hooks/blocks/useBlockEnterKeyDown";

interface Props {
  block: DeepReadonly<HeadingBlock>;
}

// It won't be bad if later when I see what's common between all blocks (no matter the type) I create a base component for all blocks like BlockBase that will call common hooks like useBlockMapPersistence and useEnterKeyBlockCreation so I don't have to repeat the same code in each block component. For now, it will stay like this until I see the shared logic between all of them.
export default function HeadingBlock({ block }: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const {
    showEmptyText,
    updateIsEmptyText,
    showEmptyTextOnFocus,
    removeEmptyTextOnBlur,
  } = useBlockIsEmptyState(block, headingRef);

  const { onInput } = useBlockTextInput(block, headingRef, updateIsEmptyText);
  const { handleEnterKeyDown } = useBlockEnterKeyDown(block, headingRef);

  useTextBlockHistoryHandling(block, headingRef, updateIsEmptyText);
  useBlockMapPersistence(block, headingRef);

  // TODO: Handle this in a better way. There are certain cases when this doesn't apply and even leads to bugs. Will be fixed very soon.
  useEffect(() => {
    headingRef.current && focusCaretTo("end", headingRef.current);
  }, []);

  const { handleBackspaceForBlockDeletion } = useBackspaceBlockDeletion(
    block,
    headingRef,
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (isEnterKey(event.key)) {
      handleEnterKeyDown(event);
      return;
    }

    if (isBackspaceKey(event.key)) {
      handleBackspaceForBlockDeletion(event);
    }
  };

  return (
    <h1
      className={`${showEmptyText ? "block-empty" : ""} outline-none`}
      ref={headingRef}
      id={block.id}
      data-empty-text="Write something..."
      data-block-type="heading"
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onFocus={showEmptyTextOnFocus}
      onBlur={removeEmptyTextOnBlur}
      onKeyDown={onKeyDown}
    />
  );
}

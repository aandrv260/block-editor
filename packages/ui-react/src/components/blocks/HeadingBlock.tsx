import type { DeepReadonly, HeadingBlock } from "@block-editor/core";
import { useEffect, useRef } from "react";
import { isBackspaceKey, isEnterKey } from "@/common/dom-events/keyboard.utils";
import { useEnterKeyBlockCreation } from "@/hooks/blocks/useEnterKeyBlockCreation";
import { useBackspaceBlockDeletion } from "@/hooks/blocks/useBackspaceBlockDeletion";
import { useBlockTextInput } from "@/hooks/blocks/useBlockTextInput";
import { useBlockIsEmptyState } from "@/hooks/blocks/useBlockIsEmptyState";
import { useTextBlockHistoryHandling } from "@/hooks/blocks/useTextBlockHistoryHandling";
import { focusCaretToEnd } from "@/utils/focus-caret.utils";
import { useBlockMapPersistence } from "@/hooks/blocks/useBlockMapPersistence";

interface Props {
  block: DeepReadonly<HeadingBlock>;
}

export default function HeadingBlock({ block }: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { showEmptyText, updateIsEmptyText } = useBlockIsEmptyState(block);
  const { onInput } = useBlockTextInput(block, headingRef, updateIsEmptyText);

  useTextBlockHistoryHandling(block, headingRef, updateIsEmptyText);
  useBlockMapPersistence(block, headingRef);

  // TODO: Handle this in a better way. There are certain cases when this doesn't apply and even leads to bugs. Will be fixed very soon.
  useEffect(() => {
    headingRef.current && focusCaretToEnd(headingRef.current);
  }, []);

  const { handleEnterForNewBlockCreation } = useEnterKeyBlockCreation(
    block,
    headingRef,
  );

  const { handleBackspaceForBlockDeletion } = useBackspaceBlockDeletion(
    block,
    headingRef,
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (isEnterKey(event.key)) {
      handleEnterForNewBlockCreation(event);
      return;
    }

    if (isBackspaceKey(event.key)) {
      handleBackspaceForBlockDeletion(event);
    }
  };

  return (
    <h1
      className={`${showEmptyText ? "editor-empty" : ""} outline-none`}
      ref={headingRef}
      data-empty-text="Write something..."
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
}

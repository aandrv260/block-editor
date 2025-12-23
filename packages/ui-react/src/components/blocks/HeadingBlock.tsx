import type { DeepReadonly, Block, HeadingBlock } from "@block-editor/core";
import { useUpdateBlock } from "../../hooks/actions/useUpdateBlock";
import { useEffect, useRef } from "react";
import { useEditor } from "../../hooks/useEditor";
import { useInsertBlock } from "../../hooks/actions/useInsertBlock";
import { focusCaretToEnd, isFocusedAndCaretAtEnd } from "@/utils/focus-caret.utils";
import { useDebounce } from "@/hooks/time/useDebounce";
import { isEnterKey } from "@/common/dom-events/keyboard.utils";

interface Props {
  block: DeepReadonly<HeadingBlock>;
}

// TODO: Extract the logic that will be shared across blocks about caret, press-enter-for-new-block, and more into a hook when it is finished, tested and works properly.
export default function Heading({ block }: Props) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { debounce } = useDebounce();
  const { editor } = useEditor();
  const updateBlock = useUpdateBlock();
  const insertBlock = useInsertBlock();

  useEffect(() => {
    if (!headingRef.current) return;

    headingRef.current.innerText = block.data.text;
  }, [block.data.text]);

  useEffect(() => {
    const onHistoryChange = (block: DeepReadonly<HeadingBlock> | null) => {
      if (!headingRef.current || !block) return;

      headingRef.current.innerText = block.data.text;
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
  }, [editor, block.id]);

  useEffect(() => {
    if (!headingRef.current) return;

    focusCaretToEnd(headingRef.current);
  }, []);

  const onInput = (event: React.FormEvent<HTMLElement>) => {
    const newValue = event.currentTarget.innerText;

    debounce(() => {
      const currentBlock = block as Block;

      updateBlock({
        blockId: block.id,
        newBlock: {
          ...currentBlock,
          type: "heading",
          data: {
            ...block.data,
            text: newValue,
          },
        },
        childrenStrategy: "drop",
      });
    });
  };

  // TODO: Let the user customize the keymap for this action.
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!headingRef.current) return;

    const isEnterKeyPressed = isEnterKey(event.key);
    const isShiftKeyPressed = event.shiftKey;
    const isBlockFocusedAndCaretAtEnd = isFocusedAndCaretAtEnd(headingRef.current);

    if (isEnterKeyPressed && !isBlockFocusedAndCaretAtEnd) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!isShiftKeyPressed && isBlockFocusedAndCaretAtEnd && isEnterKeyPressed) {
      event.preventDefault();
      event.stopPropagation();

      insertBlock({
        strategy: "append",
        newBlock: {
          type: "heading",
          data: { text: "", level: block.data.level },
          id: crypto.randomUUID(),
        },
        targetId: block.parentId,
      });
    }
  };

  return (
    <h1
      className="outline-none"
      ref={headingRef}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  );
}

import { getCaretOffset } from "./caret-offset.utils";

interface TextSplitResult {
  textFromStartToCaret: string;
  textFromCaretToEnd: string;
}

/**
 * Splits the text of an element at the current cursor position.
 * Returns null if the cursor is not in the middle (at start or end) or if there's no valid selection.
 */
export const splitTextAtCaret = (element: HTMLElement): TextSplitResult | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;

  const caretOffset = getCaretOffset(element);
  const fullText = element.innerText;
  const textLength = fullText.length;

  if (caretOffset === 0 || caretOffset >= textLength) return null;

  const textFromCaretToEnd = fullText.slice(caretOffset);
  const textFromStartToCaret = fullText.slice(0, caretOffset);

  return {
    textFromStartToCaret,
    textFromCaretToEnd,
  };
};

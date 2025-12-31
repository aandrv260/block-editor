import { focusCaretTo } from "./focus-caret.utils";
import { findFirstTextNode } from "./query-node.utils";

/**
 * Gets the current cursor offset (character position) within an element.
 * Returns 0 if there's no valid selection or the element is empty.
 */
export const getCaretOffset = (element: HTMLElement): number => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);

  if (!range.collapsed) return 0;

  // Check if the caret is inside the element
  if (!element.contains(range.startContainer)) return 0;

  try {
    // Create a range from the start of the element to the caret position
    const caretRange = document.createRange();
    caretRange.selectNodeContents(element);
    caretRange.setEnd(range.startContainer, range.startOffset);

    // Get the text length from start to caret (this is the offset)
    return caretRange.toString().length;
  } catch {
    return 0;
  }
};

/**
 * Sets the cursor position to a specific offset (character position) within an element.
 * If the offset is greater than the element's text length, it will be clamped to the end.
 */
export const setCaretOffset = (element: HTMLElement, offset: number): void => {
  element.focus();

  const selection = window.getSelection();

  if (!selection) return;

  const textNode = findFirstTextNode(element);

  if (!textNode) {
    focusCaretTo("end", element);
    return;
  }

  const maxOffset = textNode.textContent?.length || 0;
  const targetOffset = Math.min(offset, maxOffset);

  try {
    const newRange = document.createRange();
    newRange.setStart(textNode, targetOffset);
    newRange.setEnd(textNode, targetOffset);

    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch {
    // If setting fails, move to end
    focusCaretTo("end", element);
  }
};

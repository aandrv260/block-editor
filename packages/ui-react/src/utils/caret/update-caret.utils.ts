import { focusCaretTo } from "./focus-caret.utils";
import { isCaretAtEnd } from "./caret-position-checks.utils";
import { isElementFocused } from "@/common/dom-state/focus.utils";
import { findFirstTextNode } from "./query-node.utils";

interface CaretPositionInfo {
  wasAtEnd: boolean;
  savedRange: Range | null;
}

/**
 * Saves the current caret position information from the selection.
 * Returns null if there's no valid selection.
 */
const saveCaretPositionInfo = (element: HTMLElement): CaretPositionInfo | null => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const wasAtEnd = isCaretAtEnd(element);

  return {
    wasAtEnd,
    savedRange: range.cloneRange(),
  };
};

/**
 * Restores the caret to an approximate position based on a saved range.
 * Falls back to moving the caret to the end if restoration fails.
 */
export const restoreCaretToApproximatePosition = (
  element: HTMLElement,
  savedRange: Range,
): void => {
  try {
    const selection = window.getSelection();

    if (!selection) {
      focusCaretTo("end", element);
      return;
    }

    const textNode = findFirstTextNode(element);

    if (!textNode) {
      focusCaretTo("end", element);
      return;
    }

    const maxOffset = textNode.textContent?.length || 0;
    const targetOffset = Math.min(savedRange.endOffset, maxOffset);

    const newRange = document.createRange();
    newRange.setStart(textNode, targetOffset);
    newRange.setEnd(textNode, targetOffset);

    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch {
    // If restoration fails, move to end
    focusCaretTo("end", element);
  }
};

/**
 * Updates the content of an element while preserving the caret position if the element is focused.
 * If the element is not focused, simply updates the content.
 */
export const updateContentWithCaretPreservation = (
  element: HTMLElement,
  newContent: string,
): void => {
  if (!isElementFocused(element)) {
    element.innerText = newContent;
    return;
  }

  const caretInfo = saveCaretPositionInfo(element);

  if (!caretInfo) {
    element.innerText = newContent;
    return;
  }

  element.innerText = newContent;

  // Restore caret position
  if (caretInfo.wasAtEnd) {
    focusCaretTo("end", element);
    return;
  }

  if (caretInfo.savedRange) {
    restoreCaretToApproximatePosition(element, caretInfo.savedRange);
  }
};

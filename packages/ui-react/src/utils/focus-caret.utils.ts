import { isElementFocused } from "@/common/dom-state/focus.utils";

export const focusCaretToEnd = (el: HTMLElement) => {
  el.focus();

  const selection = window.getSelection();

  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false); // false = end, true = start

  selection.removeAllRanges();
  selection.addRange(range);
};

export const isCaretAtEnd = (el: HTMLElement): boolean => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);

  // Must be collapsed (caret, not selection)
  if (!range.collapsed) return false;

  // Caret must be inside the element
  if (!el.contains(range.endContainer)) return false;

  const totalTextLength = el.textContent?.length ?? 0;
  const isElementEmpty = totalTextLength === 0;

  // If element is empty, caret is at end
  if (isElementEmpty) {
    return true;
  }

  // Create a range from the start of the element to the caret position
  // and measure its text length
  try {
    const caretRange = document.createRange();

    caretRange.selectNodeContents(el);
    caretRange.setEnd(range.endContainer, range.endOffset);

    // Get the text length from start to caret
    const textBeforeCaret = caretRange.toString().length;

    // Caret is at end if the text before caret equals the total text length
    return textBeforeCaret === totalTextLength;
  } catch {
    // If range manipulation fails, fall back to comparing with end range
    const endRange = document.createRange();
    endRange.selectNodeContents(el);
    endRange.collapse(false);

    try {
      const comparison = range.compareBoundaryPoints(Range.END_TO_END, endRange);
      return comparison === 0;
    } catch {
      return false;
    }
  }
};

export const isFocusedAndCaretAtEnd = (el: HTMLElement): boolean => {
  return isElementFocused(el) && isCaretAtEnd(el);
};

/**
 * Checks if the current DOM content matches the expected content.
 * Used to skip unnecessary updates that would reset the caret position.
 */
export const shouldSkipContentUpdate = (
  element: HTMLElement,
  expectedText: string,
): boolean => {
  return element.innerText === expectedText;
};

/**
 * Information about the current caret position that can be saved and restored later.
 */
export interface CaretPositionInfo {
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
 * Finds the first text node within an element.
 * Returns null if no text node is found.
 */
const findFirstTextNode = (element: HTMLElement): Node | null => {
  if (element.firstChild?.nodeType === Node.TEXT_NODE) {
    return element.firstChild;
  }

  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }
  }

  return null;
};

/**
 * Restores the caret to an approximate position based on a saved range.
 * Falls back to moving the caret to the end if restoration fails.
 */
const restoreCaretToApproximatePosition = (
  element: HTMLElement,
  savedRange: Range,
): void => {
  try {
    const selection = window.getSelection();

    if (!selection) {
      focusCaretToEnd(element);
      return;
    }

    const textNode = findFirstTextNode(element);

    if (!textNode) {
      focusCaretToEnd(element);
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
    focusCaretToEnd(element);
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

  // Update the content
  element.innerText = newContent;

  // Restore caret position
  if (caretInfo.wasAtEnd) {
    focusCaretToEnd(element);
    return;
  }

  if (caretInfo.savedRange) {
    restoreCaretToApproximatePosition(element, caretInfo.savedRange);
  }
};

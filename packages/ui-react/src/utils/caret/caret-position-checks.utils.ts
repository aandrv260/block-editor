import { isElementFocused } from "@/common/dom-state/focus.utils";

const isCaretAt = (where: "start" | "end", el: HTMLElement): boolean => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);

  // Must be collapsed (caret, not selection)
  if (!range.collapsed) return false;

  // Caret must be inside the element
  const container = where === "start" ? range.startContainer : range.endContainer;
  if (!el.contains(container)) return false;

  const totalTextLength = el.textContent?.length ?? 0;
  const isElementEmpty = totalTextLength === 0;

  // If element is empty, caret is at both start and end
  if (isElementEmpty) {
    return true;
  }

  // Create a range from the start of the element to the caret position
  // and measure its text length
  try {
    const caretRange = document.createRange();

    caretRange.selectNodeContents(el);
    const offset = where === "start" ? range.startOffset : range.endOffset;
    caretRange.setEnd(container, offset);

    // Get the text length from start to caret
    const textBeforeCaret = caretRange.toString().length;

    // Caret is at start if textBeforeCaret === 0, at end if textBeforeCaret === totalTextLength
    return where === "start"
      ? textBeforeCaret === 0
      : textBeforeCaret === totalTextLength;
  } catch {
    // If range manipulation fails, fall back to comparing with boundary range
    const boundaryRange = document.createRange();
    boundaryRange.selectNodeContents(el);
    boundaryRange.collapse(where === "start");

    try {
      const comparisonType =
        where === "start" ? Range.START_TO_START : Range.END_TO_END;

      const comparison = range.compareBoundaryPoints(comparisonType, boundaryRange);
      return comparison === 0;
    } catch {
      return false;
    }
  }
};

export const isCaretAtStart = (el: HTMLElement): boolean => {
  return isCaretAt("start", el);
};

export const isCaretAtEnd = (el: HTMLElement): boolean => {
  return isCaretAt("end", el);
};

export const isFocusedAndCaretAtStart = (el: HTMLElement): boolean => {
  return isElementFocused(el) && isCaretAtStart(el);
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

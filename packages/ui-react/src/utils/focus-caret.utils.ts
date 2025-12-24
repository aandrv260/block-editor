// TODO: Doesn't work properly yet. Unfortunately, I don't have more time now. Fix it in mid or end of January.
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

export const isElementFocused = (el: HTMLElement): boolean =>
  document.activeElement === el;

export const isCaretAtEnd = (el: HTMLElement): boolean => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);

  // Must be collapsed (caret, not selection)
  if (!range.collapsed) return false;

  // Caret must be inside the element
  if (!el.contains(range.endContainer)) return false;

  // Create a range covering full contents
  const endRange = document.createRange();
  endRange.selectNodeContents(el);
  endRange.collapse(false); // end

  return (
    range.endContainer === endRange.endContainer &&
    range.endOffset === endRange.endOffset
  );
};

export const isFocusedAndCaretAtEnd = (el: HTMLElement): boolean => {
  return isElementFocused(el) && isCaretAtEnd(el);
};

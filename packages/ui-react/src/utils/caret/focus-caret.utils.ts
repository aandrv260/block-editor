export const focusCaretTo = (where: "start" | "end", element: HTMLElement) => {
  element.focus();

  const selection = window.getSelection();

  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(where === "start");

  selection.removeAllRanges();
  selection.addRange(range);
};

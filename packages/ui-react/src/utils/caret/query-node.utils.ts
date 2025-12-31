/**
 * Finds the first text node within an element.
 * Returns null if no text node is found.
 */
export const findFirstTextNode = (element: HTMLElement): Node | null => {
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

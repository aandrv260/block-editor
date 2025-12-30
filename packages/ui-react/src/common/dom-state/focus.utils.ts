export const isElementFocused = (element: HTMLElement): boolean => {
  return document.activeElement === element;
};

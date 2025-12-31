export const isElementFocused = (element: HTMLElement | null): boolean => {
  return document.activeElement === element;
};

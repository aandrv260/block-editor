export const hasValidChildren = (block: object): boolean => {
  return "children" in block && Array.isArray(block.children);
};

/**
 * Checks only if there is a children property in the block no matter what type the value is.
 *
 * Use this for validation in blocks that should not have children so inverted booleans that would be confusing are not used.
 * @returns
 */
export const hasChildren = (block: object): boolean => {
  return "children" in block;
};

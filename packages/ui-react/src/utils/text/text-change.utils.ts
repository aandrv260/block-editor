interface TextChange {
  from: number;
  to: number;
  insertedText: string;
}

// TODO: Use the caret position to find where the text changed. When the same character repeats, like typing "a" at the start of "aaa", comparing the texts reports the change at the wrong offset, which will put marks on the wrong text once the UI shows them.
export const getTextChange = (
  oldText: string,
  newText: string,
): TextChange | null => {
  if (oldText === newText) return null;

  let prefixLength = 0;

  while (
    prefixLength < oldText.length &&
    prefixLength < newText.length &&
    oldText[prefixLength] === newText[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;

  while (
    suffixLength < oldText.length - prefixLength &&
    suffixLength < newText.length - prefixLength &&
    oldText[oldText.length - 1 - suffixLength] ===
      newText[newText.length - 1 - suffixLength]
  ) {
    suffixLength++;
  }

  return {
    from: prefixLength,
    to: oldText.length - suffixLength,
    insertedText: newText.slice(prefixLength, newText.length - suffixLength),
  };
};

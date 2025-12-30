import { useMemo } from "react";
import type { EditorKeymap } from "../EditorContext";
import { DEFAULT_EDITOR_KEYMAP } from "../EditorProvider.utils";

export const useEditorKeymapState = (keymapOverrides: Partial<EditorKeymap>) => {
  const keymap = useMemo<EditorKeymap>(
    () => ({ ...DEFAULT_EDITOR_KEYMAP, ...keymapOverrides }),
    [keymapOverrides],
  );

  return {
    keymap,
  };
};

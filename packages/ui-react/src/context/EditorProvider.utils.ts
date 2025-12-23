import type { EditorKeymap } from "./EditorContext";

const isPrimaryModifierKey = (event: KeyboardEvent) =>
  event.metaKey || event.ctrlKey;

const defaultShouldUndo = (event: KeyboardEvent) =>
  isPrimaryModifierKey(event) && event.key === "z";

const defaultShouldRedo = (event: KeyboardEvent) =>
  isPrimaryModifierKey(event) &&
  ((event.shiftKey && event.key === "z") || event.key === "y");

export const DEFAULT_EDITOR_KEYMAP = Object.freeze<EditorKeymap>({
  shouldUndo: defaultShouldUndo,
  shouldRedo: defaultShouldRedo,
});

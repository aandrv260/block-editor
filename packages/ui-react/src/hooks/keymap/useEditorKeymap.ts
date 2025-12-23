import { useEditorContext } from "../../context/useEditorContext";

export const useEditorKeymap = () => {
  const { keymap } = useEditorContext();

  return keymap;
};

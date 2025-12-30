import { useEditorContext } from "../../context/hooks/useEditorContext";

export const useEditorKeymap = () => {
  const { keymap } = useEditorContext();

  return keymap;
};

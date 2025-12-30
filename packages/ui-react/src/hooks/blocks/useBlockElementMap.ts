import { useEditorContext } from "@/context";

export const useBlockElementMap = () => {
  const { blockElementsMap, addBlockHTMLElement, removeBlockHTMLElement } =
    useEditorContext();

  return {
    blockElementsMap,
    addBlockHTMLElement,
    removeBlockHTMLElement,
  };
};

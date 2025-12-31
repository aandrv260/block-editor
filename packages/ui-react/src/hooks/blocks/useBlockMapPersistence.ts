import { useLayoutEffect } from "react";
import { useBlockElementMap } from "./useBlockElementMap";
import type { DeepReadonly, HeadingBlock } from "@block-editor/core";

export const useBlockMapPersistence = (
  block: DeepReadonly<HeadingBlock>,
  headingRef: React.RefObject<HTMLHeadingElement | null>,
) => {
  const { addBlockHTMLElement, removeBlockHTMLElement } = useBlockElementMap();

  useLayoutEffect(() => {
    headingRef.current && addBlockHTMLElement(block.id, headingRef.current);

    return () => {
      removeBlockHTMLElement(block.id);
    };
  }, [block.id, headingRef, addBlockHTMLElement, removeBlockHTMLElement]);
};

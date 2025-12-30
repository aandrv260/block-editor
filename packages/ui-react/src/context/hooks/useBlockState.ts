import type {
  BlockRendererMap,
  BlockRendererOverrides,
} from "@/models/block-ui.models";
import { DEFAULT_BLOCK_RENDER_MAP } from "@/utils/defaultBlockRenderMap";
import { useCallback, useMemo, useState } from "react";

export const useBlockState = (blockOverrides: BlockRendererOverrides) => {
  const [blockElementsMap, setBlockElementsMap] = useState<Map<string, HTMLElement>>(
    () => new Map(),
  );

  const blockRendererMap = useMemo<BlockRendererMap>(() => {
    return { ...DEFAULT_BLOCK_RENDER_MAP, ...blockOverrides };
  }, [blockOverrides]);

  const addBlockHTMLElement = useCallback(
    (blockId: string, element: HTMLElement) => {
      setBlockElementsMap(prev => new Map([...prev.entries(), [blockId, element]]));
    },
    [],
  );

  const removeBlockHTMLElement = useCallback((blockId: string) => {
    setBlockElementsMap(prev => {
      const currentEntries = [...prev.entries()];
      const newEntries = currentEntries.filter(([id]) => id !== blockId);

      return new Map(newEntries);
    });
  }, []);

  return {
    blockElementsMap,
    setBlockElementsMap,
    blockRendererMap,
    addBlockHTMLElement,
    removeBlockHTMLElement,
  };
};

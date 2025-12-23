import type { BlockRendererMap } from "../models/block-ui.models";

export const DEFAULT_BLOCK_RENDER_MAP = {
  heading: () => void 0,
  text: () => void 0,
  "toggle-list": () => void 0,
  quote: () => void 0,
  callout: () => void 0,
  "bullet-list": () => void 0,
} as const satisfies BlockRendererMap;

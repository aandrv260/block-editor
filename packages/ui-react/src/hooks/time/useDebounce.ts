import { useCallback, useRef } from "react";
import type { SetTimeout } from "@/common/time/types/timer.types";
import { DEFAULT_DEBOUNCE_DELAY } from "@/hooks/time/debounce.utils";

/**
 * Default debounce: `500ms`.
 */
export const useDebounce = () => {
  const timer = useRef<SetTimeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const debounce = useCallback(
    (
      callback: () => void | Promise<void>,
      delay: number = DEFAULT_DEBOUNCE_DELAY,
    ) => {
      clearTimer();
      timer.current = setTimeout(() => {
        callback();
        clearTimer();
      }, delay);
    },
    [clearTimer],
  );

  return { timer, clearTimer, debounce };
};

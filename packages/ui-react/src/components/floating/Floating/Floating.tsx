import {
  flip,
  offset,
  shift,
  useFloating,
  type Strategy as FloatingStrategy,
} from "@floating-ui/react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

interface Props {
  open?: boolean;
  strategy?: FloatingStrategy;
  role?: React.AriaRole;
  "aria-label"?: string;
  children: React.ReactNode;
  onChangeOpen?: (open: boolean) => void;
}

export default function Floating({
  open,
  strategy = "absolute",
  role,
  "aria-label": ariaLabel,
  children,
  onChangeOpen,
}: Props) {
  const {
    x,
    y,
    refs: { setReference, setFloating, reference, floating },
  } = useFloating({
    middleware: [offset(15), flip(), shift()],
    strategy,
    placement: "bottom-start",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target === reference.current) {
        return;
      }

      if (floating.current && !floating.current.contains(event.target as Node)) {
        onChangeOpen?.(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onChangeOpen, reference, floating]);

  return (
    <div
      ref={setReference}
      style={{ position: strategy, top: y ?? 0, left: x ?? 0 }}
    >
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            className="bg-white shadow-lg w-64 rounded-lg px-3 py-1.5 border-gray-200"
            ref={setFloating}
            style={{
              position: strategy,
              top: y,
              left: x,
            }}
            role={role}
            tabIndex={0}
            aria-label={ariaLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

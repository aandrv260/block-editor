import type { ClassProp } from "./cls.types";

export const cls = (...values: ClassProp[]): string => {
  return values
    .reduce<string>((acc, currentClassProp) => {
      if (!currentClassProp) {
        return acc;
      }

      if (
        typeof currentClassProp === "number" ||
        typeof currentClassProp === "string"
      ) {
        return `${acc} ${currentClassProp.toString()}`;
      }

      if (typeof currentClassProp === "object") {
        const classes = Object.entries(currentClassProp)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(" ");

        return `${acc} ${classes}`.trim();
      }

      return acc;
    }, "")
    .trim();
};

import { getObjectKeys } from "@/common/object.utils";
import type { Mark } from "../models/content/marks/mark.models";
import { ALL_MARK_TYPES } from "../models/content/marks/mark-type.models";

const isSameMark = (
  mark: Record<string, unknown>,
  otherMark: Record<string, unknown>,
): boolean => {
  const markFieldNames = getObjectKeys(mark);

  return (
    markFieldNames.length === getObjectKeys(otherMark).length &&
    markFieldNames.every(fieldName => mark[fieldName] === otherMark[fieldName])
  );
};

export const normalizeMarks = (marks: Mark[]): Mark[] => {
  const marksByType = new Map(marks.map(mark => [mark.type, mark]));

  return ALL_MARK_TYPES.flatMap(type => marksByType.get(type) ?? []);
};

export const areMarksEqual = (marks: Mark[], otherMarks: Mark[]): boolean => {
  return (
    marks.length === otherMarks.length &&
    marks.every((mark, index) => isSameMark(mark, otherMarks[index]))
  );
};

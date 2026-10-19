import type { TextRun } from "../models/content/content.schema";
import type { Mark } from "../models/content/marks/mark.models";
import type { MarkType } from "../models/content/marks/mark-type.models";
import { areMarksEqual, normalizeMarks } from "./mark.utils";

export const normalizeContent = (content: TextRun[]): TextRun[] => {
  const normalizedContent: TextRun[] = [];

  for (const run of content) {
    if (run.text === "") {
      continue;
    }

    const marks = normalizeMarks(run.marks);
    const previousRun = normalizedContent.at(-1);

    if (previousRun && areMarksEqual(previousRun.marks, marks)) {
      previousRun.text += run.text;
      continue;
    }

    normalizedContent.push({ text: run.text, marks });
  }

  return normalizedContent;
};

export const splitContent = (
  content: TextRun[],
  offset: number,
): [TextRun[], TextRun[]] => {
  const contentBeforeOffset: TextRun[] = [];
  const contentAfterOffset: TextRun[] = [];
  let runStart = 0;

  for (const run of content) {
    const runEnd = runStart + run.text.length;

    if (runEnd <= offset) {
      contentBeforeOffset.push(run);
    } else if (runStart >= offset) {
      contentAfterOffset.push(run);
    } else {
      const splitIndex = offset - runStart;

      contentBeforeOffset.push({ ...run, text: run.text.slice(0, splitIndex) });
      contentAfterOffset.push({ ...run, text: run.text.slice(splitIndex) });
    }

    runStart = runEnd;
  }

  return [
    normalizeContent(contentBeforeOffset),
    normalizeContent(contentAfterOffset),
  ];
};

export const joinContent = (
  content: TextRun[],
  otherContent: TextRun[],
): TextRun[] => {
  return normalizeContent([...content, ...otherContent]);
};

const updateMarksInRange = (
  content: TextRun[],
  from: number,
  to: number,
  updateMarks: (marks: Mark[]) => Mark[],
): TextRun[] => {
  const [contentBeforeRange, contentFromRange] = splitContent(content, from);
  const [contentInRange, contentAfterRange] = splitContent(
    contentFromRange,
    to - from,
  );

  const updatedContentInRange = contentInRange.map(run => ({
    ...run,
    marks: updateMarks(run.marks),
  }));

  return normalizeContent([
    ...contentBeforeRange,
    ...updatedContentInRange,
    ...contentAfterRange,
  ]);
};

export const addMark = (
  content: TextRun[],
  from: number,
  to: number,
  mark: Mark,
): TextRun[] => {
  return updateMarksInRange(content, from, to, marks => [...marks, mark]);
};

export const removeMark = (
  content: TextRun[],
  from: number,
  to: number,
  markType: MarkType,
): TextRun[] => {
  return updateMarksInRange(content, from, to, marks =>
    marks.filter(mark => mark.type !== markType),
  );
};

import type { DeepReadonly } from "@/common/types/object.types";
import type { TextRun } from "../models/content/content.schema";
import type { Mark } from "../models/content/marks/mark.models";
import type { MarkType } from "../models/content/marks/mark-type.models";
import { areMarksEqual, isSameMark, normalizeMarks } from "./mark.utils";

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

export const areContentsEqual = (
  content: TextRun[],
  otherContent: TextRun[],
): boolean => {
  return (
    content.length === otherContent.length &&
    content.every(
      (run, index) =>
        run.text === otherContent[index].text &&
        areMarksEqual(run.marks, otherContent[index].marks),
    )
  );
};

export const getPlainText = (content: DeepReadonly<TextRun[]>): string => {
  return content.map(run => run.text).join("");
};

export const splitContent = (
  content: TextRun[],
  offset: number,
): [TextRun[], TextRun[]] => {
  const contentBeforeOffset: TextRun[] = [];
  const contentAfterOffset: TextRun[] = [];
  let runStart = 0;

  for (const run of content) {
    if (run.text === "") {
      continue;
    }

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

  return [contentBeforeOffset, contentAfterOffset];
};

export const joinContent = (
  content: TextRun[],
  otherContent: TextRun[],
): TextRun[] => {
  return normalizeContent([...content, ...otherContent]);
};

const splitContentAtRange = (
  content: TextRun[],
  from: number,
  to: number,
): [TextRun[], TextRun[], TextRun[]] => {
  const [contentBeforeRange, contentFromRange] = splitContent(content, from);
  const [contentInRange, contentAfterRange] = splitContent(
    contentFromRange,
    to - from,
  );

  return [contentBeforeRange, contentInRange, contentAfterRange];
};

const updateMarksInRange = (
  content: TextRun[],
  from: number,
  to: number,
  updateMarks: (marks: Mark[]) => Mark[],
): TextRun[] => {
  const [contentBeforeRange, contentInRange, contentAfterRange] =
    splitContentAtRange(content, from, to);

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

export const hasMarkInRange = (
  content: TextRun[],
  from: number,
  to: number,
  mark: Mark,
): boolean => {
  const [, contentInRange] = splitContentAtRange(content, from, to);

  return (
    contentInRange.length > 0 &&
    contentInRange.every(run => run.marks.some(runMark => isSameMark(runMark, mark)))
  );
};

export const insertTextAt = (
  content: TextRun[],
  offset: number,
  text: string,
): TextRun[] => {
  const [contentBeforeOffset, contentAfterOffset] = splitContent(content, offset);
  const neighborRun = contentBeforeOffset.at(-1) ?? contentAfterOffset.at(0);

  return normalizeContent([
    ...contentBeforeOffset,
    { text, marks: neighborRun?.marks ?? [] },
    ...contentAfterOffset,
  ]);
};

export const deleteTextInRange = (
  content: TextRun[],
  from: number,
  to: number,
): TextRun[] => {
  const [contentBeforeRange, , contentAfterRange] = splitContentAtRange(
    content,
    from,
    to,
  );

  return joinContent(contentBeforeRange, contentAfterRange);
};

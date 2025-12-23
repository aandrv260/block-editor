import { InvalidDocumentJSONError } from "../errors/factories";

export const parseDocumentJSON = <T>(json: string): T | never => {
  try {
    return JSON.parse(json) as T;
  } catch {
    throw new InvalidDocumentJSONError();
  }
};

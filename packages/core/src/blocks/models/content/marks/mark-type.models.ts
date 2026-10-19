import { getObjectKeys } from "@/common/object.utils";
import { MARK_SCHEMAS, type MarkSchemas } from "./mark.schemas";

export type MarkType = keyof MarkSchemas;

export const ALL_MARK_TYPES = Object.freeze(getObjectKeys(MARK_SCHEMAS));

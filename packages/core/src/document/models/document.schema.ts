import * as v from "valibot";
import { BlockChildrenSchema } from "../../blocks/models/common/block-schema.models";
import { DEFAULT_DOCUMENT_ROOT_ID } from "../DocumentRoot/DocumentRoot";

export const DocumentSchema = v.object({
  id: v.literal(DEFAULT_DOCUMENT_ROOT_ID),
  children: BlockChildrenSchema,
});

import type { Block, DocumentNode } from "../../blocks/models/block.models";

export const DEFAULT_DOCUMENT_ROOT_ID = "root";

// TODO: Remove constructor injection of the root id for now. Make it as simple as possible for version 1.0.0 and later if users need to use a custom root ID, then add it back. I don't think it's a good idea to have a custom root ID because it will add unnecessary complexity.
export class DocumentRoot implements DocumentNode {
  constructor(
    public readonly id: string = DEFAULT_DOCUMENT_ROOT_ID,
    public children: Block[] = [],
  ) {}

  public clone(): DocumentRoot {
    return new DocumentRoot(this.id, structuredClone(this.children));
  }
}

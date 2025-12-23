import type { BlockPayload } from "../models/document-payload.models";
import type { Block } from "../../blocks/models/block.models";
import type { EditorDocument } from "../EditorDocument/EditorDocument";
import { getChildren } from "./block-children.utils";

export const testBlockToBlock = (block: BlockPayload, parentId: string): Block =>
  ({ ...block, parentId }) as Block;

export const TOGGLE_LIST1_BLOCK = {
  id: "toggle-list-1",
  type: "toggle-list",
  data: { open: true },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST2_BLOCK = {
  id: "toggle-list-2",
  type: "toggle-list",
  data: { open: false },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST3_BLOCK = {
  id: "toggle-list-3",
  type: "toggle-list",
  data: { open: true },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST4_BLOCK = {
  id: "toggle-list-4",
  type: "toggle-list",
  data: { open: false },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST5_BLOCK = {
  id: "toggle-list-5",
  type: "toggle-list",
  data: { open: true },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST6_BLOCK = {
  id: "toggle-list-6",
  type: "toggle-list",
  data: { open: false },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST7_BLOCK = {
  id: "toggle-list-7",
  type: "toggle-list",
  data: { open: true },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST8_BLOCK = {
  id: "toggle-list-8",
  type: "toggle-list",
  data: { open: false },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST9_BLOCK = {
  id: "toggle-list-9",
  type: "toggle-list",
  data: { open: true },
  children: [],
} as const satisfies BlockPayload;

export const TOGGLE_LIST10_BLOCK = {
  id: "toggle-list-10",
  type: "toggle-list",
  data: { open: false },
  children: [],
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK1 = {
  id: "node1",
  type: "heading",
  data: { text: "some_text", level: 1 },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK2 = {
  id: "node2",
  type: "text",
  data: { text: "some_teeeeext" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK3 = {
  id: "node3",
  type: "heading",
  data: { text: "134314", level: 3 },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK4 = {
  id: "node4",
  type: "text",
  data: { text: "some_teeeeext" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK5 = {
  id: "node5",
  type: "heading",
  data: { text: "some_teeeeext", level: 3 },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK6 = {
  id: "node6",
  type: "text",
  data: { text: "some_teeeeext_6" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK7 = {
  id: "node7",
  type: "text",
  data: { text: "some_text7" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK8 = {
  id: "node8",
  type: "text",
  data: { text: "some_text8" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK9 = {
  id: "node9",
  type: "text",
  data: { text: "some_text9" },
} as const satisfies BlockPayload;

export const SAMPLE_BLOCK10 = {
  id: "node10",
  type: "text",
  data: { text: "some_text10" },
} as const satisfies BlockPayload;

/**
 * Asserts the integrity of the document by checking that:
 * - Each block has a parent
 * - Each block has a parentId that matches the ID of the parent
 * - The hashmap contains the correct block for each ID and the block is the same object in memory as the one in the document tree.
 * - The children array of the parent block is correct
 * - The size of the document is correct
 */
export const assertTreeIntegrity = (document: EditorDocument) => {
  let blocksCount = 0;

  document.traverse(block => {
    blocksCount++;
    const parent = document.getBlockOrRoot(block.parentId);

    expect(parent).toStrictEqual(
      expect.objectContaining({
        id: block.parentId,
        children: expect.arrayContaining([block]),
      }),
    );

    expect(document.getBlock(block.id)).toBe(block);
    expect(document.getBlock(block.id)?.parentId).toBe(block.parentId);

    if (!parent) {
      throw new Error(
        `Parent is not defined for block with ID ${block.id}! Parent ID: ${block.parentId}`,
      );
    }

    getChildren(parent).forEach(child => {
      expect(child.parentId).toBe(parent.id);
      expect(document.getBlock(child.id)?.parentId).toBe(parent.id);
      expect(document.getBlock(child.id)).toBe(child);
    });
  });

  expect(document["blocksMap"].size).toBe(blocksCount);
  expect(document.size).toBe(blocksCount + 1);
};

export const isBlockDescendantOf = (
  blockChildren: Block[],
  blockId: string,
): boolean => {
  const queue: Block[] = [...blockChildren];
  let currentIndex = 0;

  while (currentIndex < queue.length) {
    const current = queue[currentIndex];

    if (current.id === blockId) {
      return true;
    }

    queue.push(...getChildren(current));
    currentIndex++;
  }

  return false;
};

export const expectBlockNotToBeInTheDocument = (
  document: EditorDocument,
  blockId: string,
) => {
  expect(document.getBlock(blockId)).toBeNull();

  document.traverse(block => {
    expect(block.id).not.toBe(blockId);
  });
};

import {
  BULLET_LIST_ITEM1_BLOCK,
  SAMPLE_BLOCK1,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
} from "../../document/utils/document-test.utils";
import { BLOCK_SPLIT_RULES, defaultBlockSplitRule } from "./block.split-rules";
import type { BulletListItemBlock } from "./bullet-list-item/bullet-list-item-block.schema";
import type {
  BlockSplitContext,
  BlockSplitPosition,
} from "./common/block-split-rule.models";
import type { DeepReadonly } from "@/common/types/object.types";
import type { Block } from "./block.models";
import type { TextRun } from "./content/content.schema";
import type { ToggleListBlock } from "./toggle-list/toggle-list-block.schema";

const contentBefore: TextRun[] = [{ text: "Hel", marks: [] }];
const contentAfter: TextRun[] = [{ text: "lo", marks: [{ type: "bold" }] }];

const createSplitContext = <TBlock>(
  block: DeepReadonly<TBlock>,
  splitPosition: BlockSplitPosition,
): BlockSplitContext<TBlock> => ({
  block,
  newBlockId: "new-block",
  splitPosition,
  contentBefore,
  contentAfter,
});

describe("defaultBlockSplitRule()", () => {
  it("inserts an empty text block before the block and keeps all of its text when splitting at the start", () => {
    // Act
    const result = defaultBlockSplitRule(
      createSplitContext<Block>({ ...SAMPLE_BLOCK1, parentId: "root" }, "start"),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentAfter,
      newBlock: { id: "new-block", type: "text", data: { content: [] } },
      placement: "before",
    });
  });

  it.each<BlockSplitPosition>(["empty", "middle", "end"])(
    "moves the text after the split into a new text block after the block when splitting at %s",
    splitPosition => {
      // Act
      const result = defaultBlockSplitRule(
        createSplitContext<Block>(
          { ...SAMPLE_BLOCK1, parentId: "root" },
          splitPosition,
        ),
      );

      // Assert
      expect(result).toStrictEqual({
        blockContent: contentBefore,
        newBlock: { id: "new-block", type: "text", data: { content: contentAfter } },
        placement: "after",
      });
    },
  );
});

describe("toggle list split rule", () => {
  const splitRule = BLOCK_SPLIT_RULES["toggle-list"];

  it("inserts an empty closed toggle list before the toggle list when splitting at the start", () => {
    // Act
    const result = splitRule?.(
      createSplitContext<ToggleListBlock>(
        { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
        "start",
      ),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentAfter,
      newBlock: {
        id: "new-block",
        type: "toggle-list",
        data: { open: false, content: [] },
        children: [],
      },
      placement: "before",
    });
  });

  it("puts the text after the split into a text block at the top of an open toggle list", () => {
    // Act
    const result = splitRule?.(
      createSplitContext<ToggleListBlock>(
        { ...TOGGLE_LIST1_BLOCK, parentId: "root" },
        "middle",
      ),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentBefore,
      newBlock: { id: "new-block", type: "text", data: { content: contentAfter } },
      placement: "first-child",
    });
  });

  it("moves the text after the split into a closed toggle list after a closed toggle list", () => {
    // Act
    const result = splitRule?.(
      createSplitContext<ToggleListBlock>(
        { ...TOGGLE_LIST2_BLOCK, parentId: "root" },
        "middle",
      ),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentBefore,
      newBlock: {
        id: "new-block",
        type: "toggle-list",
        data: { open: false, content: contentAfter },
        children: [],
      },
      placement: "after",
    });
  });
});

describe("bullet list item split rule", () => {
  const splitRule = BLOCK_SPLIT_RULES["bullet-list-item"];

  it("inserts an empty bullet list item before the item when splitting at the start", () => {
    // Act
    const result = splitRule?.(
      createSplitContext<BulletListItemBlock>(
        { ...BULLET_LIST_ITEM1_BLOCK, parentId: "root" },
        "start",
      ),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentAfter,
      newBlock: {
        id: "new-block",
        type: "bullet-list-item",
        data: { content: [] },
        children: [],
      },
      placement: "before",
    });
  });

  it("moves the text after the split into a new bullet list item after the item", () => {
    // Act
    const result = splitRule?.(
      createSplitContext<BulletListItemBlock>(
        { ...BULLET_LIST_ITEM1_BLOCK, parentId: "root" },
        "end",
      ),
    );

    // Assert
    expect(result).toStrictEqual({
      blockContent: contentBefore,
      newBlock: {
        id: "new-block",
        type: "bullet-list-item",
        data: { content: contentAfter },
        children: [],
      },
      placement: "after",
    });
  });
});

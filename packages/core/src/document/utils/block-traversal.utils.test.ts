import type { Block } from "../../blocks/models/block.models";
import { DocumentRoot } from "../DocumentRoot/DocumentRoot";
import { traverse } from "./block-traversal.utils";
import {
  SAMPLE_BLOCK1,
  SAMPLE_BLOCK2,
  SAMPLE_BLOCK3,
  SAMPLE_BLOCK4,
  SAMPLE_BLOCK5,
  SAMPLE_BLOCK6,
  SAMPLE_BLOCK7,
  SAMPLE_BLOCK8,
  TOGGLE_LIST1_BLOCK,
  TOGGLE_LIST2_BLOCK,
  TOGGLE_LIST3_BLOCK,
  TOGGLE_LIST4_BLOCK,
  TOGGLE_LIST5_BLOCK,
  testBlockToBlock,
} from "./document-test.utils";

describe("traverse()", () => {
  it("loops through each block in the tree and calls the callback with the block as argument", () => {
    // Arrange
    const block1 = testBlockToBlock(SAMPLE_BLOCK1, "root");
    const block2 = testBlockToBlock(SAMPLE_BLOCK2, "root");
    const toggleList1 = testBlockToBlock(TOGGLE_LIST1_BLOCK, "root");
    const block3 = testBlockToBlock(SAMPLE_BLOCK3, toggleList1.id);
    const toggleList2 = testBlockToBlock(TOGGLE_LIST2_BLOCK, toggleList1.id);
    const block4 = testBlockToBlock(SAMPLE_BLOCK4, toggleList2.id);
    const toggleList3 = testBlockToBlock(TOGGLE_LIST3_BLOCK, toggleList2.id);
    const block5 = testBlockToBlock(SAMPLE_BLOCK5, toggleList3.id);
    const toggleList4 = testBlockToBlock(TOGGLE_LIST4_BLOCK, toggleList3.id);
    const block6 = testBlockToBlock(SAMPLE_BLOCK6, toggleList4.id);
    const toggleList5 = testBlockToBlock(TOGGLE_LIST5_BLOCK, toggleList4.id);
    const block7 = testBlockToBlock(SAMPLE_BLOCK7, toggleList5.id);
    const block8 = testBlockToBlock(SAMPLE_BLOCK8, toggleList2.id);

    const root = new DocumentRoot("root", [
      block1,
      block2,
      {
        ...toggleList1,
        children: [
          block3,
          {
            ...toggleList2,
            children: [
              block4,
              {
                ...toggleList3,
                children: [
                  block5,
                  {
                    ...toggleList4,
                    children: [
                      block6,
                      {
                        ...toggleList5,
                        children: [block7],
                      },
                    ],
                  },
                ],
              },
              block8,
            ],
          },
        ],
      },
    ]);

    const callback = vi.fn();

    // Act
    traverse(root, callback);

    // Assert
    expect(callback).toHaveBeenCalledTimes(13);
    expect(callback).toHaveBeenNthCalledWith(1, root.children.at(0));
    expect(callback).toHaveBeenNthCalledWith(2, root.children.at(1));
    expect(callback).toHaveBeenNthCalledWith(3, root.children.at(2));
    expect(callback).toHaveBeenNthCalledWith(
      4,
      root.children.at(2)?.children?.at(0),
    );

    expect(callback).toHaveBeenNthCalledWith(
      5,
      root.children.at(2)?.children?.at(1),
    );

    expect(callback).toHaveBeenNthCalledWith(
      6,
      root.children.at(2)?.children?.at(1)?.children?.at(0),
    );

    expect(callback).toHaveBeenNthCalledWith(
      7,
      root.children.at(2)?.children?.at(1)?.children?.at(1),
    );

    expect(callback).toHaveBeenNthCalledWith(
      8,
      root.children.at(2)?.children?.at(1)?.children?.at(2),
    );

    expect(callback).toHaveBeenNthCalledWith(
      9,
      root.children.at(2)?.children?.at(1)?.children?.at(1)?.children?.at(0),
    );

    expect(callback).toHaveBeenNthCalledWith(
      10,
      root.children.at(2)?.children?.at(1)?.children?.at(1)?.children?.at(1),
    );

    expect(callback).toHaveBeenNthCalledWith(
      11,
      root.children
        .at(2)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(0),
    );

    expect(callback).toHaveBeenNthCalledWith(
      12,
      root.children
        .at(2)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(1),
    );

    expect(callback).toHaveBeenNthCalledWith(
      13,
      root.children
        .at(2)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(1)
        ?.children?.at(0),
    );
  });

  it("traverses correctly when the root is not a DocumentRoot but a Block", () => {
    // Arrange
    const block1 = testBlockToBlock(SAMPLE_BLOCK1, "parent");
    const block2 = testBlockToBlock(SAMPLE_BLOCK2, "parent");
    const toggleList1 = testBlockToBlock(TOGGLE_LIST1_BLOCK, "parent");
    const block3 = testBlockToBlock(SAMPLE_BLOCK3, toggleList1.id);
    const toggleList2 = testBlockToBlock(TOGGLE_LIST2_BLOCK, toggleList1.id);
    const block4 = testBlockToBlock(SAMPLE_BLOCK4, toggleList2.id);

    const rootBlock: Block = {
      ...toggleList1,
      children: [block3, { ...toggleList2, children: [block4] }, block1, block2],
    };

    const callback = vi.fn();

    // Act
    traverse(rootBlock, callback);

    // Assert
    expect(callback).toHaveBeenCalledTimes(5);
    expect(callback).toHaveBeenNthCalledWith(1, rootBlock.children?.at(0));
    expect(callback).toHaveBeenNthCalledWith(2, rootBlock.children?.at(1));
    expect(callback).toHaveBeenNthCalledWith(3, rootBlock.children?.at(2));
    expect(callback).toHaveBeenNthCalledWith(4, rootBlock.children?.at(3));
    expect(callback).toHaveBeenNthCalledWith(
      5,
      rootBlock.children?.at(1)?.children?.at(0),
    );
  });
});

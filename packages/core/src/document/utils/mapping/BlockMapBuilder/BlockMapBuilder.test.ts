import type { Block } from "@/blocks/models/block.models";
import type { BlockMap } from "../../../models/document.models";
import { BlockMapBuilder } from "./BlockMapBuilder";

describe("BlockMapBuilder", () => {
  it("creates a copy of the map passed to the constructor", () => {
    // Arrange
    const blockMap = new Map([
      ["block-1", { id: "block-1", type: "text" }],
      ["block-2", { id: "block-2", type: "text" }],
    ]) as BlockMap;

    // Act
    const blockMapBuilder = new BlockMapBuilder(blockMap);

    // Assert
    const newBlockMap = blockMapBuilder.build();

    expect(newBlockMap).toEqual(blockMap);
    expect(newBlockMap).not.toBe(blockMap);
  });

  it("performs a whole flow of adding and removing blocks and then reading them when building the map", () => {
    // Arrange
    const block1Child1Child1 = {
      id: "block-1-child-1-child-1",
      type: "text",
    };

    const block1Child1Child2 = {
      id: "block-1-child-1-child-2",
      type: "text",
    };

    const block1Child1 = {
      id: "block-1-child-1",
      type: "text",
      children: [block1Child1Child1, block1Child1Child2],
    };

    const block1 = {
      id: "block-1",
      type: "text",
      children: [block1Child1],
    };

    const block2 = {
      id: "block-2",
      type: "text",
    };

    const block3 = {
      id: "block-3",
      type: "text",
    };

    const block4Child1 = {
      id: "block-4-child-1",
      type: "text",
    };

    const block4 = {
      id: "block-4",
      type: "text",
      children: [block4Child1],
    };

    const blockMap = new Map([
      ["block-1", block1],
      ["block-1-child-1", block1Child1],
      ["block-1-child-1-child-1", block1Child1Child1],
      ["block-1-child-1-child-2", block1Child1Child2],
      ["block-2", block2],
    ] as [string, Block][]);

    // Act
    const newBlockMap = new BlockMapBuilder(blockMap)
      .addBlock(block3 as Block)
      .remove("block-2")
      .removeSubtree(block1 as Block)
      .addSubtree(block4 as Block)
      .build();

    // Assert
    expect(newBlockMap).toEqual(
      new Map([
        ["block-3", block3],
        ["block-4", block4],
        ["block-4-child-1", block4Child1],
      ]),
    );

    expect(blockMap).toEqual(
      new Map([
        ["block-1", block1],
        ["block-1-child-1", block1Child1],
        ["block-1-child-1-child-1", block1Child1Child1],
        ["block-1-child-1-child-2", block1Child1Child2],
        ["block-2", block2],
      ]),
    );
  });
});

describe("remove()", () => {
  it("removes the block with the provided ID from the map but not its children", () => {
    // Arrange
    const block1Child1Child1 = {
      id: "block-1-child-1-child-1",
      type: "text",
    };

    const block1Child1 = {
      id: "block-1-child-1",
      type: "text",
      children: [block1Child1Child1],
    };

    const block1 = {
      id: "block-1",
      type: "text",
      children: [block1Child1],
    };

    const block2 = {
      id: "block-2",
      type: "text",
    };

    const blockMap = new Map([
      ["block-1", block1],
      ["block-1-child-1", block1Child1],
      ["block-1-child-1-child-1", block1Child1Child1],
      ["block-2", block2],
    ] as [string, Block][]);

    // Act
    const newBlockMap = new BlockMapBuilder(blockMap).remove("block-1").build();

    // Assert
    expect(newBlockMap).toEqual(
      new Map([
        ["block-1-child-1", block1Child1],
        ["block-1-child-1-child-1", block1Child1Child1],
        ["block-2", block2],
      ]),
    );

    expect(blockMap).toEqual(
      new Map([
        ["block-1", block1],
        ["block-1-child-1", block1Child1],
        ["block-1-child-1-child-1", block1Child1Child1],
        ["block-2", block2],
      ]),
    );
  });
});

describe("removeSubtree()", () => {
  it("removes the block with the provided ID and its children, if they exist, from the map", () => {
    // Arrange
    const block1Child1Child1 = {
      id: "block-1-child-1-child-1",
      type: "text",
    };

    const block1Child1 = {
      id: "block-1-child-1",
      type: "text",
      children: [block1Child1Child1],
    };

    const block1 = {
      id: "block-1",
      type: "text",
      children: [block1Child1],
    };

    const block2 = {
      id: "block-2",
      type: "text",
    };

    const blockMap = new Map([
      ["block-1", block1],
      ["block-1-child-1", block1Child1],
      ["block-1-child-1-child-1", block1Child1Child1],
      ["block-2", block2],
    ] as [string, Block][]);

    // Act
    const newBlockMap = new BlockMapBuilder(blockMap)
      .removeSubtree(block1 as Block)
      .build();

    // Assert
    expect(newBlockMap).toEqual(new Map([["block-2", block2]]));
  });
});

describe("addBlock()", () => {
  it("adds the block to the map", () => {
    // Arrange
    const block1 = {
      id: "block-1",
      type: "text",
    };

    const block2 = {
      id: "block-2",
      type: "text",
    };

    const block3 = {
      id: "block-3",
      type: "text",
    };

    const blockMap = new Map([
      ["block-1", block1],
      ["block-2", block2],
    ] as [string, Block][]);

    // Act
    const newBlockMap = new BlockMapBuilder(blockMap)
      .addBlock(block3 as Block)
      .build();

    // Assert
    expect(newBlockMap).toEqual(
      new Map([
        ["block-1", block1],
        ["block-2", block2],
        ["block-3", block3],
      ]),
    );

    expect(blockMap).toEqual(
      new Map([
        ["block-1", block1],
        ["block-2", block2],
      ]),
    );
  });
});

describe("addSubtree()", () => {
  it("adds the block and its children to the map", () => {
    // Arrange
    const block1Child1Child1 = {
      id: "block-1-child-1-child-1",
      type: "text",
    };

    const block1Child1 = {
      id: "block-1-child-1",
      type: "text",
      children: [block1Child1Child1],
    };

    const block1 = {
      id: "block-1",
      type: "text",
      children: [block1Child1],
    };

    const block2 = {
      id: "block-2",
      type: "text",
    };

    const blockMap = new Map([["block-2", block2]] as [string, Block][]);

    // Act
    const newBlockMap = new BlockMapBuilder(blockMap)
      .addSubtree(block1 as Block)
      .build();

    // Assert
    expect(newBlockMap).toEqual(
      new Map([
        ["block-2", block2],
        ["block-1", block1],
        ["block-1-child-1", block1Child1],
        ["block-1-child-1-child-1", block1Child1Child1],
      ]),
    );

    expect(blockMap).toEqual(new Map([["block-2", block2]]));
  });
});

import { isUpdatePayloadIdInvalid } from "./../utils/update-block/update-block.utils";
import type { Block, DocumentNode } from "../../blocks/models/block.models";
import { isBlockDescendantOf } from "../utils/document-test.utils";
import type {
  BlockMap,
  ConstructableDocumentElement,
  DocumentTree,
  MoveBlockOptions,
  UpdateBlockChildrenStrategy,
  UpdateBlockOptions,
} from "../models/document.models";
import { parseDocumentJSON } from "../utils/json-utils";
import { blockCanHaveChildren, getChildren } from "../utils/block-children.utils";
import { blockPayloadToDocumentBlock } from "../utils/block-mapping.utils";
import {
  validateBlockStructure,
  validateBlockParentLink,
  validateBlockType,
  validateBlockVariant,
  validateDocumentRootStructure,
} from "../utils/block-validation.utils";
import { getUpdatedBlockParentChildren } from "../utils/block-children.utils";
import { buildMapFromRoot } from "../utils/block-mapping.utils";
import {
  DEFAULT_DOCUMENT_ROOT_ID,
  DocumentRoot,
} from "../DocumentRoot/DocumentRoot";
import { Stack } from "../../common/data-structures/Stack";
import type { BlockPayload } from "../models/document-payload.models";
import { getIndexOfBlockToUpdateInParent } from "../utils/update-block/update-block.utils";
import { resolveChildren } from "../utils/update-block/children/update-block-children.utils";
import { updateSubtree } from "../utils/update-block/update-strategies/update-strategies.utils";
import type { UpdateStrategyContext } from "../utils/update-block/update-strategies/update-strategies.models";
import type { Nullish } from "@/common/types/utility.types";
import {
  BlockAlreadyExistsError,
  BlockCannotContainItselfError,
  ParentBlockNotFoundError,
  TargetBlockNotFoundError,
} from "../errors/common";

import { DuplicateOrCircularBlockError } from "../errors/factories";

import {
  InvalidParentBlockError,
  ParentBlockCannotHaveChildrenError,
} from "../errors/append-child";

import {
  CannotInsertAfterRootError,
  CannotInsertBeforeRootError,
  ParentOfTargetCannotHaveChildrenError,
  ParentOfTargetNotFoundError,
  TargetNotInParentChildrenError,
} from "../errors/insert-block";

import {
  BlockToRemoveHasNoParentError,
  BlockToRemoveNotFoundError,
  CannotRemoveRootError,
  ParentOfBlockHasNoChildrenError,
} from "../errors/remove";

import {
  BlockToMoveNotFoundError,
  CannotMoveBlockToDescendantError,
  CannotMoveBlockToItselfError,
  CannotMoveRootError,
  CanOnlyAppendToRootError,
  InvalidMoveStrategyError,
  TargetBlockCannotHaveChildrenError,
} from "../errors/move-block";

import {
  BlockToUpdateHasNoParentError,
  BlockToUpdateNotFoundError,
  CannotUpdateRootError,
  UpdateBlockIDAlreadyInUseError,
} from "../errors/update-block";

/**
 * The EditorDocument class is the core class that represents the document tree in the editor.
 *
 * It is responsible for the creation, modification, and deletion of nodes in the document tree. It is pure and doesn't know about history, UI or commands.
 */
export class EditorDocument implements DocumentTree {
  public static readonly ROOT_ID = DEFAULT_DOCUMENT_ROOT_ID;
  public readonly ROOT_ID = DEFAULT_DOCUMENT_ROOT_ID;
  private root = new DocumentRoot(DEFAULT_DOCUMENT_ROOT_ID);
  private blocksMap: BlockMap = new Map();

  public static fromJSON(json: string): EditorDocument {
    const parsedJSON = parseDocumentJSON(json);

    validateDocumentRootStructure(parsedJSON);

    const root = parsedJSON as DocumentNode;
    const newDocument = new EditorDocument();

    newDocument.root = new DocumentRoot(root.id, root.children);

    newDocument.traverse(current => {
      validateBlockStructure(current);

      const isDuplicateOrCircularDep = newDocument.blocksMap.has(current.id);

      if (isDuplicateOrCircularDep) {
        throw new DuplicateOrCircularBlockError(current.id);
      }

      const parentNotFound = !newDocument.getBlockOrRoot(current.parentId);

      if (parentNotFound) {
        throw new ParentBlockNotFoundError(current.parentId, current.id);
      }

      validateBlockType(current);

      validateBlockParentLink(
        newDocument.getBlockOrRoot(current.parentId as string),
        current.id,
      );

      validateBlockVariant(current);
      newDocument.addBlockToMap(current);
    });

    return newDocument;
  }

  public static fromRoot(root: DocumentRoot): EditorDocument {
    return EditorDocument.fromJSON(JSON.stringify(root));
  }

  public static fromDocument(document: EditorDocument): EditorDocument {
    return document.clone();
  }

  public static from(
    element: Nullish<ConstructableDocumentElement>,
  ): EditorDocument {
    if (!element) {
      return new EditorDocument();
    }

    if (element instanceof EditorDocument) {
      return element.clone();
    }

    if (element instanceof DocumentRoot) {
      return EditorDocument.fromJSON(JSON.stringify(element));
    }

    return EditorDocument.fromJSON(element);
  }

  public appendChild(parentId: string, newBlock: BlockPayload): void | never {
    if (this.getBlock(newBlock.id)) {
      throw new BlockAlreadyExistsError(newBlock.id);
    }

    const newBlockToAppend = blockPayloadToDocumentBlock(newBlock, parentId);

    this.validateChildrenIds(newBlockToAppend);

    if (this.isDocumentRoot(parentId)) {
      this.root.children = [...this.root.children, newBlockToAppend];
      this.addBlockToMap(newBlockToAppend);
      this.updateChildren(newBlockToAppend);
      return;
    }

    const parentBlock = this.getBlock(parentId);

    if (!parentBlock) {
      throw new InvalidParentBlockError(parentId);
    }

    if (!blockCanHaveChildren(parentBlock)) {
      throw new ParentBlockCannotHaveChildrenError(parentId);
    }

    parentBlock.children = [...parentBlock.children, newBlockToAppend];
    this.addBlockToMap(newBlockToAppend);
    this.updateChildren(newBlockToAppend);
  }

  /**
   * Maps down to the lowest level of the subtree block to DocumentBlock.
   *
   * This is crucial for the integrity of the document.
   */
  private updateChildren(block: Block): void {
    if (!blockCanHaveChildren(block)) {
      return;
    }

    const stack: Stack<Block> = new Stack(...block.children);

    while (stack.size() > 0) {
      const current = stack.pop()!;

      if (!blockCanHaveChildren(current)) {
        this.addBlockToMap(current);
        continue;
      }

      const newChildren = current.children.map<Block>(childBlock =>
        blockPayloadToDocumentBlock(childBlock, current.id),
      );

      current.children = newChildren;
      this.addBlockToMap(current);

      if (current.children.length > 0) {
        stack.push(...current.children);
      }
    }
  }

  public insertBefore(targetId: string, newBlock: BlockPayload): void {
    this.insert("before", targetId, newBlock);
  }

  public insertAfter(targetId: string, newBlock: BlockPayload): void {
    this.insert("after", targetId, newBlock);
  }

  private insert(
    where: "after" | "before",
    targetId: string,
    newBlock: BlockPayload,
  ): void {
    if (targetId === EditorDocument.ROOT_ID) {
      throw where === "before"
        ? new CannotInsertBeforeRootError()
        : new CannotInsertAfterRootError();
    }

    if (this.getBlock(newBlock.id)) {
      throw new BlockAlreadyExistsError(newBlock.id);
    }

    const target = this.getBlock(targetId);

    if (!target) {
      throw new TargetBlockNotFoundError(targetId);
    }

    const parentOfTarget = this.getBlockOrRoot(target.parentId);

    if (!parentOfTarget) {
      throw new ParentOfTargetNotFoundError(targetId);
    }

    if (!blockCanHaveChildren(parentOfTarget) || !parentOfTarget.children) {
      throw new ParentOfTargetCannotHaveChildrenError(parentOfTarget.id, targetId);
    }

    const indexOfTarget = getChildren(parentOfTarget).findIndex(
      child => child.id === targetId,
    );

    if (indexOfTarget === -1) {
      throw new TargetNotInParentChildrenError(targetId, parentOfTarget.id);
    }

    const newBlockToInsert = blockPayloadToDocumentBlock(
      newBlock,
      parentOfTarget.id,
    );

    this.validateChildrenIds(newBlockToInsert);
    this.updateChildren(newBlockToInsert);

    // TODO: Refactor after the release of the BETA version.
    parentOfTarget.children = [
      ...parentOfTarget.children.slice(
        0,
        where === "before" ? indexOfTarget : indexOfTarget + 1,
      ),

      newBlockToInsert,

      ...parentOfTarget.children.slice(
        where === "before" ? indexOfTarget : indexOfTarget + 1,
      ),
    ];

    this.addBlockToMap(newBlockToInsert);
  }

  public remove(blockId: string): void {
    if (this.isDocumentRoot(blockId)) {
      throw new CannotRemoveRootError();
    }

    const block = this.getBlock(blockId);

    if (!block) {
      throw new BlockToRemoveNotFoundError(blockId);
    }

    const parentOfBlock = this.getBlockParent(blockId);

    if (!parentOfBlock) {
      throw new BlockToRemoveHasNoParentError(blockId);
    }

    if (!parentOfBlock.children) {
      throw new ParentOfBlockHasNoChildrenError(parentOfBlock.id, block.id);
    }

    if (
      !this.isDocumentRoot(parentOfBlock.id) &&
      !blockCanHaveChildren(parentOfBlock as Block)
    ) {
      throw new ParentBlockCannotHaveChildrenError(parentOfBlock.id);
    }

    parentOfBlock.children = parentOfBlock.children.filter(
      child => child.id !== block.id,
    );

    this.removeBlockFromMap(block.id);

    if (blockCanHaveChildren(block)) {
      this.removeSubtreeFromHashMap(block);
    }
  }

  private removeSubtreeFromHashMap(block: DocumentNode): void {
    this.traverse(child => {
      this.removeBlockFromMap(child.id);
    }, block);
  }

  public updateBlock(
    blockId: string,
    payload: BlockPayload,
    { childrenStrategy }: UpdateBlockOptions = { childrenStrategy: "drop" },
  ): void {
    if (this.isDocumentRoot(blockId)) {
      throw new CannotUpdateRootError();
    }

    const blockToReplace = this.getBlock(blockId);

    if (!blockToReplace) {
      throw new BlockToUpdateNotFoundError(blockId);
    }

    const parentOfBlockToRemove = this.getBlockParent(blockToReplace.id);

    if (!parentOfBlockToRemove) {
      throw new BlockToUpdateHasNoParentError(blockId, blockToReplace.parentId);
    }

    if (isUpdatePayloadIdInvalid(blockToReplace.id, payload.id, this.blocksMap)) {
      throw new UpdateBlockIDAlreadyInUseError(payload.id);
    }

    const indexOfBlockToRemoveInParent = getIndexOfBlockToUpdateInParent(
      parentOfBlockToRemove.children,
      blockToReplace.id,
      blockToReplace.parentId,
    );

    const newChildren = resolveChildren(childrenStrategy, {
      blockToReplace,
      payload,
    });

    const newBlock = blockPayloadToDocumentBlock(
      { ...payload, children: newChildren },
      parentOfBlockToRemove.id,
    );

    this.handleUpdate({
      childrenStrategy,
      indexOfBlockToRemoveInParent,
      parent: parentOfBlockToRemove,
      ctx: { blockMap: this.blocksMap, blockToReplace, newBlock },
    });
  }

  private handleUpdate({
    childrenStrategy,
    ctx,
    indexOfBlockToRemoveInParent,
    parent,
  }: {
    childrenStrategy: UpdateBlockChildrenStrategy;
    parent: DocumentNode;
    indexOfBlockToRemoveInParent: number;
    ctx: UpdateStrategyContext;
  }) {
    const { newBlockMap } = updateSubtree(childrenStrategy, ctx);

    this.blocksMap = new Map(newBlockMap);

    parent.children = getUpdatedBlockParentChildren(
      parent.children ?? [],
      ctx.newBlock,
      indexOfBlockToRemoveInParent,
    );
  }

  public toJSON(): string {
    return JSON.stringify(this.root, null, 2);
  }

  public getRoot(): DocumentRoot {
    return this.root;
  }

  public getBlock(blockId: string): Block | null {
    return this.blocksMap.get(blockId) ?? null;
  }

  public getBlockOrRoot(targetId: string): Block | DocumentRoot | null {
    return this.isDocumentRoot(targetId) ? this.root : this.getBlock(targetId);
  }

  public traverse(callback: (block: Block) => void, root: DocumentNode = this.root) {
    const queue = [...(root.children ?? [])];
    let currentIndex = 0;

    while (currentIndex < queue.length) {
      const currentBlock = queue[currentIndex];

      callback(currentBlock);
      currentIndex++;

      if (blockCanHaveChildren(currentBlock)) {
        queue.push(...currentBlock.children);
      }
    }
  }

  /**
   * Creates a deep copy of the document.
   */
  public clone(): EditorDocument {
    const newDocument = new EditorDocument();

    newDocument.root = this.root.clone();
    newDocument.blocksMap = buildMapFromRoot(newDocument.root);

    return newDocument;
  }

  public swap(element: ConstructableDocumentElement): void {
    const newDocument = EditorDocument.from(element);

    this.root = newDocument.root;
    this.blocksMap = newDocument.blocksMap;
  }

  public moveBlock({ blockId, targetId, strategy }: MoveBlockOptions): void {
    if (blockId === targetId) {
      throw new CannotMoveBlockToItselfError();
    }

    if (this.isDocumentRoot(blockId)) {
      throw new CannotMoveRootError();
    }

    if (this.isDocumentRoot(targetId) && strategy !== "append") {
      throw new CanOnlyAppendToRootError();
    }

    const blockToMove = this.getBlock(blockId);

    if (!blockToMove) {
      throw new BlockToMoveNotFoundError(blockId);
    }

    const target = this.getBlockOrRoot(targetId);

    if (!target) {
      throw new TargetBlockNotFoundError(targetId);
    }

    if (strategy === "append" && !blockCanHaveChildren(target)) {
      throw new TargetBlockCannotHaveChildrenError(targetId);
    }

    if (
      blockCanHaveChildren(blockToMove) &&
      isBlockDescendantOf(blockToMove.children, targetId)
    ) {
      throw new CannotMoveBlockToDescendantError();
    }

    this.remove(blockId);

    if (strategy === "append") {
      this.appendChild(targetId, blockToMove);
      return;
    }

    if (strategy === "before" || strategy === "after") {
      this.insert(strategy, targetId, blockToMove);
      return;
    }

    throw new InvalidMoveStrategyError(strategy);
  }

  /**
   * Get the current tree size. Includes the root and all of its descendants.
   */
  get size() {
    return this.blocksMap.size + 1;
  }

  private getBlockParent(blockId: string): DocumentNode | null {
    const block = this.getBlock(blockId);

    if (!block) {
      return null;
    }

    return this.getBlockOrRoot(block.parentId);
  }

  private validateChildrenIds(block: Block): void {
    this.traverse(child => {
      if (this.getBlock(child.id)) {
        throw new BlockAlreadyExistsError(child.id);
      }

      if (child.id === block.id) {
        throw new BlockCannotContainItselfError(block.id);
      }
    }, block);
  }

  private addBlockToMap(block: Block): void {
    this.blocksMap.set(block.id, block);
  }

  private removeBlockFromMap(blockId: string): void {
    this.blocksMap.delete(blockId);
  }

  private isDocumentRoot(id: string): boolean {
    return this.root.id === id;
  }
}

export class Stack<T> {
  private items: T[] = [];

  constructor(...items: T[]) {
    this.items = items;
  }

  /**
   * Push as many items to the stack as you want.
   */
  public push(...items: T[]) {
    this.items.push(...items);
  }

  /**
   * Remove the last item from the stack.
   * @returns The popped item.
   */
  public pop() {
    return this.items.pop();
  }

  /**
   * Get the number of items in the stack.
   */
  public size() {
    return this.items.length;
  }
}

import { Stack } from "./Stack";

describe("Stack", () => {
  it("creates a stack with the given items", () => {
    // Arrange
    const stack = new Stack<number>(1, 2, 3);

    // Assert
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it("creates an empty stack if no items are given", () => {
    // Arrange
    const stack = new Stack<number>();

    // Assert
    expect(stack.pop()).toBeUndefined();
    expect(stack.size()).toBe(0);
  });
});

describe("push()", () => {
  it("adds an item to the stack", () => {
    // Arrange
    const stack = new Stack<number>();

    // Act
    stack.push(1);

    // Assert
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBeUndefined();
  });

  it("pushes multiple items to the stack", () => {
    // Arrange
    const stack = new Stack<number>();

    // Act
    stack.push(1, 2, 3);

    // Assert
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBeUndefined();
  });
});

describe("pop()", () => {
  it("removes the last item from the stack", () => {
    // Arrange
    const stack = new Stack<number>();

    // Act
    stack.push(1, 2, 3);

    // Assert
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBeUndefined();
  });
});

describe("size()", () => {
  it("returns the number of items in the stack", () => {
    // Arrange
    const stack = new Stack<number>();

    // Act
    stack.push(1, 2, 3);

    // Assert
    expect(stack.size()).toBe(3);

    // Act
    stack.pop();
    stack.pop();

    // Assert
    expect(stack.size()).toBe(1);
  });
});

import type { Mock } from "vitest";
import { EventStream } from "./EventStream";

interface TestObject {
  name: string;
  age: number;
}

const createEventStream = (customCallback?: Mock) => {
  const unsubscribe = vi.fn();

  const eventStream = new EventStream<TestObject>(handler => {
    handler({ name: "Angel", age: 25 });
    customCallback?.();
    return unsubscribe;
  });

  return {
    eventStream,
    unsubscribe,
  };
};

describe("filter()", () => {
  it("does not call the callback passed to .subscribe if at least one filter condition is not met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream.filter(value => value.age < 25).subscribe(callbackFn);

    // Assert
    expect(callbackFn).not.toHaveBeenCalled();
  });

  it("does not call the callback passed to .subscribe if multiple filter operators' conditions are not met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream
      .filter(val => val.name.includes("iv"))
      .filter(val => val.age < 25)
      .subscribe(callbackFn);

    // Assert
    expect(callbackFn).not.toHaveBeenCalled();
  });

  it("calls the callback passed to .subscribe if no filter operators are called", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream.subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });
  });

  it("calls the callback passed to .subscribe if there is only one filter operator and its condition is met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream.filter(val => val.name === "Angel").subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });
  });

  it("calls the callback passed to .subscribe if there are multiple filter operators and their conditions are met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream
      .filter(val => val.name === "Angel")
      .filter(val => val.age <= 25)
      .subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });
  });
});

describe("map()", () => {
  it("passes the new mapped value to the callback passed to .subscribe", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream.map<number>(val => val.age).subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith(25);
  });

  it("passes the new mapped value to the callback passed to .subscribe after multiple map() calls", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream
      .map<number>(val => val.age)
      .map<string>(age => (age + 5).toString())
      .subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith("30");
  });

  it("does not map if a filter operator's condition before it is not met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    eventStream
      .filter(val => val.age < 25)
      .map<number>(val => val.age)
      .subscribe(callbackFn);

    // Assert
    expect(callbackFn).not.toHaveBeenCalled();
  });
});

describe("tap()", () => {
  it("calls the callback successfully", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const tapCallback = vi.fn();
    const callbackFn = vi.fn();

    // Act
    eventStream.tap(tapCallback).subscribe(callbackFn);

    // Assert
    expect(callbackFn).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });

    expect(tapCallback).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });
  });

  it("doesn't call the callback if the user does not call the .subscribe method", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const tapCallback = vi.fn();

    // Act
    eventStream.tap(tapCallback);

    // Assert
    expect(tapCallback).not.toHaveBeenCalled();
  });
});

describe("subscribe()", () => {
  it("returns the unsubscribe function the user returned from subscribeFn that is passed to the constructor", () => {
    // Arrange
    const { eventStream, unsubscribe: passedUnsubscribe } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    const unsubscribe = eventStream.subscribe(callbackFn);

    // Assert
    expect(unsubscribe).toBe(passedUnsubscribe);
    expect(unsubscribe).toBeInstanceOf(Function);
  });

  it("returns the unsubscribe function the user returned from subscribeFn that is passed to the constructor initially even after map calls", () => {
    // Arrange
    const { eventStream, unsubscribe: passedUnsubscribe } = createEventStream();
    const callbackFn = vi.fn();

    // Act
    const unsubscribe = eventStream
      .map(val => val.age)
      .map(age => age + 5)
      .subscribe(callbackFn);

    // Assert
    expect(unsubscribe).toBe(passedUnsubscribe);
    expect(unsubscribe).toBeInstanceOf(Function);
  });
});

describe("EventStream", () => {
  test("nothing happens if the user chains multiple operators but does not call the .subscribe method", () => {
    // Arrange
    const callback = vi.fn();
    const { eventStream } = createEventStream(callback);
    const tapCallback = vi.fn();

    // Act
    eventStream
      .filter(val => val.age <= 25)
      .map(val => val.age)
      .tap(tapCallback);

    // Assert
    expect(callback).not.toHaveBeenCalled();
    expect(tapCallback).not.toHaveBeenCalled();
  });

  it("filter, map and tap() all work together when chained", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const tap1Callback = vi.fn();
    const tap2Callback = vi.fn();
    const subscribeCallback = vi.fn();

    // Act
    eventStream
      .filter(val => val.age <= 25)
      .filter(val => val.name === "Angel")
      .map(val => val.age)
      .tap(tap1Callback)
      .map(age => (age + 5).toString())
      .tap(tap2Callback)
      .subscribe(subscribeCallback);

    // Assert
    expect(tap1Callback).toHaveBeenCalledExactlyOnceWith(25);
    expect(tap2Callback).toHaveBeenCalledExactlyOnceWith("30");
    expect(subscribeCallback).toHaveBeenCalledExactlyOnceWith("30");
  });

  test("tap() calls the provided function no matter if any filter operator's conditions after the tap call are not met", () => {
    // Arrange
    const { eventStream } = createEventStream();
    const tap1Callback = vi.fn();
    const tap2Callback = vi.fn();
    const subscribeCallback = vi.fn();

    // Act
    eventStream
      .tap(tap1Callback)
      .map(val => val.age)
      .filter(age => age < 20)
      .tap(tap2Callback)
      .subscribe(subscribeCallback);

    // Assert
    expect(tap1Callback).toHaveBeenCalledExactlyOnceWith({
      name: "Angel",
      age: 25,
    });

    expect(tap2Callback).not.toHaveBeenCalled();
    expect(subscribeCallback).not.toHaveBeenCalled();
  });
});

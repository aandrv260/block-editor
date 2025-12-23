import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { DuplicateEventHandlerError } from "../errors/DuplicateEventHandlerError";
import { EventErrorCodes } from "../errors/EventErrorCodes";
import { EventBus } from "./EventBus";

type Events = {
  test1: { data: string };
  test2: { emitted: boolean; current: number };
};

const createEventBus = () => {
  return {
    eventBus: new EventBus<Events>(),
  };
};

describe("on()", () => {
  it("adds event listeners properly and correctly", () => {
    // Assert
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    eventBus.on("test1", callback);

    // Assert
    expect(callback).not.toHaveBeenCalled();

    eventBus.emit("test1", { data: "some_text" });

    // Assert
    expect(callback).toHaveBeenCalledExactlyOnceWith({
      data: "some_text",
    });
  });

  it("calls handlers multiple times correctly for different events", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const test1EventCallback = vi.fn();
    const test2EventCallback = vi.fn();

    // Act
    eventBus.on("test1", event => test1EventCallback(1, event));
    eventBus.on("test1", event => test1EventCallback(2, event));
    eventBus.on("test1", event => test1EventCallback(3, event));

    eventBus.on("test2", event => test2EventCallback(1, event));
    eventBus.on("test2", event => test2EventCallback(2, event));
    eventBus.on("test2", event => test2EventCallback(3, event));

    eventBus.emit("test1", { data: "some_test1" });
    eventBus.emit("test1", { data: "some_test2" });

    eventBus.emit("test2", { current: 10, emitted: true });
    eventBus.emit("test2", { current: 20, emitted: true });

    // Assert
    expect(test1EventCallback).toHaveBeenNthCalledWith(1, 1, { data: "some_test1" });
    expect(test1EventCallback).toHaveBeenNthCalledWith(2, 2, { data: "some_test1" });
    expect(test1EventCallback).toHaveBeenNthCalledWith(3, 3, { data: "some_test1" });

    expect(test1EventCallback).toHaveBeenNthCalledWith(4, 1, { data: "some_test2" });
    expect(test1EventCallback).toHaveBeenNthCalledWith(5, 2, { data: "some_test2" });
    expect(test1EventCallback).toHaveBeenNthCalledWith(6, 3, { data: "some_test2" });

    expect(test2EventCallback).toHaveBeenNthCalledWith(1, 1, {
      current: 10,
      emitted: true,
    });

    expect(test2EventCallback).toHaveBeenNthCalledWith(2, 2, {
      current: 10,
      emitted: true,
    });

    expect(test2EventCallback).toHaveBeenNthCalledWith(3, 3, {
      current: 10,
      emitted: true,
    });

    expect(test2EventCallback).toHaveBeenNthCalledWith(4, 1, {
      current: 20,
      emitted: true,
    });

    expect(test2EventCallback).toHaveBeenNthCalledWith(5, 2, {
      current: 20,
      emitted: true,
    });

    expect(test2EventCallback).toHaveBeenNthCalledWith(6, 3, {
      current: 20,
      emitted: true,
    });
  });

  it("calls all listeners in the right order", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    eventBus.on("test1", event => callback(1, event));
    eventBus.on("test1", event => callback(2, event));
    eventBus.on("test1", event => callback(3, event));

    eventBus.emit("test1", { data: "test" });
    eventBus.emit("test1", { data: "test2" });

    // Assert
    expect(callback).toHaveBeenNthCalledWith(1, 1, { data: "test" });
    expect(callback).toHaveBeenNthCalledWith(2, 2, { data: "test" });
    expect(callback).toHaveBeenNthCalledWith(3, 3, { data: "test" });

    expect(callback).toHaveBeenNthCalledWith(4, 1, { data: "test2" });
    expect(callback).toHaveBeenNthCalledWith(5, 2, { data: "test2" });
    expect(callback).toHaveBeenNthCalledWith(6, 3, { data: "test2" });
  });

  it("cleans up the first event listener for the same event correctly through the function returned from the `on` method", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    const cleanup = eventBus.on("test1", callback);
    cleanup();
    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it("cleans up the second event listener for the same event correctly through the function returned from the `on` method", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    // Act
    eventBus.on("test1", callback1);
    const cleanup = eventBus.on("test1", callback2);

    cleanup();

    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Assert
    expect(callback1).toHaveBeenNthCalledWith(1, { data: "test123" });
    expect(callback1).toHaveBeenNthCalledWith(2, { data: "test243" });
    expect(callback2).not.toHaveBeenCalled();
  });

  it("throws an error if the user tries to add the same event handler for the same event more than once", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();
    const tryAddDuplicateEventHandler = () => eventBus.on("test1", callback);

    // Act
    eventBus.on("test1", callback);

    assertEngineError(tryAddDuplicateEventHandler, {
      ExpectedErrorClass: DuplicateEventHandlerError,
      expectedCode: EventErrorCodes.DUPLICATE_EVENT_HANDLER,
      expectedMessage:
        "You cannot add the same callback multiple times for the same event!",
      expectedContext: { event: "test1" },
    });
  });
});

describe("off()", () => {
  it("removes an event listener properly", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.off("test1", callback);

    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  it("removes multiple event listeners correctly for the same event", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.on("test1", callback2);
    eventBus.on("test1", callback3);

    eventBus.off("test1", callback);
    eventBus.off("test1", callback2);
    eventBus.off("test1", callback3);

    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Assert
    expect(callback).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  it("removes multiple event listeners correctly for different events", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const test1EventCallback1 = vi.fn();
    const test1EventCallback2 = vi.fn();

    const test2EventCallback1 = vi.fn();
    const test2EventCallback2 = vi.fn();

    // Act

    // First event
    eventBus.on("test1", test1EventCallback1);
    eventBus.on("test1", test1EventCallback2);

    eventBus.off("test1", test1EventCallback1);
    eventBus.off("test1", test1EventCallback2);

    // Second event
    eventBus.on("test2", test2EventCallback1);
    eventBus.on("test2", test2EventCallback2);

    eventBus.off("test2", test2EventCallback1);
    eventBus.off("test2", test2EventCallback2);

    // Emit first event
    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Emit second event
    eventBus.emit("test2", { current: 123, emitted: true });
    eventBus.emit("test2", { current: 456, emitted: true });

    // Assert
    expect(test1EventCallback1).not.toHaveBeenCalled();
    expect(test1EventCallback2).not.toHaveBeenCalled();

    expect(test2EventCallback1).not.toHaveBeenCalled();
    expect(test2EventCallback2).not.toHaveBeenCalled();
  });

  it("doesn't throw an error if the user tries to remove the same event listener multiple times for the same event", () => {
    // Assert
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.off("test1", callback);

    // Assert
    expect(() => eventBus.off("test1", callback)).not.toThrowError();
  });
});

describe("emit()", () => {
  it("emits an event correctly multiple times", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test1", { data: "test243" });

    // Assert
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, { data: "test123" });
    expect(callback).toHaveBeenNthCalledWith(2, { data: "test243" });
  });
});

describe("EventBus", () => {
  it("adds multiple event listeners correctly and emits them correctly when needed", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();
    const callback2 = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.on("test2", callback2);

    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test2", { current: 123, emitted: true });

    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenNthCalledWith(1, { data: "test123" });

    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenNthCalledWith(1, { current: 123, emitted: true });
  });

  it("calls all listeners in the right order even after removal old ones and addition of new event listeners", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const caller = vi.fn();

    const test1EventCallback1 = () => caller(1);
    const test1EventCallback2 = () => caller(2);
    const test1EventCallback3 = () => caller(3);

    // Act
    eventBus.on("test1", test1EventCallback1);
    eventBus.on("test1", test1EventCallback2);
    eventBus.on("test1", test1EventCallback3);

    eventBus.off("test1", test1EventCallback1);

    eventBus.on("test1", test1EventCallback1);

    eventBus.emit("test1", { data: "test123" });

    // Assert
    expect(caller).toHaveBeenCalledTimes(3);
    expect(caller).toHaveBeenNthCalledWith(1, 2);
    expect(caller).toHaveBeenNthCalledWith(2, 3);
    expect(caller).toHaveBeenNthCalledWith(3, 1);
  });

  it("calls all listeners in the right order even after removal old ones and addition of new event listeners even when the user those event operations happen for multiple events", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const caller1 = vi.fn();
    const caller2 = vi.fn();

    const test1EventCallback1 = () => caller1(1);
    const test1EventCallback2 = () => caller1(2);
    const test1EventCallback3 = () => caller1(3);

    const test2EventCallback1 = () => caller2(1);
    const test2EventCallback2 = () => caller2(2);
    const test2EventCallback3 = () => caller2(3);

    // Act
    eventBus.on("test1", test1EventCallback1);
    eventBus.on("test1", test1EventCallback2);
    eventBus.on("test1", test1EventCallback3);

    eventBus.on("test2", test2EventCallback1);
    eventBus.on("test2", test2EventCallback2);
    eventBus.on("test2", test2EventCallback3);

    eventBus.off("test1", test1EventCallback2);
    eventBus.off("test2", test2EventCallback1);

    eventBus.on("test1", test1EventCallback2);
    eventBus.on("test2", test2EventCallback1);

    eventBus.emit("test1", { data: "some_data" });
    eventBus.emit("test2", { current: 3413, emitted: true });

    // Assert
    expect(caller1).toHaveBeenNthCalledWith(1, 1);
    expect(caller1).toHaveBeenNthCalledWith(2, 3);
    expect(caller1).toHaveBeenNthCalledWith(3, 2);

    expect(caller2).toHaveBeenNthCalledWith(1, 2);
    expect(caller2).toHaveBeenNthCalledWith(2, 3);
    expect(caller2).toHaveBeenNthCalledWith(3, 1);
  });
});

describe("cleanup()", () => {
  it("removes all listeners in the event bus", () => {
    // Arrange
    const { eventBus } = createEventBus();
    const callback = vi.fn();
    const callback2 = vi.fn();

    // Act
    eventBus.on("test1", callback);
    eventBus.on("test2", callback2);

    eventBus.cleanup();

    eventBus.emit("test1", { data: "test123" });
    eventBus.emit("test2", { current: 123, emitted: true });

    // Assert
    expect(callback).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});

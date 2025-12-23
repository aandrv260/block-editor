import { renderHook } from "@testing-library/react";
import { useDebounce } from "./useDebounce";
import { DEFAULT_DEBOUNCE_DELAY } from "./debounce.utils";

vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllTimers();
});

describe("useDebounce", () => {
  test("timer should be null initially", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());

    // Assert
    expect(result.current.timer.current).toBeNull();
  });

  test("debounce() should clear the timer in the beginning and set a new timer", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const timerCallback = () => {};

    // Act
    result.current.debounce(timerCallback);
    const firstTimer = result.current.timer.current;

    result.current.debounce(timerCallback);
    const secondTimer = result.current.timer.current;

    // Assert
    expect(secondTimer).not.toBe(firstTimer);
  });

  test("debounce() should only call its param callback after the timeout expires", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const timerCallback = vi.fn();

    // Act
    result.current.debounce(timerCallback, 1000);

    // Assert
    expect(timerCallback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(timerCallback).toHaveBeenCalled();
  });

  test("debounce() should only call the last callback if called multiple times rapidly", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const callback = vi.fn();

    // Act
    result.current.debounce(callback, 1000);
    vi.advanceTimersByTime(99);

    result.current.debounce(callback, 1000);
    vi.advanceTimersByTime(998);

    result.current.debounce(callback, 1000);
    vi.advanceTimersByTime(1000);

    // Assert
    expect(callback).toHaveBeenCalledOnce();
  });

  test("debounce() should use a default debounce delay if it's not provided in as a second param to the function", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const callback = vi.fn();

    // Act
    result.current.debounce(callback);
    vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY);

    // Assert
    expect(callback).toHaveBeenCalled();
  });

  test("debounce() should use the delay provided as its second param if provided at all", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const callback = vi.fn();

    // Act
    result.current.debounce(callback, 444);
    vi.advanceTimersByTime(444);

    // Assert
    expect(callback).toHaveBeenCalled();
  });

  test("debounce() should clear the timer after its callback was executed after the timeout expired", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const callback = vi.fn();

    // Act
    result.current.debounce(callback, 400);
    vi.advanceTimersByTime(400);

    // Assert
    expect(result.current.timer.current).toBeNull();
  });

  test("clearTimer() will not initiate a timer if the timer variable is null", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const clearTimeoutMock = vi.spyOn(window, "clearTimeout");

    // Act
    result.current.clearTimer();

    // Assert
    expect(clearTimeoutMock).not.toHaveBeenCalled();
    expect(result.current.timer.current).toBeNull();
  });

  test("clearTimer() should reset the timer if it hasn't expired", () => {
    // Arrange
    const { result } = renderHook(() => useDebounce());
    const callbackMock = vi.fn();
    const clearTimeoutMock = vi.spyOn(window, "clearTimeout");

    // Act
    result.current.debounce(callbackMock);
    result.current.clearTimer();

    // Assert
    expect(clearTimeoutMock).toHaveBeenCalled();
    expect(result.current.timer.current).toBeNull();
  });
});

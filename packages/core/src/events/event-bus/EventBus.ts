/* eslint-disable @typescript-eslint/no-explicit-any */

import { DuplicateEventHandlerError } from "../errors/DuplicateEventHandlerError";

export type EventHandler<T> = (event: T) => void;
export type UnsubscribeFn = VoidFunction;

export class EventBus<
  TEventData extends Record<string, NonNullable<unknown>>,
  TEvent extends keyof TEventData = keyof TEventData,
> {
  private eventListeners: Map<TEvent, Set<EventHandler<any>>> = new Map();

  public on<T extends TEvent>(
    event: T,
    handler: EventHandler<TEventData[T]>,
  ): UnsubscribeFn {
    const allEventListeners = this.getAllEventListeners(event);
    const removeListener = () => this.off(event, handler);

    if (!allEventListeners) {
      this.eventListeners.set(event, new Set([handler]));
      return removeListener;
    }

    if (allEventListeners.has(handler)) {
      throw new DuplicateEventHandlerError(String(event));
    }

    allEventListeners.add(handler);

    return removeListener;
  }

  public off<T extends TEvent>(
    event: T,
    handler: EventHandler<TEventData[T]>,
  ): void {
    const allListeners = this.getAllEventListeners(event);

    if (!allListeners) {
      return;
    }

    allListeners.delete(handler);
  }

  /**
   * Removes all listeners in the event bus.
   */
  public cleanup(): void {
    this.eventListeners.clear();
  }

  public emit<T extends TEvent>(event: T, data: TEventData[T]): void {
    const allListeners = this.getAllEventListeners(event);

    allListeners?.forEach(listener => listener(data));
  }

  private getAllEventListeners(event: TEvent): Set<EventHandler<any>> | undefined {
    return this.eventListeners.get(event);
  }
}

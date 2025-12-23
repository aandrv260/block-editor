import type { EventHandler, UnsubscribeFn } from "../event-bus/EventBus";

export const SKIP = Symbol("skip");

export type SubscribeFn<T> = (handler: EventHandler<T>) => UnsubscribeFn;

export type SkipOperatorSymbol = typeof SKIP;
export type SkipOperatorFn = () => SkipOperatorSymbol;

export type Operator<TInput, TOutput> = (
  value: TInput,
  skip: SkipOperatorFn,
) => TOutput;

/**
 * A stream of values. Can be filtered, mapped, tapped and subscribed to.
 *
 * Lazy by design. This means you can chain as many operators as you want without actually executing them until you call the .subscribe method and a value is emitted.
 *
 * This way you can compose logic in a declarative way and then reuse it later across multiple components, services, etc.
 */
export interface IEventStream<T> {
  /**
   * Filters the stream. If the predicate function returns false, the value is skipped and the next operator and the subscribe callback is not called.
   * @param predicate - The predicate function to filter the stream by.
   * @returns A new EventStream.
   */
  filter(predicate: (value: T) => boolean | null | undefined): IEventStream<T>;

  /**
   * Maps the stream value to a new value. The new value is passed to next operator and the subscribe callback.
   * @param transformer - The transformer function to map the stream to a new value.
   * @returns A new EventStream with the new value.
   */
  map<U>(transformer: (value: T) => U): IEventStream<U>;

  /**
   * Calls the handler function with the current value. Meant to be used for side effects like logging, debugging, etc.
   * @param handler - The handler function to call with the value.
   * @returns A new EventStream.
   */
  tap(handler: (value: T) => void): IEventStream<T>;

  /**
   * Subscribes to the stream. If any of the `filter` operators chained returns false, the value is skipped and the handler is not called.
   * @param handler - The handler function to call with the value.
   * @returns
   */
  subscribe(handler: (value: T) => void): VoidFunction;
}

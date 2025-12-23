/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SKIP,
  type IEventStream,
  type Operator,
  type SkipOperatorSymbol,
  type SubscribeFn,
} from "./IEventStream";

const skipOperator = (): SkipOperatorSymbol => SKIP;

// TODO: Add error channel. So that users can easily handle errors declaratively. This is the last piece of the puzzle until around version 2.0.0 where the users will be able to pass their own EventStream implementation through the Editor composition root class constructor.
export class EventStream<T> implements IEventStream<T> {
  /**
   * @param subscribeFn - The function to subscribe to the stream.
   * @param operators - The operators to apply to the stream.
   */
  constructor(
    protected readonly subscribeFn: SubscribeFn<T>,
    protected readonly operators: Operator<any, any>[] = [],
  ) {}

  public filter(
    predicate: (value: T) => boolean | null | undefined,
  ): IEventStream<T> {
    const newOperator: Operator<T, T | SkipOperatorSymbol> = (value, skip) =>
      predicate(value) ? value : skip();

    return new EventStream<T>(this.subscribeFn, [...this.operators, newOperator]);
  }

  public map<U>(transformer: (value: T) => U): IEventStream<U> {
    const newOperator: Operator<T, U> = value => transformer(value);
    const parentSubscribeFn = this.subscribeFn;
    const parentOperators = [...this.operators, newOperator];

    const newSubscribeFn: SubscribeFn<U> = handler => {
      return parentSubscribeFn(value => {
        let current: any = value;

        for (const operator of parentOperators) {
          current = operator(current, skipOperator);

          if (current === SKIP) {
            return;
          }
        }

        handler(current);
      });
    };

    return new EventStream<U>(newSubscribeFn, []);
  }

  public tap(handler: (value: T) => void): IEventStream<T> {
    const newOperator: Operator<T, T> = value => {
      handler(value);
      return value;
    };

    return new EventStream<T>(this.subscribeFn, [...this.operators, newOperator]);
  }

  public subscribe(handler: (value: T) => void): VoidFunction {
    const pipedHandler = (value: T): void => {
      let currentValue: T = value;

      for (const operator of this.operators) {
        currentValue = operator(currentValue, skipOperator);

        if (currentValue === SKIP) {
          return;
        }
      }

      handler(currentValue);
    };

    return this.subscribeFn(pipedHandler);
  }
}

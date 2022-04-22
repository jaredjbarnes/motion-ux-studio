import { useLayoutEffect, useRef } from 'react';
import { ReadonlyObservableValue } from '@neo/commons/utils/hex/ObservableValue';

/**
 *
 * @param callback Invoked when the value of an ObservableValue or
 * an AsyncActionRunner changes its value.
 * @param observableValue The ObservableValue or AsyncActionRunner to watch.
 * ```ts
 * function MyComponent(){
 *  const mediator = useMediator();
 *
 *  // This callback is called when the observable value changes.
 *  useAsyncValueEffect(() => {
 *    // Perhaps update state and perhaps not.
 *  }, mediator.someObservableValue);
 * }
 * ```
 */
export function useAsyncValueEffect<TValue, TInitial = TValue>(
  callback: (value: TValue | TInitial) => void,
  observableValue: ReadonlyObservableValue<TValue, TInitial>
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    const subscription = observableValue.onChange(value => {
      callbackRef.current(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [observableValue]);

  useLayoutEffect(() => {
    callbackRef.current(observableValue.getValue());
  }, [observableValue]);
}

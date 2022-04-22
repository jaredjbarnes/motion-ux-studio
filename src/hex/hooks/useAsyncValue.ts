import { useLayoutEffect } from 'react';
import { ReadonlyObservableValue } from '@neo/commons/utils/hex/ObservableValue';
import { useUpdate } from '@neo/commons/hooks/useUpdate';

/**
 * This hook allows you subscribe to an ObservableValue and AsyncActionRunner.
 * @param observableValue The value to watch.
 *
 * ```ts
 * function MyComponent(){
 *  const mediator = useMediator();
 *  // This forces a rerender whenever the observable value changes.
 *  const value = useAsyncValue(mediator.someObservableValue);
 *
 *  return <div>{value}</div>
 * }
 * ```
 */
export function useAsyncValue<TValue, TInitial = TValue>(
  observableValue: ReadonlyObservableValue<TValue, TInitial>
) {
  const update = useUpdate();

  useLayoutEffect(() => {
    const subscription = observableValue.onChange(update);
    return () => subscription.unsubscribe();
  }, [observableValue, update]);

  return observableValue.getValue();
}

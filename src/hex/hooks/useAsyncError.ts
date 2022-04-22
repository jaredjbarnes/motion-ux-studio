import { useLayoutEffect } from 'react';
import { ReadonlyObservableValue } from '@neo/commons/utils/hex/ObservableValue';
import { useUpdate } from '@neo/commons/hooks/useUpdate';

/**
 * The error of the observable value or null to signify it doesn't have an error.
 * This can be used on both ObservableValues and AsyncActionRunners.
 * @param observableValue The ObservableValue or AsyncActionRunner to be observing for errors.
 *
 * ## Example
 *
 * ```tsx
 * function MyComponent(){
 *  const mediator = useMediator();
 *  const error = useAsyncError(mediator.someObservableValue);
 *
 *  if (error == null){
 *    return null;
 *  }
 *
 *  return <div>{error.message}</div>
 * }
 * ```
 */
export function useAsyncError<TError>(
  observableValue: ReadonlyObservableValue<any, any, TError>
) {
  const update = useUpdate();

  useLayoutEffect(() => {
    const subscription = observableValue.onError(update);
    return () => subscription.unsubscribe();
  }, [observableValue, update]);

  return observableValue.getError();
}

import { useRef, useState } from 'react';
import {
  ReadonlyAsyncActionRunner,
  Status,
} from '@neo/commons/utils/hex/AsyncActionRunner';
import { StatusHelper } from './useAsyncStatus';
import { useAsyncValueEffect } from '@neo/commons/utils/hex/hooks/useAsyncValueEffect';

/**
 * An effect that invokes a callback when the status changes.
 * @param callback Invoked when the status of an AsyncActionRunner changes.
 * @param runner The AsyncActionRunner to watch.
 *
 * ```tsx
 * function MyComponent(){
 *  const mediator = useMediator();
 *
 *  // This callback is called when the runners status changes.
 *  useAsyncStatusEffect(() => {
 *    // Perhaps update state and perhaps not.
 *  }, mediator.someAsyncActionRunner);
 * }
 * ```
 */
export function useAsyncStatusEffect(
  callback: (value: StatusHelper) => void,
  runner: ReadonlyAsyncActionRunner<any, any, any>
) {
  const callbackRef = useRef(callback);

  // We use the same object to reduce memory churn.
  const [statusObject] = useState<StatusHelper>(() => {
    return {
      status: Status.INITIAL,
      isInitial: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      isDisabled: false,
    };
  });

  return useAsyncValueEffect(status => {
    statusObject.status = status;
    statusObject.isInitial = status === Status.INITIAL;
    statusObject.isPending = status === Status.PENDING;
    statusObject.isSuccess = status === Status.SUCCESS;
    statusObject.isError = status === Status.ERROR;
    statusObject.isDisabled = status === Status.DISABLED;

    callbackRef.current(statusObject);
  }, runner.status);
}

import { useState } from 'react';
import { useAsyncValue } from './useAsyncValue';
import {
  ReadonlyAsyncActionRunner,
  Status,
} from '@neo/commons/utils/hex/AsyncActionRunner';
import { ReadonlyObservableValue } from '@neo/commons/utils/hex/ObservableValue';

export interface StatusHelper {
  status: Status;
  isInitial: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isDisabled: boolean;
}

/**
 * This will return the status of the runner. The values will be one of the following:
 * * "initial"
 * * "pending"
 * * "error"
 * * "success"
 * * "disabled"
 *
 * This is useful feedback when using async runners.
 *
 * @param runner The AsyncActionRunner to watch.
 * ## Example
 *
 * ```tsx
 * function MyComponent(){
 *  const mediator = useMediator();
 *  const status = useAsyncStatus(mediator.someObservableValue);
 *
 *  return <div>{status.name}<div>;
 * }
 * ```
 */
export function useAsyncStatus(
  runner:
    | ReadonlyAsyncActionRunner<any, any, any>
    | ReadonlyObservableValue<Status, Status, any>
) {
  const status = useAsyncValue('status' in runner ? runner.status : runner);

  // We use the same object to reduce memory churn.
  const [statusObject] = useState<StatusHelper>(() => ({
    status: status,
    isInitial: status === Status.INITIAL,
    isPending: status === Status.PENDING,
    isSuccess: status === Status.SUCCESS,
    isError: status === Status.ERROR,
    isDisabled: status === Status.DISABLED,
  }));

  statusObject.status = status;
  statusObject.isInitial = status === Status.INITIAL;
  statusObject.isPending = status === Status.PENDING;
  statusObject.isSuccess = status === Status.SUCCESS;
  statusObject.isError = status === Status.ERROR;
  statusObject.isDisabled = status === Status.DISABLED;

  return statusObject;
}

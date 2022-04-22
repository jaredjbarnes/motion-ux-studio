import { ReadonlyObservableValue } from './ObservableValue';

/**
 * When each of the supplied observables has changed, the returned promise resolves
 * @param observables observables to monitor
 * @returns Promise<void>
 */
export function when(...observables: ReadonlyObservableValue<any>[]) {
  return new Promise<void>(resolve => {
    const changed: ReadonlyObservableValue<any>[] = [];
    const checkComplete = () => {
      if (changed.length === observables.length) {
        resolve();
      }
    };

    observables.forEach(observable => {
      observable.onChange(() => {
        if (!changed.includes(observable)) {
          changed.push(observable);
          checkComplete();
        }
      });
    });
  });
}

/**
 * When each of the supplied observables has been changed as a consequence of running
 * the supplied function, the returned promise is resolved.
 * @param action function to execute that will trigger a change in the observables
 * @param observables variadic list of observables to monitor
 * @returns Promise<void>
 */
export function watch(
  action: () => void,
  ...observables: ReadonlyObservableValue<any>[]
) {
  return new Promise<void>(resolve => {
    when(...observables).then(resolve);
    action();
  });
}

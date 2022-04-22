import { combineLatest } from 'rxjs';
import {
  ObservableValue,
  ReadonlyObservableValue,
} from '@neo/commons/utils/hex/ObservableValue';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

/**
 * Used to construct a new Observable Value that is derived from other Observable values
 * Useful when a value is entirely dependent on other OVs rather than being set from events
 * @param sources
 * Observable values to derive new OV from
 * @param  callback
 * A function to map the values from sources to
 *  @param  compare
 * An optional function to optimize and decide if the mapped OV has changed
 * Otherwise the mapped OV will emit any time one of the sources emits
 * @example
 * const leftHandValueObservable = new ObservableValue<number>(4)
 * const rightHandValueObservable = new ObservableValue<number>(10)
 * const product = ObservableMemo(
 *    [leftHandValueObservable, rightHandValueObservable],
 *    ( [left, right] ) => {
 *        return left * right
 *    }
 * )
 * console.log(product.getValue()) -> "40"
 *
 * leftHandValueObservable.setValue(10)
 * console.log(product.getValue()) -> "100"
 *
 */
export function ObservableMemo<O1, R>(
  sources: [ReadonlyObservableValue<O1>],
  callback: (sources: [O1]) => R,
  compare?: (a: R, b: R) => boolean
): ObservableValue<R>;
export function ObservableMemo<O1, O2, R>(
  sources: [ReadonlyObservableValue<O1>, ReadonlyObservableValue<O2>],
  callback: (sources: [O1, O2]) => R,
  compare?: (a: R, b: R) => boolean
): ObservableValue<R>;
export function ObservableMemo<O1, O2, O3, R>(
  sources: [
    ReadonlyObservableValue<O1>,
    ReadonlyObservableValue<O2>,
    ReadonlyObservableValue<O3>
  ],
  callback: (sources: [O1, O2, O3]) => R,
  compare?: (a: R, b: R) => boolean
): ObservableValue<R>;
export function ObservableMemo<O1, O2, O3, O4, R>(
  sources: [
    ReadonlyObservableValue<O1>,
    ReadonlyObservableValue<O2>,
    ReadonlyObservableValue<O3>,
    ReadonlyObservableValue<O4>
  ],
  callback: (sources: [O1, O2, O3, O4]) => R,
  compare?: (a: R, b: R) => boolean
): ObservableValue<R>;
// Lots of overloads to keep <const> typing on arrays
// More overloads can be added if larger arrays are needed for memoization
export function ObservableMemo(sources, callback, compare) {
  return ObservableValue.from(
    // combine sources to one Subject
    // If any of the dependent Observables changes the output needs recalculated
    combineLatest(
      sources.map((ov: ReadonlyObservableValue<unknown>) =>
        ov.observable.pipe(startWith(ov.getValue()))
      )
    )
      // map the combined subject to desired value
      .pipe(map(callback))
      // optionally optimize emits from new Observable
      // Will only emit the new Observable if it has a unique value
      // If the sources change, but calculate the same value no emission will be made
      .pipe(distinctUntilChanged(compare)),
    // Sets initial value of new OV
    callback(sources.map((ov: ReadonlyObservableValue<unknown>) => ov.getValue()))
  );
}

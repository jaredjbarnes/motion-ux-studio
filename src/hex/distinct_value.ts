import { ObservableValue, ObservableValueOptions } from './ObservableValue';

const defaultCompareFunction = (o: unknown, n: unknown) => o === n;

export class DistinctValue<T, TInitial = T, TError = unknown> extends ObservableValue<
  T,
  TInitial,
  TError
> {
  private compareFunction: (oldValue: T | TInitial, newValue: T) => boolean;

  constructor(
    initialValue: T | TInitial,
    equalityOperator: (
      oldValue: T | TInitial,
      newValue: T
    ) => boolean = defaultCompareFunction,
    options: ObservableValueOptions<T, TInitial, TError> = {}
  ) {
    super(initialValue, options);
    this.compareFunction = equalityOperator;
  }

  setValue(value: T, key?: string) {
    if (!this.compareFunction(this._value, value)) {
      super.setValue(value, key);
      return true;
    }
    return false;
  }
}

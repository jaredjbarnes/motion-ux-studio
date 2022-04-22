import { DistinctValue } from './distinct_value';
import { Subscription } from 'rxjs';
import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';

type ObservableValueArray = readonly ObservableValue<any>[];

export class ComputedValue<
  T,
  TError,
  TArray extends ObservableValueArray
> extends DistinctValue<T, T, TError> {
  private values: TArray;
  private subscriptions: Subscription[];

  constructor(compute: (...values: [...TArray]) => T, ...values: [...TArray]) {
    const initial = compute.call(null, ...values);
    super(initial);

    this.values = values;
    this.subscriptions = this.values.map(v =>
      v.onChange(() => {
        this.setValue(compute.call(null, ...values));
      })
    );
  }

  dispose() {
    super.dispose();
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

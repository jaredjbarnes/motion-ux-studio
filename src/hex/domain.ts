import {
  AsyncActionRunner,
  ReadonlyAsyncActionRunner,
} from '@neo/commons/utils/hex/AsyncActionRunner';
import ObservableValue, {
  ReadonlyObservableValue,
} from '@neo/commons/utils/hex/ObservableValue';

export type Unwrap<T> = T extends ReadonlyObservableValue<infer TValue, infer TInitial>
  ? TValue | TInitial
  : never;

export type UnwrapObservable<T> = T extends AsyncActionRunner<
  infer TValue,
  infer TInitial,
  infer TError
>
  ? AsyncActionRunner<TValue, TInitial, TError>
  : T extends ObservableValue<infer TValue, infer TInitial, infer TError>
  ? ObservableValue<TValue, TInitial, TError>
  : ObservableValue<never, never, never>;

export type UnwrapProtectedObservable<T> = T extends AsyncActionRunner<
  infer TValue,
  infer TInitial,
  infer TError
>
  ? ReadonlyAsyncActionRunner<TValue, TInitial, TError>
  : T extends ObservableValue<infer TValue, infer TInitial, infer TError>
  ? ReadonlyObservableValue<TValue, TInitial, TError>
  : ObservableValue<never, never, never>;

export type State<T extends StateLike> = {
  [P in keyof T]: UnwrapObservable<T[P]>;
};

export type Broadcasts<T extends StateLike> = {
  [P in keyof T]: UnwrapProtectedObservable<T[P]>;
};

export type ReadonlyStateValues<T extends StateLike> = {
  +readonly [P in keyof T]: Unwrap<T[P]>;
};

export type StateValues<T extends StateLike> = {
  [P in keyof T]: Unwrap<T[P]>;
};

export type StateLike = Record<string | number | symbol, ObservableValue<any>>;
export class Domain<T extends StateLike> {
  // We reuse this property to prevent GC.
  // It is casted as StateValues<T> since it has to be mapped from state (starts as an empty object)
  private _values = {} as StateValues<T>;
  protected state: State<T>;

  get broadcasts(): Broadcasts<T> {
    return this.state;
  }

  constructor(state: T) {
    this.state = state as unknown as State<T>;
  }

  get values(): ReadonlyStateValues<T> {
    Object.keys(this.state).forEach(key => {
      (this._values as any)[key] = this.state[key].getValue();
    });

    return this._values;
  }

  dispose() {
    Object.keys(this.state).forEach(key => {
      this.state[key].dispose();
    });
  }
}

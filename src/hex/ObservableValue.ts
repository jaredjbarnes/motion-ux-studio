import { Subject, Observer, Observable, Subscription } from 'rxjs';

const defaultSetter = (value: any) => {
  return value;
};

export interface ObservableValueOptions<T, TInitial = T, TError = any> {
  key?: string;
  setter?: (newValue: T | TInitial, instance: ObservableValue<T, TInitial, TError>) => T;
}

/**
 * ObservableValue class stores a value and notifies interested
 * parties when the value changes.
 *
 * This is often used as a property on a class that other classes
 * may be interested in.
 *
 * Because this is used as a complex property of sorts. It would
 * need some of the functionality of getters and setters, namely:
 * public get,
 * public set,
 * or
 * public get,
 * private set,
 *
 * The default behavior of ObservableValues gives you the public
 * getter and public setter.
 *
 * ```ts
 *
 * const name = new Observable("John", "MY_SECRET_KEY");
 * name.setValue("Jared"); // Notifies parties the value changed
 *
 * ```
 *
 * If you want to make the setter private you can supply the key at
 * construction, and this will make the setter need a key to set the
 * value or the error.
 *
 * ```ts
 *
 * const name = new Observable("John", "MY_SECRET_KEY");
 * name.setValue("Jared"); // throw error
 * name.setValue("Jared", "MY_SECRET_KEY"); // Notifies parties the value changed
 *
 * ```
 */
export class ObservableValue<T, TInitial = T, TError = any>
  implements ReadonlyObservableValue<T, TInitial, TError>
{
  protected setter: (
    newValue: T | TInitial,
    instance: ObservableValue<T, TInitial, TError>
  ) => T;
  protected key: string | undefined;

  readonly valueSubject = new Subject<T>();
  protected _value: T | TInitial;

  readonly errorSubject = new Subject<TError | null>();
  protected _error: TError | null = null;

  private readonly _observer = {
    next: (value: T) => this.setValue(value),
    error: (error: TError | null) => this.setError(error),
    complete: () => {},
  };

  constructor(
    initialState: T | TInitial,
    options?: ObservableValueOptions<T, TInitial, TError>
  ) {
    this._value = initialState;
    this.key = options?.key;
    this.setter = typeof options?.setter === 'function' ? options.setter : defaultSetter;
  }

  getValue() {
    return this._value;
  }

  setValue(value: T, key?: string) {
    // If we aren't secure then set the value.
    if (!this.isSecure()) {
      try {
        this._value = this.setter(value, this);
        this.valueSubject.next(value);
      } catch (e) {
        this.setError(e);
      }
      return;
    }

    // If we are secure and the key is correct then set the value.
    // Otherwise notify the developer they are trying to set a value
    // they need a key for.
    if (this.isSecure() && this.isCorrectKey(key)) {
      try {
        this._value = this.setter(value, this);
        this.valueSubject.next(value);
      } catch (e) {
        this.setError(e);
      }

      return;
    } else {
      throw new Error(
        'You cannot set the value of a secure observable value without the correct key.'
      );
    }
  }

  transformValue(cb: (val: T | TInitial) => T, key?: string) {
    const value = cb(this._value);
    this.setValue(value, key);
  }

  setError(e: TError | null, key?: string) {
    if (!this.isSecure()) {
      this._error = e;
      this.errorSubject.next(e);
      return;
    }

    if (this.isSecure() && this.isCorrectKey(key)) {
      this._error = e;
      this.errorSubject.next(e);
      return;
    } else {
      throw new Error(
        'You cannot set the error of a secure observable value without the correct key.'
      );
    }
  }

  private isSecure() {
    return typeof this.key === 'string';
  }

  private isCorrectKey(key: string | undefined) {
    return this.key === key;
  }

  getError() {
    return this._error;
  }

  onError(callback: (e: TError | null) => void) {
    return this.errorSubject.subscribe({ next: callback });
  }

  onChange(callback: (value: T) => void) {
    return this.valueSubject.subscribe({ next: callback });
  }

  /**
   * ADVANCED FEATURE
   * Use this when piping values to another existing `ObservableValue` like:
   *
   * ```ts
   * getUserRunner = new AsyncActionRunner<User, null>(null);
   * userName = new ObservableValue<string, null>(null);
   *
   * constructor() {
   *    this.getUserRunner.valueSubject
   *      .pipe(map(user => user.name))
   *      .subscribe(this.userName.getObserver());  <----- You can pipe values to another ObservableValue.
   * }
   * ```
   */

  getObserver(): Observer<T> {
    return this._observer;
  }

  // Create a new observable with the value subject as the source, this will conceal logic of the subject
  get observable() {
    return this.valueSubject.asObservable();
  }

  dispose() {
    this.valueSubject.complete();
    this.errorSubject.complete();
  }

  /**
   * Easier way to pipe from one ObservableValue to another through rxjs operators.
   *
   * Example (inside a mediator/class):
   * ```typescript
   *  readonly elapsedThrottledSeconds = ObservableValue.from(
   *    this.elapsedSeconds.valueSubject.pipe(throttleTime(200)),
   *    this.elapsedSeconds.getValue()
   *  );
   * ```
   * @param observable any Observable (generally from a rxjs pipe though)
   * @param initialValue
   */
  static from<T, TInitial>(
    observable: Observable<T | TInitial>,
    initialValue: T | TInitial
  ) {
    const observableValue = new ObservableValue(initialValue);
    observable.subscribe(observableValue.getObserver());
    return observableValue;
  }
}

export interface ReadonlyObservableValue<T, TInitial = T, TError = any> {
  getValue(): T | TInitial;
  getError(): TError | null;
  onError(callback: (e: TError | null) => void): Subscription;
  onChange(callback: (value: T) => void): Subscription;
  observable: Observable<T>;
  /**
   * ADVANCED FEATURE
   * Use this when piping values to another existing `ObservableValue` like:
   *
   * ```ts
   * getUserRunner = new AsyncActionRunner<User, null>(null);
   * userName = new ObservableValue<string, null>(null);
   *
   * constructor() {
   *    this.getUserRunner.valueSubject
   *      .pipe(map(user => user.name))
   *      .subscribe(this.userName.getObserver());  <----- You can pipe values to another ObservableValue.
   * }
   * ```
   */
  getObserver(): Observer<T>;
}

export default ObservableValue;

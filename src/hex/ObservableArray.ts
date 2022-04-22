import { ObservableValue } from './ObservableValue';
import copy from 'fast-copy';

/**
 * Meet ObservableValue's cool cousin.
 * Like `ObservableValue` but made for one value type: an array.
 * Provides many helpful utilities for managing array state like filtering, appending, etc.
 * See the individual methods for more detailed explainations.
 *
 * Unlike the base class, `ObservableValue`, this classes `getValue` method,
 * returns a shallow clone via `Array.slice` of the array. This is primarily to help avoid
 * common mutation related bugs.
 *
 * For other cloning options see `ObservableArray.clone`.
 */
export class ObservableArray<TValue> extends ObservableValue<TValue[]> {
  private initialValue: TValue[];

  constructor(initialArray?: TValue[]) {
    const array: TValue[] = Array.isArray(initialArray) ? initialArray : [];
    super(array);
    this.initialValue = copy(array);
  }

  /**
   * Returns a shallow copy (via slice) of the stored array.
   */
  getValue() {
    return this._value.slice();
  }

  /**
   * Like Array.unshift(). Places the given items on the beginning of the array.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello']);
   *  obvArray.prepend('new item', 'another new item');
   *  obvArray.getValue(); // ['new item', 'another new item', 'hi', 'hello']
   * ```
   *
   * @param items - items to place into the array.
   */
  // #region modifiers
  prepend(...items: TValue[]) {
    const array = this._value;
    array.unshift(...items);
    this.setValue(array);
    return this;
  }

  /**
   * Like Array.push(). Places the given items on the end of the array.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello']);
   *  obvArray.prepend('herp', 'derp');
   *  obvArray.getValue(); // ['hi', 'hello', 'herp', 'derp']
   * ```
   *
   * @param items - items to place into the array.
   */
  append(...items: TValue[]) {
    const array = this._value;
    array.push(...items);
    this.setValue(array);
    return this;
  }

  /**
   * Like Array.concat(). Concatinates the given array with the existing array into a new array.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello']);
   *  obvArray.concat(['herp', 'derp']);
   *  obvArray.getValue(); // ['hi', 'hello', 'herp', 'derp']
   * ```
   *
   * @param items - items to concat into a new array.
   */
  concat(array: TValue[]) {
    const currentArray = this._value;
    const newArray = currentArray.concat(array);
    this.setValue(newArray);
    return this;
  }

  /**
   * Like Array.splice(). Replaces items from a given index to another index with the provided items.
   * The toIndex means up TO that index (non-inclusive).
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.replaceItems(1, 2, 'boom', 'bang', 'wow');
   *  obvArray.getValue(); // ['hi', 'boom', 'bang', 'wow', 'herp', 'derp']
   * ```
   *
   * @param fromIndex - starting index
   * @param toIndex - ending index (non-inclusive)
   * @param items - items to splice into the array
   */
  replaceItems(fromIndex: number, toIndex: number, ...items: TValue[]) {
    if (fromIndex < 0) {
      return this;
    }
    const array = this._value;
    const amount = Math.max(0, toIndex - fromIndex);
    array.splice(fromIndex, amount, ...items);
    this.setValue(array);
    return this;
  }

  /**
   * Replaces a single item by index with the given item.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.replaceItems(1, 'wow');
   *  obvArray.getValue(); // ['hi', 'wow', 'herp', 'derp']
   * ```
   *
   * @param index - index of item to replace.
   * @param item - item to replace the given index.
   */
  replace(index: number, item: TValue) {
    return this.replaceItems(index, index + 1, item);
  }

  /**
   * Like Array.copyWithin - shallow copies part of the array to another location in
   * the same array without modifying its length.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.copyWithin(0, 2, 3);
   *  obvArray.getValue(); // ['herp', 'hello', 'herp', 'derp']
   * ```
   *
   * @param target If target is negative, it is treated as length+target where length is the
   * length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it
   * is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(target: number, start: number, end?: number | undefined) {
    const array = this._value;
    array.copyWithin(target, start, end);

    this.setValue(array);
    return this;
  }

  /**
   * Insert an item based on a predicate. If predicate never returns true, new item is appended to the array.
   *
   * Example - predicate succeeds:
   *
   * ```typescript
   *  const obvArray = new ObservableArray([
   *    {id: 1, label: 'hi'},
   *    {id: 2, label: 'herp'},
   *    {id: 3, label: 'derp'}
   *  ]);
   *
   *  obvArray.upsert(
   *    (item, newItem) => item.id === newItem.id,
   *    { id: 2, label: 'howdy' }
   * );
   *
   *  obvArray.getValue();
   * // [
   * //   {id: 1, label: 'hi'},
   * //   {id: 2, label: 'howdy'},
   * //   {id: 3, label: 'derp'}
   * // ]
   * ```
   *
   * Example - predicate fails:
   *
   * ```typescript
   *  const obvArray = new ObservableArray([
   *    {id: 1, label: 'hi'},
   *    {id: 2, label: 'herp'},
   *    {id: 3, label: 'derp'}
   *  ]);
   *
   *  obvArray.upsert(
   *    (item, newItem) => item.id === newItem.id,
   *    { id: 4, label: 'howdy' }
   * );
   *
   *  obvArray.getValue();
   * // [
   * //   {id: 1, label: 'hi' },
   * //   { id: 2, label: 'herp' },
   * //   { id: 3, label: 'derp' },
   * //   { id: 4, label: 'howdy' },
   * // ]
   * ```
   *
   * @param predicate Function used to determine if the newItem should be upserted. Return true to upsert the item to that position.
   * @param newItem The item to upsert.
   */
  upsert(
    predicate: (item: TValue, newItem: TValue, index: number, obj: TValue[]) => boolean,
    newItem: TValue
  ) {
    const index = this._value.findIndex((item, index, obj) => {
      return predicate(item, newItem, index, obj);
    });

    if (index === -1) {
      this.append(newItem);
    } else {
      this.replace(index, newItem);
    }
  }

  /**
   * Like Array.fill - changes all elements in an array to a static value, from a start
   * index (default 0) to an end index (default array.length). End index is inclusive.
   *
   * Example:
   * ```typescript
   *  someObservableArray.getValue(); // ['hi', 'hello', 'herp', 'derp']
   *
   *  someObservableArray.copyWithin('DERP', 0, 1);
   *
   *  someObservableArray.getValue(); // ['DERP', 'DERP', 'herp', 'derp']
   * ```
   *
   * @param value value to fill array section with
   * @param start index to start filling the array at. If start is negative, it is treated as length+start where length is the length of the array.
   * @param end index to stop filling the array at. If end is negative, it is treated as length+end.
   */
  fill(value: TValue, start?: number, end?: number) {
    const array = this._value;
    array.fill(value, start, end);
    this.setValue(array);

    return this;
  }

  /**
   * Inserts an item before the given index.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.insertBefore(1, 'DERP');
   *  obvArray.getValue(); // ['hi', 'DERP', 'hello', 'herp', 'derp']
   * ```
   *
   * @param index Index to insert before
   * @param item Item to insert.
   */
  insertBefore(index: number, item: TValue) {
    return this.replaceItems(index, index, item);
  }

  /**
   * Inserts an item after the given index.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.insertBefore(1, 'DERP');
   *  obvArray.getValue(); // ['hi', 'hello', 'DERP', 'herp', 'derp']
   * ```
   *
   * @param index Index to insert after
   * @param item Item to insert.
   */
  insertAfter(index: number, item: TValue) {
    return this.replaceItems(index + 1, index + 1, item);
  }

  /**
   * Like Array.shift - Removes the first item from an array
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.removeFirst();
   *  obvArray.getValue(); // ['hello', 'herp', 'derp']
   * ```
   */
  removeFirst() {
    const array = this._value;
    const result = array.shift();
    this.setValue(array);
    return result;
  }

  /**
   * Like Array.pop - Removes the last item from an array
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.removeLast();
   *  obvArray.getValue(); // ['hi', 'hello', 'herp']
   * ```
   */
  removeLast() {
    const array = this._value;
    const result = array.pop();
    this.setValue(array);
    return result;
  }

  /**
   * Remove an item at the given index.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.removeAt(2);
   *  obvArray.getValue(); // ['hi', 'hello', 'derp']
   * ```
   */
  removeAt(index: number) {
    return this.replaceItems(index, index + 1);
  }

  /**
   * Removes the first item that matches the provided check
   * If no item is found, the array will remain untouched
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.remove( item => item === 'herp');
   *  obvArray.getValue(); // ['hi', 'hello', 'derp']
   * ```
   */
  remove(callback: (item: TValue) => boolean) {
    const index = this.getValue().findIndex(callback);
    return this.removeAt(index);
  }

  /**
   * Clear the array of all items.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.clear();
   *  obvArray.getValue(); // []
   * ```
   */
  clear() {
    this.setValue([]);
    return this;
  }

  /**
   * Reset the array back to the initial value passed to the constructor.
   *
   * Example:
   * ```typescript
   *
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  someObservableArray.getValue(); // ['hi', 'hello', 'herp', 'derp']
   *  obvArray.clear();
   *  obvArray.getValue(); // [];
   *  obvArray.reset();
   *  obvArray.getValue(); // ['hi', 'hello', 'herp', 'derp']
   * ```
   */
  reset() {
    this.setValue(this.initialValue);
    return this;
  }

  /**
   * Like Array.sort - except the compare function is required - Sorts the array.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *
   *  // Sort shortest to longest lengths.
   *  obvArray.sort((a, b) => {
   *   if (a.length < b.length) {
   *     return -1;
   *   } else if (a.length > b.length) {
   *     return 1;
   *   } else {
   *     return 0;
   *   }
   *  });
   *
   *  obvArray.getValue(); // ['hi', 'herp', 'derp', 'hello']
   * ```
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to return
   * a negative value if first argument is less than second argument, zero if they're equal and a positive
   * value otherwise.
   */
  sort(compareFn: (a: TValue, b: TValue) => number) {
    const array = this._value;
    array.sort(compareFn);
    this.setValue(array);
    return this;
  }

  /**
   * Order the array by iteratee(s) returned from given callback function. Optionally specify
   * ascending / descending order for each iteratee.
   *
   * Example:
   * ```typescript
   *  new obvArray = new ObservableArray([
   *    { name: "Jared", age: 30, dateOfBirth: new Date("06/11/1990") },
   *    { name: "Justin", age: 41, dateOfBirth: new Date("06/11/1980") },
   *    { name: "Jared", age: 38, dateOfBirth: new Date("06/11/1982") },
   *    { name: "Gunnar", age: 31, dateOfBirth: new Date("06/11/1989") }
   *  ]);
   *
   *  // Sort by name property ascending, then age property descending.
   *  obvArray.orderBy(user => [user.name, user.age], ['asc', 'desc']);
   *
   *  obvArray.getValue();
   *  // [
   *  // { name: "Gunnar", age: 31, dateOfBirth: new Date("06/11/1989") }
   *  // { name: "Jared", age: 38, dateOfBirth: new Date("06/11/1982") },
   *  // { name: "Jared", age: 30, dateOfBirth: new Date("06/11/1990") },
   *  // { name: "Justin", age: 41, dateOfBirth: new Date("06/11/1980") },
   *  // ]
   * ```
   *
   * @param selectorfn Function used to determine which item to sort on.
   * @param directions - optional, defaults all to ascending - specify for each selector returned from the selectorfn which direction to sort (ascending or descending).
   */

  orderBy(
    selectorfn: (item: TValue) => (number | string)[],
    directions: ('ASC' | 'DESC')[] = []
  ) {
    const sortFn = (itemA: TValue, itemB: TValue) => {
      const valuesA = selectorfn(itemA);
      const valuesB = selectorfn(itemB);

      for (let x = 0; x < valuesA.length; x++) {
        const direction = directions[x] === 'DESC' ? -1 : 1;

        let cellA = valuesA[x];
        let cellB = valuesB[x];

        if (typeof cellA === 'string') {
          cellA = cellA.toLowerCase();
        }

        if (typeof cellB === 'string') {
          cellB = cellB.toLowerCase();
        }

        if (cellA < cellB) {
          return -1 * Number(direction);
        } else if (cellA > cellB) {
          return 1 * Number(direction);
        } else {
          if (x + 1 === directions.length) {
            return 0;
          }
        }
      }
      return -1;
    };

    return this.sort(sortFn);
  }

  /**
   * Like Array.reverse - reverses the array.
   *
   * Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.reverse();
   *  obvArray.getValue(); // ['derp', 'herp', 'hello', 'hi']
   * ```
   */
  reverse() {
    const array = this._value;
    array.reverse();
    this.setValue(array);
    return this;
  }

  /**
   * Sets the elements of the array that meet the condition specified in a callback function.
   *
   *  Example:
   * ```typescript
   *  const obvArray = new ObservableArray(['hi', 'hello', 'herp', 'derp']);
   *  obvArray.filter(str => str.length > 4);
   *  obvArray.getValue(); // ['hello']
   * ```
   *
   * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    callbackfn: (value: TValue, index: number, array: TValue[]) => boolean,
    thisArg?: any
  ) {
    const filtered = this._value.filter(callbackfn, thisArg);
    this.setValue(filtered);
    return this;
  }

  /**
   * Returns the first item in the array.
   */
  getFirst() {
    return this.get(0);
  }

  /**
   * Returns the last item in the array.
   */
  getLast() {
    const array = this._value;
    return this.get(array.length - 1);
  }

  /**
   * Gets an item from the array by its index.
   * @param index The index of the item you want to get.
   */
  get(index: number) {
    const array = this._value;
    return typeof array[index] === 'undefined' ? null : array[index];
  }

  /**
   * Clones the array value and returns it. Default is shallow clone via Array.slice.
   * Optionally do a deep clone via `fast-copy` by passing 'deep',
   * or pass in your own clone method.
   *
   * See https://github.com/planttheidea/fast-copy for `fast-copy` edge cases and caveats.
   *
   * Example (shallow):
   * ```
   *  const original = someObservableArray.getValue(); // [{ herp: 'derp' }, 'hello', 'herp', 'derp']
   *
   *  const cloned = someObservableArray.clone();
   *
   *  original === cloned // false;
   *  original[0] === cloned[0] // true; -- not deeply cloned.
   * ```
   *
   * Example (deep):
   * ```
   *  const original = someObservableArray.getValue(); // [{ herp: 'derp' }, 'hello', 'herp', 'derp']
   *
   *  const cloned = someObservableArray.clone('deep');
   *
   *  original === cloned // false;
   *  original[0] === cloned[0] // false;
   * ```
   *
   * Example (custom):
   * ```
   *  const original = someObservableArray.getValue(); // [{ herp: 'derp' }, 'hello', 'herp', 'derp']
   *
   *  const cloned = someObservableArray.clone(_.cloneDeep); // using lodash `cloneDeep`
   *
   *  original === cloned // false;
   *  original[0] === cloned[0] // false;
   * ```
   *
   * @param strategy - defaults to 'shallow'. Pass 'deep' to clone via `fast-copy` library, or pass your own clone method.
   */
  cloneArray(strategy?: 'shallow' | 'deep'): TValue[];
  cloneArray(strategy?: (arr: TValue[]) => TValue[]): TValue[];
  cloneArray(strategy: 'shallow' | 'deep' | ((arr: TValue[]) => TValue[]) = 'shallow') {
    if (strategy === 'shallow') {
      return this._value.slice();
    }

    if (strategy === 'deep') {
      return copy(this._value);
    }

    if (typeof strategy === 'function') {
      return strategy(this._value);
    }

    throw new Error('Invalid strategy for cloning array.');
  }

  /**
   * Returns length of stored array.
   */
  get length() {
    return this._value.length;
  }

  /**
   * Static method that creates a new ObservableArray instance with the given array as the initial value.
   * @param array - Array to seed new ObservableArray with.
   */
  static fromArray<T>(array: T[]) {
    return new ObservableArray(array);
  }
}

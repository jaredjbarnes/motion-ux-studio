import { ObservableArray } from '@neo/commons/utils/hex/ObservableArray';

describe('ObservableArray', () => {
  test('Construct without initial values.', () => {
    const array = new ObservableArray<number>();

    expect(array.length).toBe(0);
  });

  test('Construct with initial values.', () => {
    const array = new ObservableArray([1, 2, 3]);

    expect(array.length).toBe(3);
  });

  test('getValue returns shallow clone', () => {
    const arr = [1, 2, { three: 3 }];
    const array = new ObservableArray(arr);
    expect(arr === array.getValue()).toBe(false);
    expect(arr[2] === array.getValue()[2]).toBe(true);
  });

  test('Prepend', () => {
    const array = new ObservableArray([1, 2, 3]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.prepend(0);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(0);
    expect(array.get(3)).toBe(3);
    expect(array.length).toBe(4);
  });

  test('Append', () => {
    const array = new ObservableArray([1, 2, 3]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.append(4);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(3)).toBe(4);
    expect(array.length).toBe(4);
  });

  test('Concat', () => {
    const array = new ObservableArray([1, 2]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.concat([3, 4]);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(3)).toBe(4);
    expect(array.length).toBe(4);
  });

  test('ReplaceItems', () => {
    const array = new ObservableArray([1, 2]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.replaceItems(0, 2, 3, 4);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(3);
    expect(array.get(1)).toBe(4);
    expect(array.length).toBe(2);
  });

  test('Replace', () => {
    const array = new ObservableArray([1, 2]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.replace(1, 3);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(1)).toBe(3);
    expect(array.length).toBe(2);
  });

  test('CopyWithin', () => {
    const array = new ObservableArray([1, 2, 3]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.copyWithin(0, 2);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(3);
    expect(array.get(1)).toBe(2);
    expect(array.get(2)).toBe(3);
    expect(array.length).toBe(3);
  });

  test('Upsert - adds', () => {
    const array = new ObservableArray([1, 2, 3]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.upsert((item, newItem) => {
      return item === newItem;
    }, 4);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(1)).toBe(2);
    expect(array.get(2)).toBe(3);
    expect(array.get(3)).toBe(4);
    expect(array.length).toBe(4);
  });

  test('Upsert - inserts', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    let changed = false;

    array.onChange(() => (changed = true));
    array.upsert((item, newItem) => {
      return item === newItem;
    }, 4);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(1)).toBe(2);
    expect(array.get(2)).toBe(3);
    expect(array.get(3)).toBe(4);
    expect(array.length).toBe(4);
  });

  test('Fill', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    let changed = false;

    array.onChange(() => (changed = true));
    array.fill(5);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(5);
    expect(array.get(1)).toBe(5);
    expect(array.get(2)).toBe(5);
    expect(array.get(3)).toBe(5);
    expect(array.length).toBe(4);
  });

  test('InsertAfter', () => {
    const array = new ObservableArray([1, 2]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.insertAfter(0, 1.5);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.get(1)).toBe(1.5);
    expect(array.get(2)).toBe(2);
    expect(array.length).toBe(3);
  });

  test('InsertBefore', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.insertBefore(0, -0.5);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(-0.5);
    expect(array.get(1)).toBe(0);
    expect(array.get(2)).toBe(1);
    expect(array.length).toBe(3);
  });

  test('RemoveFirst', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.removeFirst();

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.length).toBe(1);
  });

  test('RemoveAt', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.removeAt(0);

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(1);
    expect(array.length).toBe(1);
  });

  test('Clear', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.clear();

    expect(changed).toBeTruthy();
    expect(array.length).toBe(0);
  });

  test('Reset', () => {
    const array = new ObservableArray([0, 1]);
    array.append(2);
    let changed = false;
    array.onChange(() => (changed = true));

    array.reset();

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(0);
    expect(array.get(1)).toBe(1);
    expect(array.length).toBe(2);
  });

  test('RemoveLast', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.removeLast();

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(0);
    expect(array.length).toBe(1);
  });

  test('Remove', () => {
    const array = new ObservableArray([0, 1]);
    let changed = false;
    array.onChange(() => (changed = true));

    // Doesnt find
    array.remove(item => item === 2);
    expect(changed).toBeFalsy();
    expect(array.length).toBe(2);

    // Finds and removes;
    array.remove(item => item === 1);
    expect(changed).toBeTruthy();
    expect(array.get(1)).toBe(null);
    expect(array.length).toBe(1);
  });

  test('OrderBy - numer array', () => {
    const array = new ObservableArray([3, 4, 3, 1, 2]);

    array.orderBy(num => [num], ['DESC']);

    expect(array.get(0)).toBe(4);
    expect(array.get(1)).toBe(3);
    expect(array.get(2)).toBe(3);
    expect(array.get(3)).toBe(2);
    expect(array.get(4)).toBe(1);
    expect(array.length).toBe(5);
  });

  test('OrderBy Object Property', () => {
    const array = new ObservableArray([
      { name: 'Jared', age: 38 },
      { name: 'Jared', age: 30 },
      { name: 'Justin', age: 41 },
      { name: 'Gunnar', age: 31 },
    ]);

    array.orderBy(({ name, age }) => [name, age], ['DESC']);

    expect(array.get(0)?.name).toBe('Justin');
    expect(array.get(1)?.name).toBe('Jared');
    expect(array.get(2)?.name).toBe('Jared');
    expect(array.get(3)?.name).toBe('Gunnar');

    expect(array.get(1)?.age).toBe(38);
    expect(array.get(2)?.age).toBe(30);
    expect(array.length).toBe(4);
  });

  test('Reverse', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    let changed = false;
    array.onChange(() => (changed = true));

    array.reverse();

    expect(changed).toBeTruthy();
    expect(array.get(0)).toBe(4);
    expect(array.get(1)).toBe(3);
    expect(array.get(2)).toBe(2);
    expect(array.get(3)).toBe(1);
    expect(array.length).toBe(4);
  });
  test('Slice', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    const copy = array.getValue();

    expect(copy[0]).toBe(array.get(0));
    expect(copy[1]).toBe(array.get(1));
    expect(copy[2]).toBe(array.get(2));
    expect(copy[3]).toBe(array.get(3));
    expect(copy).not.toBe(array.getValue());
    expect(copy.length).toBe(4);
  });

  test('Entries', () => {
    const array = new ObservableArray([1, 2]);
    const entries = array.getValue().entries();

    const firstEntry = entries.next().value;
    const secondEntry = entries.next().value;

    expect(firstEntry[0]).toBe(0);
    expect(firstEntry[1]).toBe(1);
    expect(secondEntry[0]).toBe(1);
    expect(secondEntry[1]).toBe(2);
  });

  test('Includes', () => {
    const array = new ObservableArray([1, 2]);
    const includes = array.getValue().includes(2);

    expect(includes).toBeTruthy();
  });

  test('IndexOf', () => {
    const array = new ObservableArray([1, 2]);
    const index = array.getValue().indexOf(2);

    expect(index).toBe(1);
  });

  test('LastIndexOf', () => {
    const array = new ObservableArray([1, 2, 2]);
    const index = array.getValue().lastIndexOf(2);

    expect(index).toBe(2);
  });

  test('Find', () => {
    const array = new ObservableArray([1, 2, 2]);
    const value = array.getValue().find(n => n === 2);

    expect(value).toBe(2);
  });

  test('FindIndex', () => {
    const array = new ObservableArray([1, 2, 2]);
    const index = array.getValue().findIndex(n => n === 2);

    expect(index).toBe(1);
  });

  test('Keys', () => {
    const array = new ObservableArray([1, 2]);
    const keys = array.getValue().keys();

    const firstKey = keys.next().value;
    const secondKey = keys.next().value;

    expect(firstKey).toBe(0);
    expect(secondKey).toBe(1);
  });

  test('GetFirst', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    const first = array.getFirst();

    expect(first).toBe(1);
  });

  test('GetLast', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    const last = array.getLast();

    expect(last).toBe(4);
  });

  test('Get', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    const item = array.get(2);

    expect(item).toBe(3);
  });

  test('Filter', () => {
    const array = new ObservableArray([1, 1, 2, 2]);
    array.filter(i => i === 1);

    const val = array.getValue();

    expect(val.length).toBe(2);
    expect(val[0]).toBe(1);
    expect(val[1]).toBe(1);
  });

  test('Clone - Shallow - num array', () => {
    const arr = [1, 2];
    const obvArray = new ObservableArray(arr);
    const clone = obvArray.cloneArray();

    expect(arr === clone).toBe(false);
    expect(clone[0]).toBe(1);
    expect(clone[1]).toBe(2);
    expect(clone.length).toBe(2);
  });

  test('Clone - Shallow - object array', () => {
    const arr = [{ one: { two: 2 } }, { three: 3 }];
    const obvArray = new ObservableArray(arr);
    const clone = obvArray.cloneArray();

    expect(arr === clone).toBe(false);
    expect(arr[0].one === clone[0].one).toBe(true);
    expect(clone[0].one?.two).toBe(2);
    expect(clone[1].three).toBe(3);
    expect(clone.length).toBe(2);
  });

  test('Clone - deep - object array', () => {
    const arr = [{ one: { two: { three: { four: [4] } } } }, { herp: 'derp' }];
    const obvArray = new ObservableArray(arr);
    const clone = obvArray.cloneArray('deep');

    expect(arr === clone).toBe(false);
    expect(arr[0].one === clone[0].one).toBe(false);
    expect(arr[0].one?.two === clone[0].one?.two).toBe(false);
    expect(arr[0].one?.two.three === clone[0].one?.two.three).toBe(false);
    expect(arr[0].one?.two.three.four === clone[0].one?.two.three.four).toBe(false);
    expect(arr[0].one?.two.three.four[0] === clone[0].one?.two.three.four[0]).toBe(true); // primitive value
    expect(clone[1].herp).toBe('derp');
    expect(clone.length).toBe(2);
  });

  test('Clone - custom strategy (JSON serialization) - object array', () => {
    const arr = [{ one: { two: { three: { four: [4] } } } }, { herp: 'derp' }];
    const obvArray = new ObservableArray(arr);
    const clone = obvArray.cloneArray(arr => JSON.parse(JSON.stringify(arr)));

    expect(arr === clone).toBe(false);
    expect(arr[0].one === clone[0].one).toBe(false);
    expect(arr[0].one?.two === clone[0].one?.two).toBe(false);
    expect(arr[0].one?.two.three === clone[0].one?.two.three).toBe(false);
    expect(arr[0].one?.two.three.four === clone[0].one?.two.three.four).toBe(false);
    expect(arr[0].one?.two.three.four[0] === clone[0].one?.two.three.four[0]).toBe(true); // primitive value
    expect(clone[1].herp).toBe('derp');
    expect(clone.length).toBe(2);
  });

  test('Clone - invalid strategy', () => {
    const obvArray = new ObservableArray();
    expect(() => obvArray.cloneArray('herp derp' as any)).toThrow();
  });

  test('Length', () => {
    const array = new ObservableArray([1, 2, 3, 4]);
    const length = array.length;

    expect(length).toBe(4);
  });

  test('From', () => {
    const array = ObservableArray.fromArray([1, 2, 3, 4]);
    const length = array.length;

    expect(array instanceof ObservableArray).toBeTruthy();
    expect(length).toBe(4);
  });
});

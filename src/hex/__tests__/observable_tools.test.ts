import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';
import { watch, when } from '@neo/commons/utils/hex/observable_tools';

describe('Observable Tools watch and when', () => {
  test('when: resolve when an observable updates', () => {
    expect.assertions(1);

    const observable = new ObservableValue<number>(0);
    window.setTimeout(() => {
      observable.setValue(1);
    }, 0);

    return when(observable).then(() => {
      expect(observable.getValue()).toBe(1);
    });
  });

  test('when: multiple observables', () => {
    expect.assertions(2);

    const o1 = new ObservableValue<number>(0);
    const o2 = new ObservableValue<number>(0);

    window.setTimeout(() => {
      o1.setValue(1);
      o2.setValue(2);
    }, 0);

    return when(o1, o2).then(() => {
      expect(o1.getValue()).toBe(1);
      expect(o2.getValue()).toBe(2);
    });
  });

  test('when: does not resolve if all observables do not change', () => {
    expect.assertions(1);

    const o1 = new ObservableValue<number>(0);
    const o2 = new ObservableValue<number>(0);
    let resolved = false;

    window.setTimeout(() => {
      o1.setValue(1);
    }, 0);

    when(o1, o2).then(() => {
      resolved = true;
    });

    // wait for a couple ms, and check that `when` never passed
    return new Promise<void>(resolve => {
      expect(resolved).toBe(false);

      window.setTimeout(() => {
        resolve();
      }, 2);
    });
  });

  test('watch: watches for a function to update some observables', async () => {
    const o1 = new ObservableValue<number>(0);
    const o2 = new ObservableValue<number>(0);

    await watch(
      () => {
        o1.setValue(1);
        o2.setValue(2);
      },
      o1,
      o2
    );

    expect(o1.getValue()).toBe(1);
    expect(o2.getValue()).toBe(2);
  });
});

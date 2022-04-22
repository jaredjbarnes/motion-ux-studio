import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';

describe('Observable Value', () => {
  test('Default', () => {
    const o = new ObservableValue(1);
    let nextValue = 0;

    o.onChange(value => {
      nextValue = value;
    });

    o.setValue(1);
    expect(nextValue).toBe(1);
  });

  test('Error', () => {
    const o = new ObservableValue(1);
    const error = new Error();
    let nextError: Error | null = null;

    o.onError(value => {
      nextError = value;
    });

    o.setError(error);
    expect(nextError).toBe(error);
  });

  test('Dispose', () => {
    const o = new ObservableValue(0);
    expect(o.getValue()).toBe(0);
    o.dispose();
  });

  test('getObserver', () => {
    const o = new ObservableValue(0);
    const observer = o.getObserver();

    observer.next(1);
    expect(o.getValue()).toBe(1);
    observer.error(new Error('BAD'));
    expect(o.getError().message).toBe('BAD');
  });

  test('Setting a value to a secure observable value without a key.', () => {
    const KEY = 'MY_SECRET_KEY';
    const o = new ObservableValue(0, { key: KEY });

    expect(() => {
      o.setValue(1);
    }).toThrow(
      'You cannot set the value of a secure observable value without the correct key.'
    );
  });

  test('Setting an error to a secure observable value without a key.', () => {
    const KEY = 'MY_SECRET_KEY';
    const o = new ObservableValue(0, { key: KEY });

    expect(() => {
      o.setError(new Error('Fake Error'));
    }).toThrow(
      'You cannot set the error of a secure observable value without the correct key.'
    );
  });

  test('Setting a value to a secure observable value with a key.', () => {
    const KEY = 'MY_SECRET_KEY';
    const o = new ObservableValue(0, { key: KEY });

    o.setValue(1, KEY);
    expect(o.getValue()).toBe(1);
  });

  test('Setting an error to a secure observable value with a key.', () => {
    const KEY = 'MY_SECRET_KEY';
    const o = new ObservableValue(0, { key: KEY });

    o.setError(new Error('Real Error'), KEY);
    expect(o.getError().message).toBe('Real Error');
  });

  test('using transformValue will setValue to be what is returned from callback', () => {
    const o = new ObservableValue('hello');

    o.transformValue(o => {
      return o + ' world';
    });

    expect(o.getValue()).toBe('hello world');
  });

  test('using setter and transforming the value', () => {
    const o = new ObservableValue('hello', {
      setter: value => {
        if (value === 'hey') {
          return 'hey is for horses';
        }
        return value;
      },
    });

    o.setValue('hey');
    expect(o.getValue()).toBe('hey is for horses');
  });

  test('throw error', () => {
    const o = new ObservableValue('hello', {
      setter: value => {
        if (value === 'hey') {
          throw new Error('Is only for horses');
        }
        return value;
      },
    });

    o.setValue('hey');
    expect(o.getError()?.message).toBe('Is only for horses');
    expect(o.getValue()).toBe('hello');
  });

  test('set error for value but let it set the value.', () => {
    const o = new ObservableValue('hello', {
      setter: (value, observableValue) => {
        if (value === 'hey') {
          observableValue.setError(new Error('You may want to rethink this.'));
        }
        return value;
      },
    });

    o.setValue('hey');
    expect(o.getError()?.message).toBe('You may want to rethink this.');
    expect(o.getValue()).toBe('hey');
  });
});

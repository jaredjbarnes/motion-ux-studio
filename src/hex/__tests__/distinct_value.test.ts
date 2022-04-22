import { DistinctValue } from '@neo/commons/utils/hex/distinct_value';

describe('DistinctValue', () => {
  test('Set the same value twice.', () => {
    const changes: string[] = [];
    const d = new DistinctValue('John');

    d.onChange(v => {
      changes.push(v);
    });
    d.setValue('Jane');
    d.setValue('Jane');

    expect(changes.length).toBe(1);
  });

  test('Alternate.', () => {
    const changes: string[] = [];
    const d = new DistinctValue('John');

    d.onChange(v => {
      changes.push(v);
    });
    d.setValue('Jane');
    d.setValue('John');
    d.setValue('Jane');

    expect(changes.length).toBe(3);
  });

  test('Conditional logic.', () => {
    const changes: string[] = [];
    const d = new DistinctValue('John');

    d.onChange(v => {
      changes.push(v);
    });

    let updated = d.setValue('John');
    if (updated) {
      d.setValue('Failed');
    } else {
      updated = d.setValue('Jane');
    }

    expect(changes.length).toBe(1);
    expect(updated).toBe(true);
    expect(changes[0]).toBe('Jane');
  });

  test('Custom equality operator.', () => {
    const changes: number[] = [];
    const d = new DistinctValue(0, (o, n) => {
      return n % 2 === 0;
    });

    d.onChange(v => {
      changes.push(v);
    });

    d.setValue(1);
    d.setValue(2);
    d.setValue(3);
    d.setValue(4);

    expect(changes.length).toBe(2);
  });
});

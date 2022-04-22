import { ComputedValue } from '@neo/commons/utils/hex/computed_value';
import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';

describe('ComputedValue', () => {
  test('Use case.', () => {
    const changes: string[] = [];
    const firstName = new ObservableValue('John');
    const lastName = new ObservableValue('Doe');

    const fullName = new ComputedValue(
      (firstName, lastName) => {
        return `${firstName.getValue()} ${lastName.getValue()}`;
      },
      firstName,
      lastName
    );

    expect(fullName.getValue()).toBe('John Doe');

    fullName.onChange(v => {
      changes.push(v);
    });

    firstName.setValue('Jane');
    lastName.setValue('Smith');

    // Set again to make sure that it only updates when the computed value is distinct.
    lastName.setValue('Smith');

    expect(changes[0]).toBe('Jane Doe');
    expect(changes[1]).toBe('Jane Smith');
    expect(changes.length).toBe(2);
  });
});

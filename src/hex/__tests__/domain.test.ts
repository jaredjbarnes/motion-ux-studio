import { StateLike, Domain } from '@neo/commons/utils/hex/domain';
import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';

interface CounterState extends StateLike {
  value: ObservableValue<number>;
  step: ObservableValue<number>;
}

class CounterDomain extends Domain<CounterState> {
  constructor() {
    super({
      value: new ObservableValue(0),
      step: new ObservableValue(1),
    });
  }

  increment() {
    this.state.value.transformValue(v => v + 1);
  }

  decrement() {
    this.state.value.transformValue(v => v - 1);
  }

  changeStep(value: number) {
    if (value <= 0) {
      return;
    }
    this.state.step.setValue(value);
  }
}
describe('Domain', () => {
  test('Basic', () => {
    let changes: number[] = [];
    const counter = new CounterDomain();
    counter.broadcasts.value.onChange(v => changes.push(v));

    counter.increment();
    expect(changes.length).toBe(1);
    expect(counter.broadcasts.value.getValue()).toBe(1);

    counter.increment();
    expect(changes.length).toBe(2);
    expect(counter.broadcasts.value.getValue()).toBe(2);

    counter.decrement();
    expect(changes.length).toBe(3);
    expect(counter.broadcasts.value.getValue()).toBe(1);
  });

  test('Dispose', () => {
    let changes: number[] = [];
    const counter = new CounterDomain();
    counter.broadcasts.value.onChange(v => {
      changes.push(v);
    });
    counter.increment();
    counter.dispose();
    counter.increment();

    expect(changes.length).toBe(1);
  });
});

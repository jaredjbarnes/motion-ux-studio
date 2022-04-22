import { AsyncAction } from '@neo/commons/utils/hex/AsyncAction';
import { AsyncActionRunner, Status } from '@neo/commons/utils/hex/AsyncActionRunner';
import { ObservableMemo } from '@neo/commons/utils/hex/ObservableMemo';
import ObservableValue from '@neo/commons/utils/hex/ObservableValue';

import { pairwise, startWith } from 'rxjs/operators';

class Count {
  value = new ObservableValue(0);

  incrememnt() {
    this.value.setValue(this.value.getValue() + 1);
  }

  decrement() {
    this.value.setValue(this.value.getValue() - 1);
  }

  reset() {
    this.value.setValue(0);
  }

  dispose() {
    this.value.dispose();
  }
}

type StatusLookup = {
  count: Count;
  lookupIndices: Record<number, number>;
};

type StatusLookupsMap = {
  [Status.DISABLED]: StatusLookup;
  [Status.ERROR]: StatusLookup;
  [Status.INITIAL]: StatusLookup;
  [Status.PENDING]: StatusLookup;
  [Status.SUCCESS]: StatusLookup;
};

export class AsyncActionRunnerQueue<T> {
  runners: AsyncActionRunner<T>[] = [];

  map: StatusLookupsMap = {
    [Status.DISABLED]: { count: new Count(), lookupIndices: {} },
    [Status.ERROR]: { count: new Count(), lookupIndices: {} },
    [Status.INITIAL]: { count: new Count(), lookupIndices: {} },
    [Status.PENDING]: { count: new Count(), lookupIndices: {} },
    [Status.SUCCESS]: { count: new Count(), lookupIndices: {} },
  };

  status = ObservableMemo(
    [
      this.map.pending.count.value,
      this.map.error.count.value,
      this.map.success.count.value,
      this.map.initial.count.value,
    ],
    ([pending, error, _success, initial]) => {
      if (initial) {
        return Status.INITIAL;
      }
      if (pending) {
        return Status.PENDING;
      }

      if (error) {
        return Status.ERROR;
      }
      return Status.SUCCESS;
    }
  );

  constructor(
    runners: AsyncActionRunner<T>[]
    // TODO: batchSize: number = runners.length)
  ) {
    this.enqueue(runners);
  }

  execute(callback: (runner: AsyncActionRunner<T>, index: number) => AsyncAction<T>) {
    return Promise.all(
      this.initial.map((runner, index) => {
        return runner.execute(callback(runner, index));
      })
    );
  }

  cancel() {
    this.pending.map(runner => runner.cancel());
  }

  retry() {
    return Promise.all(this.errored.map(runner => runner.retry()));
  }

  enqueue(runners: AsyncActionRunner<T>[]) {
    this.runners = [...this.runners, ...runners];

    this.runners.forEach((runner, index) => {
      this.map[runner.status.getValue()].count.incrememnt();
      this.map[runner.status.getValue()].lookupIndices[index] = index;
      runner.status.valueSubject
        .pipe(startWith(runner.status.getValue()))
        .pipe(pairwise())
        .subscribe(([previous, next]) => {
          // O(1)
          this.map[next].count.incrememnt();
          this.map[next].lookupIndices[index] = index;

          this.map[previous].count.decrement();
          delete this.map[previous].lookupIndices[index];
        });
    });
  }

  empty() {
    this.runners = [];
    this.map.pending.count.reset();
    this.map.initial.count.reset();
    this.map.error.count.reset();
    this.map.success.count.reset();
    this.map.pending.lookupIndices = {};
    this.map.initial.lookupIndices = {};
    this.map.error.lookupIndices = {};
    this.map.success.lookupIndices = {};
  }

  get successful() {
    return Object.keys(this.map.success.lookupIndices).map((key: string) => {
      return this.runners[this.map.success.lookupIndices[key]];
    });
  }

  get initial() {
    return Object.keys(this.map.initial.lookupIndices).map((key: string) => {
      return this.runners[this.map.initial.lookupIndices[key]];
    });
  }

  get pending() {
    return Object.keys(this.map.pending.lookupIndices).map((key: string) => {
      return this.runners[this.map.pending.lookupIndices[key]];
    });
  }

  get errored() {
    return Object.keys(this.map.error.lookupIndices).map((key: string) => {
      return this.runners[this.map.error.lookupIndices[key]];
    });
  }

  dispose() {
    Object.keys(this.map).forEach((key: Status) => {
      this.map[key].count.dispose();
    });
    this.runners.forEach(runner => {
      runner.dispose();
    });
    this.status.dispose();
  }
}

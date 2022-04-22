import { AsyncActionRunner } from '@neo/commons/utils/hex/AsyncActionRunner';
import { AsyncAction } from '@neo/commons/utils/hex/AsyncAction';
import { AsyncActionRunnerQueue } from '@neo/commons/utils/hex/async_action_runner_queue';

describe('AsyncActionRunnerQueue', () => {
  const runnerA = new AsyncActionRunner<void>(undefined);
  const domain = new AsyncActionRunnerQueue<void>([
    runnerA,
    new AsyncActionRunner(undefined),
  ]);
  test('constructs', () => {
    expect(domain.runners.length).toBe(2);
    expect(domain.map.initial.lookupIndices).toStrictEqual({ 0: 0, 1: 1 });
  });

  test('executes', async () => {
    await domain
      .execute(
        (_r, index) =>
          new AsyncAction(() => {
            if (index === 0) {
              return Promise.reject(new Error('test error'));
            }
            return Promise.resolve();
          })
      )
      .catch(() => {});
    expect(domain.map.initial.lookupIndices).toStrictEqual({});
    expect(domain.map.error.lookupIndices).toStrictEqual({ 0: 0 });
    expect(domain.map.success.lookupIndices).toStrictEqual({ 1: 1 });
  });

  test('retries', async () => {
    await domain.retry().catch(() => {});
    expect(domain.map.initial.lookupIndices).toStrictEqual({});
    expect(domain.map.error.lookupIndices).toStrictEqual({ 0: 0 });
    expect(domain.map.success.lookupIndices).toStrictEqual({ 1: 1 });
  });

  test('action runners change state', async () => {
    await runnerA.execute(new AsyncAction(() => Promise.resolve()));
    expect(domain.map.initial.lookupIndices).toStrictEqual({});
    expect(domain.map.initial.count.value.getValue()).toBe(0);

    expect(domain.map.error.lookupIndices).toStrictEqual({});
    expect(domain.map.error.count.value.getValue()).toBe(0);

    expect(domain.map.success.lookupIndices).toStrictEqual({ 0: 0, 1: 1 });
    expect(domain.map.success.count.value.getValue()).toBe(2);
  });

  test('disposes', () => {
    domain.dispose();
    expect(domain.map.error.count.value.valueSubject.isStopped).toBe(true);
    expect(domain.map.success.count.value.valueSubject.isStopped).toBe(true);
    expect(domain.map.initial.count.value.valueSubject.isStopped).toBe(true);
    expect(domain.map.pending.count.value.valueSubject.isStopped).toBe(true);
  });
});

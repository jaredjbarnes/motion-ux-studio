import { AsyncActionRunner, Status } from '@neo/commons/utils/hex/AsyncActionRunner';
import { AsyncAction } from '@neo/commons/utils/hex/AsyncAction';

function delay<T>(value: T) {
  return new Promise<T>(resolve => {
    window.setTimeout(resolve, 0, value);
  });
}

function delayError(value: any) {
  return new Promise<any>((_, reject) => {
    window.setTimeout(reject, 0, value);
  });
}

describe('AsyncActionRunner', () => {
  test('Success', () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return Promise.resolve(1);
    });

    runner.status.onChange(status => {
      statuses.push(status);
    });

    return runner.execute(action).then(() => {
      expect(runner.getValue()).toBe(1);
      expect(runner.getError()).toBe(null);
      expect(statuses.join('|')).toBe('pending|success');
    });
  });

  test('Error', () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner<number, number, Error>(0);
    const error = new Error('Bad');
    const action = new AsyncAction(() => {
      return Promise.reject(error);
    });

    runner.status.onChange(status => {
      statuses.push(status);
    });

    return runner.execute(action).catch(() => {
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(error);
      expect(statuses.join('|')).toBe('pending|error');
    });
  });

  test('Disable, Enable', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);
    runner.disable();

    expect(runner.status.getValue()).toBe(Status.DISABLED);

    runner.enable();
    expect(runner.status.getValue()).toBe(Status.INITIAL);
  });

  test('Reset', () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner<number, number, Error>(0);
    const error = new Error('Bad');
    const action = new AsyncAction(() => {
      return Promise.reject(error);
    });

    runner.status.onChange(status => {
      statuses.push(status);
    });

    return runner.execute(action).catch(() => {
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(error);
      expect(statuses.join('|')).toBe('pending|error');

      runner.setValue(5);
      expect(runner.getValue()).toBe(5);

      runner.reset();
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(null);
      expect(runner.status.getValue()).toBe('initial');
    });
  });

  test('Retry', () => {
    return new Promise(resolve => {
      const statuses: Status[] = [];
      let count = 0;
      const runner = new AsyncActionRunner<number, number, Error>(0);
      const error = new Error('Bad');

      const action = new AsyncAction(() => {
        if (count === 0) {
          count++;
          return Promise.reject(error);
        } else {
          return Promise.resolve(1);
        }
      });

      runner.status.onChange(status => {
        statuses.push(status);

        if (status === Status.SUCCESS) {
          expect(statuses.join('|')).toBe('pending|error|pending|success');
          expect(runner.getValue()).toBe(1);
          resolve(undefined);
        }
      });

      runner.execute(action).catch(() => {
        expect(runner.getValue()).toBe(0);
        expect(runner.getError()).toBe(error);
        expect(statuses.join('|')).toBe('pending|error');

        const executingAction = runner.retry();
        expect(executingAction).toBeInstanceOf(Promise);
      });
    });
  });

  test('Dispose', () => {
    const runner = new AsyncActionRunner(0);
    expect(runner.getValue()).toBe(0);
    runner.dispose();
  });

  test('Sabotage', () => {
    const runner = new AsyncActionRunner(0);

    return runner.execute(AsyncAction.reject('HAHA')).catch(() => {
      runner.action = null;
      expect(() => {
        runner.retry();
      }).toThrow();
    });
  });

  test('Cancel', () => {
    const runner = new AsyncActionRunner(0);

    return runner.execute(AsyncAction.reject('Oh No')).catch(() => {
      runner.action = null;
      expect(() => {
        runner.retry();
      }).toThrow();
    });
  });

  test('Multiple executions.', () => {
    const runner = new AsyncActionRunner<number>(0);

    return runner
      .execute(AsyncAction.resolve(runner.getValue() + 1))
      .then(value => {
        expect(value).toBe(1);
        return runner.execute(AsyncAction.resolve(runner.getValue() + 1));
      })
      .then(value => {
        expect(value).toBe(2);
      });
  });

  test('Disable while pending.', () => {
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return new Promise<number>(resolve => {
        window.setTimeout(resolve, 1, 1);
      });
    });

    const promise = runner.execute(action);

    runner.disable();

    return promise.then(value => {
      expect(value).toBe(1);
    });
  });

  test('Cancel.', () => {
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return new Promise<number>(resolve => {
        window.setTimeout(resolve, 1, 1);
      });
    });

    const promise = runner.execute(action);
    runner.cancel();

    return promise.catch(error => {
      expect(error?.message).toBe('Cancelled');
    });
  });

  test('Disable and enable while pending.', () => {
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return new Promise<number>(resolve => {
        window.setTimeout(resolve, 1, 1);
      });
    });

    const promise = runner.execute(action);
    runner.disable();
    runner.enable();
    runner.execute(action);

    return promise.then(value => {
      expect(value).toBe(1);
    });
  });

  test('Disable after successful.', () => {
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return new Promise<number>(resolve => {
        window.setTimeout(resolve, 1, 1);
      });
    });

    const promise = runner.execute(action);

    return promise.then(value => {
      expect(value).toBe(1);
      runner.disable();
    });
  });

  test('Execute when in error state.', () => {
    const runner = new AsyncActionRunner(0);
    const action = new AsyncAction(() => {
      return new Promise<number>(resolve => {
        window.setTimeout(resolve, 1, 1);
      });
    });

    return runner
      .execute(AsyncAction.reject('Bad News'))
      .catch(error => {
        expect(error).toBe('Bad News');
        return runner.execute(action);
      })
      .then(value => {
        expect(value).toBe(1);
      });
  });

  test('Disable when in error state.', () => {
    const runner = new AsyncActionRunner(0);

    return runner
      .execute(AsyncAction.reject('Bad News'))
      .catch(error => {
        expect(error).toBe('Bad News');
        runner.disable();
        expect(runner.status.getValue()).toBe('disabled');
        return runner.execute(AsyncAction.resolve(1));
      })
      .catch(error => {
        expect(error.message).toBe('Cannot execute while runner is disabled.');
      });
  });

  test('Secure AsyncActionRunner', () => {
    const KEY = 'MY_SECRET_KEY';
    const runner = new AsyncActionRunner(0, { key: KEY });
    const action = new AsyncAction(() => {
      return delay(1);
    });

    return runner.execute(action).then(() => {
      expect(runner.getValue()).toBe(1);
    });
  });

  test('Secure AsyncActionRunner with error', () => {
    const KEY = 'MY_SECRET_KEY';
    const runner = new AsyncActionRunner(0, { key: KEY });
    const action = new AsyncAction(() => {
      return delayError(new Error('Something went wrong.'));
    });

    return runner.execute(action).catch(error => {
      expect(error.message).toBe('Something went wrong.');
    });
  });

  test('Secure AsyncActionRunner, set without key.', () => {
    const KEY = 'MY_SECRET_KEY';
    const runner = new AsyncActionRunner(0, { key: KEY });

    expect(() => {
      return runner.setValue(1);
    }).toThrow(
      'You cannot set the value of a secure observable value without the correct key.'
    );
  });

  test('AsyncActionRunner set value directly.', () => {
    const runner = new AsyncActionRunner(0);

    runner.setValue(1);
    expect(runner.getValue()).toBe(1);
  });
});

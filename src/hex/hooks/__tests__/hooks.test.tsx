import React, { useState } from 'react';
import { ObservableValue } from '@neo/commons/utils/hex/ObservableValue';
import { useAsyncValueEffect } from '@neo/commons/utils/hex/hooks/useAsyncValueEffect';
import { useAsyncErrorEffect } from '@neo/commons/utils/hex/hooks/useAsyncErrorEffect';
import { useAsyncStatusEffect } from '@neo/commons/utils/hex/hooks/useAsyncStatusEffect';
import { useAsyncValue } from '@neo/commons/utils/hex/hooks/useAsyncValue';
import { useAsyncState } from '@neo/commons/utils/hex/hooks/useAsyncState';
import { useAsyncError } from '@neo/commons/utils/hex/hooks/useAsyncError';
import { useAsyncStatus } from '@neo/commons/utils/hex/hooks/useAsyncStatus';
import { AsyncActionRunner, Status } from '@neo/commons/utils/hex/AsyncActionRunner';
import { render, screen, act } from '@neo/commons/test/utils';

interface IRunnerComponentProps<T, TError = any> {
  runner: AsyncActionRunner<T, T, TError>;
}

interface IValueComponentProps<T, TError = any> {
  observableValue: ObservableValue<T, TError>;
}

function ValueComponent({ observableValue }: IValueComponentProps<number>) {
  const state = useAsyncValue(observableValue);
  return <div data-testid="test-wrapper">{state}</div>;
}

function ErrorComponent({ runner }: IRunnerComponentProps<number, Error>) {
  const error = useAsyncError(runner);
  return <div data-testid="test-wrapper">{error?.message || null}</div>;
}

function StatusComponent({ runner }: IRunnerComponentProps<number>) {
  const state = useAsyncStatus(runner);

  return <div data-testid="test-wrapper">{state.status}</div>;
}

function AsyncStateComponent({ runner }: IRunnerComponentProps<number>) {
  const state = useAsyncState(runner);

  return <div data-testid="test-wrapper">{state.status}</div>;
}

function AsyncValueEffectComponent({ runner }: IRunnerComponentProps<number>) {
  const [state, setState] = useState('Even');

  useAsyncValueEffect(value => {
    if (value % 2 === 0) {
      setState('Even');
    } else {
      setState('Odd');
    }
  }, runner);

  return <div data-testid="test-wrapper">{state}</div>;
}

function ErrorEffectComponent({ runner }: IRunnerComponentProps<number, Error>) {
  const [state, setState] = useState('');

  useAsyncErrorEffect<Error>(error => {
    setState(error?.message || '');
  }, runner);

  return <div data-testid="test-wrapper">{state}</div>;
}

function StatusEffectComponent({ runner }: IRunnerComponentProps<number>) {
  const [state, setState] = useState(runner.status.getValue());

  useAsyncStatusEffect(status => {
    setState(status.status);
  }, runner);

  return <div data-testid="test-wrapper">{state}</div>;
}

describe('Action Runner Effect Hooks', () => {
  test('useAsyncValueEffect', () => {
    const runner = new AsyncActionRunner<number>(0);

    expect(runner.getValue()).toBe(0);

    render(<AsyncValueEffectComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe('Even');

    act(() => {
      runner.setValue(runner.getValue() + 1);
    });

    expect(div.innerHTML).toBe('Odd');

    act(() => {
      runner.setValue(runner.getValue() + 1);
    });

    expect(div.innerHTML).toBe('Even');
  });

  test('useAsyncStatusEffect', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);

    expect(runner.getValue()).toBe(0);

    render(<StatusEffectComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe(Status.INITIAL);

    act(() => {
      runner.status.setValue(Status.PENDING);
    });

    expect(div.innerHTML).toBe(Status.PENDING);

    act(() => {
      runner.status.setValue(Status.SUCCESS);
    });

    expect(div.innerHTML).toBe(Status.SUCCESS);
  });

  test('useAsyncErrorEffect', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);

    expect(runner.getValue()).toBe(0);

    render(<ErrorEffectComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe('');

    act(() => {
      runner.setError(new Error('Bad Error'));
    });

    expect(div.innerHTML).toBe('Bad Error');

    act(() => {
      runner.setError(new Error('Not so bad Error'));
    });

    expect(div.innerHTML).toBe('Not so bad Error');
  });

  test('useAsyncValue', () => {
    const o = new ObservableValue<number, Error>(0);

    expect(o.getValue()).toBe(0);

    render(<ValueComponent observableValue={o} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe('0');

    act(() => {
      o.setValue(1);
    });

    expect(div.innerHTML).toBe('1');
  });

  test('useAsyncStatus', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);

    expect(runner.getValue()).toBe(0);

    render(<StatusComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe(Status.INITIAL);

    act(() => {
      runner.status.setValue(Status.PENDING);
    });

    expect(div.innerHTML).toBe(Status.PENDING);

    act(() => {
      runner.status.setValue(Status.SUCCESS);
    });

    expect(div.innerHTML).toBe(Status.SUCCESS);
  });

  test('useAsyncState', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);

    expect(runner.getValue()).toBe(0);

    render(<AsyncStateComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe(Status.INITIAL);

    act(() => {
      runner.status.setValue(Status.PENDING);
    });

    expect(div.innerHTML).toBe(Status.PENDING);

    act(() => {
      runner.status.setValue(Status.SUCCESS);
    });

    expect(div.innerHTML).toBe(Status.SUCCESS);
  });

  test('useAsyncError', () => {
    const runner = new AsyncActionRunner<number, number, Error>(0);

    expect(runner.getValue()).toBe(0);

    render(<ErrorComponent runner={runner} />);
    const div = screen.getByTestId('test-wrapper');

    expect(div.innerHTML).toBe('');

    act(() => {
      runner.setError(new Error('Bad Error'));
    });

    expect(div.innerHTML).toBe('Bad Error');
  });
});

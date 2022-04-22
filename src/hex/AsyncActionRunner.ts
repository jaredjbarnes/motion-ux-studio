import ObservableValue, {
  ObservableValueOptions,
  ReadonlyObservableValue,
} from './ObservableValue';
import { AsyncAction, CancelledError } from './AsyncAction';

export enum Status {
  INITIAL = 'initial',
  PENDING = 'pending',
  ERROR = 'error',
  SUCCESS = 'success',
  DISABLED = 'disabled',
}

export class AsyncActionRunner<TResult, TInitial = TResult, TError = any>
  extends ObservableValue<TResult, TInitial, TError>
  implements ReadonlyAsyncActionRunner<TResult, TInitial, TError>
{
  private readonly _initialState: TInitial;
  private _internalState: State<TResult, TInitial, TError>;
  readonly status: ObservableValue<Status>;

  constructor(
    initialState: TInitial,
    options?: ObservableValueOptions<TResult, TInitial, TError>
  ) {
    super(initialState, options);

    this._internalState = new InitialState<TResult, TInitial, TError>(this, options?.key);
    this._initialState = initialState;
    this.status = new ObservableValue<Status>(Status.INITIAL, {
      key: options?.key,
    });
  }

  action: AsyncAction<TResult> | null = null;

  changeState(state: State<TResult, TInitial, TError>) {
    this._internalState = state;
    this.status.setValue(state.getName(), this.key);
  }

  disable() {
    return this._internalState.disable();
  }

  enable() {
    return this._internalState.enable();
  }

  execute(action: AsyncAction<TResult>) {
    return this._internalState.execute(action);
  }

  cancel() {
    this.reset();
  }

  retry() {
    return this._internalState.retry();
  }

  reset() {
    this._internalState.cancel();
    this.setError(null, this.key);
    this.setValue(this._initialState as any);
    this.changeState(new InitialState<TResult, TInitial, TError>(this, this.key));
  }

  dispose() {
    super.dispose();
    this.status.dispose();
  }
}
abstract class State<TResult, TInitial, TError> {
  protected context: AsyncActionRunner<TResult, TInitial, TError>;
  protected key: string | undefined;

  constructor(context: AsyncActionRunner<TResult, TInitial, TError>, key?: string) {
    this.key = key;
    this.context = context;
  }

  abstract getName(): Status;

  enable() {
    // Do Nothing.
  }

  disable() {
    // Do Nothing.
  }

  execute(_action: AsyncAction<TResult>): Promise<TResult> {
    // disabled linter per defining an interface that needs to be followed on other states
    // Throw because this should never be hit.
    return Promise.reject(new Error('Not Yet Implemented'));
  }

  retry(): Promise<TResult> {
    return Promise.reject(new Error('Not Yet Implemented'));
  }

  cancel() {
    // Do nothing.
  }
}

class ReadyState<TResult, TInitial, TError> extends State<TResult, TInitial, TError> {
  getName(): Status {
    throw new Error('Not Yet Implemented');
  }

  disable() {
    this.context.changeState(
      new DisabledState<TResult, TInitial, TError>(this.context, this.key)
    );
  }

  execute(action: AsyncAction<TResult>) {
    this.context.action = action;

    const pendingState = new PendingState<TResult, TInitial, TError>(
      this.context,
      this.key
    );
    this.context.changeState(pendingState);

    return pendingState.executingPromise;
  }
}

export class InitialState<TResult, TInitial, TError> extends ReadyState<
  TResult,
  TInitial,
  TError
> {
  getName() {
    return Status.INITIAL;
  }
}

export class PendingState<TResult, TInitial, TError> extends State<
  TResult,
  TInitial,
  TError
> {
  private isEnabled = true;
  readonly executingPromise: Promise<TResult>;

  constructor(context: AsyncActionRunner<TResult, TInitial, TError>, key?: string) {
    super(context, key);
    const action = this.context.action;

    if (action == null) {
      throw new Error(
        'Cannot switch to pending state without an action set to the context.'
      );
    }

    this.executingPromise = action
      .execute()
      .then((nextValue: TResult) => {
        this.context.setValue(nextValue, this.key);
        this.context.changeState(
          new SuccessState<TResult, TInitial, TError>(this.context, this.key)
        );
        return nextValue;
      })
      .catch((error: TError) => {
        if (!(error instanceof CancelledError)) {
          this.context.setError(error, this.key);
          this.context.changeState(
            new ErrorState<TResult, TInitial, TError>(this.context, this.key)
          );
        }

        throw error;
      })
      .finally(() => {
        if (!this.isEnabled) {
          this.context.changeState(
            new DisabledState<TResult, TInitial, TError>(this.context, this.key)
          );
        }
      });
  }

  cancel() {
    this.context.action?.cancelExecution();
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }

  execute() {
    return this.executingPromise;
  }

  getName() {
    return Status.PENDING;
  }
}

export class SuccessState<TResult, TInitial, TError> extends ReadyState<
  TResult,
  TInitial,
  TError
> {
  getName() {
    return Status.SUCCESS;
  }
}

export class ErrorState<TResult, TInitial, TError> extends ReadyState<
  TResult,
  TInitial,
  TError
> {
  retry() {
    const pendingState = new PendingState<TResult, TInitial, TError>(
      this.context,
      this.key
    );
    this.context.changeState(pendingState);

    return pendingState.executingPromise;
  }

  getName() {
    return Status.ERROR;
  }
}

export class DisabledState<TResult, TInitial, TError> extends State<
  TResult,
  TInitial,
  TError
> {
  execute() {
    return Promise.reject(new Error('Cannot execute while runner is disabled.'));
  }

  getName() {
    return Status.DISABLED;
  }

  enable() {
    this.context.changeState(new InitialState(this.context, this.key));
  }
}

export interface ReadonlyAsyncActionRunner<TResult, TInitial, TError>
  extends ReadonlyObservableValue<TResult, TInitial, TError> {
  readonly status: ReadonlyObservableValue<Status>;
  disable(): void;
  enable(): void;
  cancel(): void;
  retry(): Promise<TResult>;
  reset(): void;
}

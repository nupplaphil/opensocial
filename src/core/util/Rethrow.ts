import { ExtendedError, ExtendedErrorOptions } from '@core/util/ExtendedError';
import merge from 'deepmerge';

export class Rethrow extends ExtendedError {
  newStack: string | undefined;

  original: Error | ExtendedError | Rethrow;

  constructor(message: string,
    error: Error | ExtendedError | Rethrow, options?: ExtendedErrorOptions) {
    if (!error || !message) {
      throw new Error('Rethrow requires a message and error');
    }
    const errorOptions = (error as ExtendedError).options;
    let originalOptions = '';
    if (errorOptions) {
      originalOptions = JSON.stringify(errorOptions);
      if (options) {
        super(message, merge(errorOptions, options));
      } else {
        super(message, errorOptions);
      }
    } else if (options) {
      super(message, options);
    } else {
      super(message);
    }
    this.original = error;
    if (originalOptions) {
      (this.original as ExtendedError).options = JSON.parse(originalOptions);
    }
    this.newStack = this.stack;
    const messageLines: number = (this.message.match(/\n/g) || []).length + 1;
    if (this.stack) {
      this.stack = `${this.stack.split('\n').slice(0, messageLines + 1).join('\n')}\n${error.stack}`;
    } else {
      this.stack = error.stack;
    }
  }
}

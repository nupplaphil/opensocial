export interface ExtendedErrorOptions {
  http?: ExtendedErrorOptionsHttp;
}

interface ExtendedErrorOptionsHttp {
  statusCode?: number;
  message?: string;
  decorate?: any;
  override?: any;
}

export class ExtendedError extends Error {
  options: ExtendedErrorOptions = {};

  constructor(message: string, options?: ExtendedErrorOptions) {
    super(message);
    if (options) {
      this.options = options;
    }
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

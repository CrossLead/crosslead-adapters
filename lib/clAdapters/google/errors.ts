export abstract class GoogleError extends Error {
  constructor(messageOrError: string | Error) {
    if (typeof messageOrError === 'string') {
      super(messageOrError);
      Error.captureStackTrace(this, this.constructor);
    }
    else {
      super(messageOrError.message);
      this.stack = messageOrError.stack;
    }

    // TypeScript: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, GoogleError.prototype);
  }
}

export class InvalidGrantError extends GoogleError {
  constructor(messageOrError: string | Error) {
    super(messageOrError);
    Object.setPrototypeOf(this, InvalidGrantError.prototype);
    this.name = 'InvalidGrantError';
  }
}

export class UnauthorizedClientError extends GoogleError {
  constructor(messageOrError: string | Error) {
    super(messageOrError);
    Object.setPrototypeOf(this, UnauthorizedClientError.prototype);
    this.name = 'UnauthorizedClientError';
  }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GoogleError extends Error {
    constructor(messageOrError) {
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
exports.GoogleError = GoogleError;
class InvalidGrantError extends GoogleError {
    constructor(messageOrError) {
        // Need these typeguards to compile
        if (typeof messageOrError === 'string')
            super(messageOrError);
        else
            super(messageOrError);
        Object.setPrototypeOf(this, InvalidGrantError.prototype);
        this.name = 'InvalidGrantError';
    }
}
exports.InvalidGrantError = InvalidGrantError;
class UnauthorizedClientError extends GoogleError {
    constructor(messageOrError) {
        if (typeof messageOrError === 'string')
            super(messageOrError);
        else
            super(messageOrError);
        Object.setPrototypeOf(this, UnauthorizedClientError.prototype);
        this.name = 'UnauthorizedClientError';
    }
}
exports.UnauthorizedClientError = UnauthorizedClientError;
//# sourceMappingURL=errors.js.map
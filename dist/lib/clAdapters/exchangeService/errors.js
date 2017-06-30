"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createExchangeServiceError(kind, err) {
    if (!err) {
        err = new Error();
        Error.captureStackTrace(err, createExchangeServiceError);
    }
    return {
        kind,
        err
    };
}
exports.createExchangeServiceError = createExchangeServiceError;
//# sourceMappingURL=errors.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createGoogleError(kind, err) {
    if (!err) {
        err = new Error();
        Error.captureStackTrace(err, createGoogleError);
    }
    return {
        kind,
        err
    };
}
exports.createGoogleError = createGoogleError;
//# sourceMappingURL=errors.js.map
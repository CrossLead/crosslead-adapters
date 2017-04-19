"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createGoogleError(kind, err) {
    if (!err) {
        err = new Error();
        Error.captureStackTrace(err, createGoogleError);
    }
    // return {
    //     kind,
    //     err
    // };
    // Type value is not enforceable:
    // Type '{ kind: T; err: Error; }' is not assignable to type 'GoogleError'.
    // Ref: https://goo.gl/xza8z0
    switch (kind) {
        case 'InvalidGrant':
        case 'UnauthorizedClient':
            return {
                kind,
                err
            };
        default:
            throw new Error('Invalid GoogleErrorType');
    }
}
exports.createGoogleError = createGoogleError;
//# sourceMappingURL=errors.js.map
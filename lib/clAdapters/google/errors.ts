// Type union instead of enum so calling code can get name without type details
export type GoogleErrorType =
  'InvalidGrant' |
  'UnauthorizedClient'
;

export interface InvalidGrant {
  kind: 'InvalidGrant';
  err: Error;
}

export interface UnauthorizedClient {
  kind: 'UnauthorizedClient';
  err: Error;
}

export type GoogleError = InvalidGrant | UnauthorizedClient;

export function createGoogleError<T extends GoogleErrorType>(
  kind: T,
  err?: Error
): GoogleError {
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
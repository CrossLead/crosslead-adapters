// Type union instead of enum so calling code can get name without type details
export type GoogleErrorType =
  'InvalidGrant' |
  'UnauthorizedClient' |
  'NotACalendarUser' // this is an artifact of a user being suspended.
;

export interface InvalidGrant {
  kind: 'InvalidGrant';
  err: Error;
}

export interface UnauthorizedClient {
  kind: 'UnauthorizedClient';
  err: Error;
}

export interface NotACalendarUser {
  kind: 'NotACalendarUser';
  err: Error;
}

export type GoogleError = InvalidGrant | UnauthorizedClient | NotACalendarUser;

export function createGoogleError<T extends GoogleErrorType>(
  kind: T,
  err?: Error
) {

  if (!err) {
    err = new Error();
    Error.captureStackTrace(err, createGoogleError);
  }
  return { kind, err };
}

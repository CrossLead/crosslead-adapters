// Type union instead of enum so calling code can get name without type details
export type ExchangeServiceErrorType =
  'NotPrimaryEmail' |
  'NoMailbox' |
  'UnauthorizedClient' |
  'ServerBusy' |
  'InternalServerError' |
  'UnclassifiedError'
;

export interface NotPrimaryEmail {
  kind: 'NotPrimaryEmail';
  err: Error;
}

export interface NoMailbox {
  kind: 'NoMailbox';
  err: Error;
}

export interface UnauthorizedClient {
  kind: 'UnauthorizedClient';
  err: Error;
}

export interface ServerBusy {
  kind: 'ServerBusy';
  err: Error;
}

export interface InternalServerError {
  kind: 'InternalServerError';
  err: Error;
}

export interface UnclassifiedError {
  kind: 'UnclassifiedError';
  err: Error;
}

export type ExchangeServiceError
  = NotPrimaryEmail
  | NoMailbox
  | UnauthorizedClient
  | ServerBusy
  | InternalServerError
  | UnclassifiedError;

export function createExchangeServiceError<T extends ExchangeServiceErrorType>(
  kind: T,
  err?: Error
) {
  if (!err) {
    err = new Error();
    Error.captureStackTrace(err, createExchangeServiceError);
  }

  return {
      kind,
      err
  };
}

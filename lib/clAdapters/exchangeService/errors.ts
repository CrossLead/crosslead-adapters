// Type union instead of enum so calling code can get name without type details
export type ExchangeServiceErrorType =
  'NotPrimaryEmail' |
  'NoMailbox' |
  'UnauthorizedClient'
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

export type ExchangeServiceError = NotPrimaryEmail | NoMailbox | UnauthorizedClient;

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
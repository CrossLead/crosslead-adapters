export declare type ExchangeServiceErrorType = 'NotPrimaryEmail' | 'NoMailbox' | 'UnauthorizedClient';
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
export declare type ExchangeServiceError = NotPrimaryEmail | NoMailbox | UnauthorizedClient;
export declare function createExchangeServiceError<T extends ExchangeServiceErrorType>(kind: T, err?: Error): {
    kind: T;
    err: Error;
};

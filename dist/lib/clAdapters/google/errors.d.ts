export declare type GoogleErrorType = 'InvalidGrant' | 'UnauthorizedClient';
export interface InvalidGrant {
    kind: 'InvalidGrant';
    err: Error;
}
export interface UnauthorizedClient {
    kind: 'UnauthorizedClient';
    err: Error;
}
export declare type GoogleError = InvalidGrant | UnauthorizedClient;
export declare function createGoogleError<T extends GoogleErrorType>(kind: T, err?: Error): GoogleError;

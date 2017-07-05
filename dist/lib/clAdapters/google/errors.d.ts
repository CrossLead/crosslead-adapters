export declare type GoogleErrorType = 'InvalidGrant' | 'UnauthorizedClient' | 'NotACalendarUser';
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
export declare type GoogleError = InvalidGrant | UnauthorizedClient | NotACalendarUser;
export declare function createGoogleError<T extends GoogleErrorType>(kind: T, err?: Error): {
    kind: T;
    err: Error;
};

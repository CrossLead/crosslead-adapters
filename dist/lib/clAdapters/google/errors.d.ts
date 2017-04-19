export declare abstract class GoogleError extends Error {
    constructor(message: string);
    constructor(error: Error);
}
export declare class InvalidGrantError extends GoogleError {
    constructor(messageOrError: string | Error);
}
export declare class UnauthorizedClientError extends GoogleError {
    constructor(messageOrError: string | Error);
}

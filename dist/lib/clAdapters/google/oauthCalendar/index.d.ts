import { Configuration, Service, Adapter } from '../../base/index';
import { InvalidGrant } from '../errors';
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'dateTimeCreated': string;
    'dateTimeLastModified': string;
    'attendeeAddress': string;
    'attendeeName': string;
    'iCalUId': string;
    'location': string;
    'status': string;
    'isCreator': string;
    'isOrganizer': string;
    'organizerEmail': string;
    'recurrence': string;
    'responseStatus': string;
    'seriesMasterId': string;
    'dateTimeStart': string;
    'dateTimeEnd': string;
    'subject': string;
    'url': string;
    'hangoutLink': string;
    'privacy': string;
};
export interface UserProfile {
    email: string;
    emailAfterMapping: string;
}
export declare type GoogleOauthCredentials = {
    access_token: string;
    refresh_token: string;
    email: string;
};
export declare type GoogleCalendarApiEvent = {
    [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};
export interface GoogleCalendarApiResult {
    items: GoogleCalendarApiEvent[];
    nextPageToken?: string;
}
export default class GoogleOauthCalendarAdapter extends Adapter {
    credentials: GoogleOauthCredentials;
    getFieldData(): Promise<void>;
    static Configuration: typeof Configuration;
    static Service: typeof Service;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'dateTimeCreated': string;
        'dateTimeLastModified': string;
        'attendeeAddress': string;
        'attendeeName': string;
        'iCalUId': string;
        'location': string;
        'status': string;
        'isCreator': string;
        'isOrganizer': string;
        'organizerEmail': string;
        'recurrence': string;
        'responseStatus': string;
        'seriesMasterId': string;
        'dateTimeStart': string;
        'dateTimeEnd': string;
        'subject': string;
        'url': string;
        'hangoutLink': string;
        'privacy': string;
    };
    sensitiveCredentialsFields: (keyof GoogleOauthCredentials)[];
    _config: Configuration;
    _service: Service;
    constructor();
    reset(): this;
    init(): Promise<this>;
    getBatchData(userProfiles: UserProfile[] | undefined, filterStartDate: Date, filterEndDate: Date, fields?: string): Promise<void>;
    getData(filterStartDate: Date, filterEndDate: Date, properties: {
        GOOGLE_OAUTH_CLIENT_ID: string;
        GOOGLE_OAUTH_CLIENT_SECRET: string;
        GOOGLE_OAUTH_REDIRECT_URL: string;
        access_token: string;
        refresh_token: string;
        expiry_date: string;
        userId: string;
        email: string;
    }): Promise<({
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
        errorMessage: null;
    } & {
        results: {
            filterStartDate: Date;
            filterEndDate: Date;
            success: boolean;
            userId: string;
            email: string;
            data: any;
        }[];
    }) | ({
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
        errorMessage: null;
    } & {
        errorMessage: Error | InvalidGrant;
        success: boolean;
        data: never[];
    })>;
    runConnectionTest(): Promise<void>;
    runMessageTest(): Promise<void>;
}

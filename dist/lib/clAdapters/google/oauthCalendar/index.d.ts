import { Configuration, Service, Adapter } from '../../base/index';
import { InvalidGrant } from '../errors';
import { DateRange, UserProfile } from '../../../common/types';
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'createTime': string;
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
    'response': string;
    'seriesMasterId': string;
    'startTime': string;
    'endTime': string;
    'name': string;
    'url': string;
    'hangoutLink': string;
    'privacy': string;
    'description': string;
};
export declare type GoogleOauthCredentials = {
    access_token: string;
    refresh_token: string;
    email: string;
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
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
    private auth;
    getFieldData(): Promise<void>;
    static Configuration: typeof Configuration;
    static Service: typeof Service;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'createTime': string;
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
        'response': string;
        'seriesMasterId': string;
        'startTime': string;
        'endTime': string;
        'name': string;
        'url': string;
        'hangoutLink': string;
        'privacy': string;
        'description': string;
    };
    sensitiveCredentialsFields: (keyof GoogleOauthCredentials)[];
    _config: Configuration;
    _service: Service;
    constructor();
    reset(): this;
    init(): Promise<this>;
    getBatchData(userProfiles: UserProfile[] | undefined, filterStartDate: Date, filterEndDate: Date, fields?: string): Promise<never[]>;
    getData(filterStartDate: Date, filterEndDate: Date, properties: {
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
    getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange | null>;
    runConnectionTest(): Promise<void>;
    runMessageTest(): Promise<void>;
}

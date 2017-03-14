import { Adapter, Configuration, Service } from '../base/index';
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
export declare type GoogleCalendarApiEvent = {
    [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};
export interface GoogleCalendarApiResult {
    items: GoogleCalendarApiEvent[];
    nextPageToken?: string;
}
export default class GoogleCalendarAdapter extends Adapter {
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
    _config: Configuration;
    _service: Service;
    constructor();
    reset(): this;
    init(): Promise<this>;
    getBatchData(userProfiles: UserProfile[] | undefined, filterStartDate: Date, filterEndDate: Date, fields?: string): Promise<{
        success: boolean;
        runDate: any;
        filterStartDate: Date;
        filterEndDate: Date;
        emails: UserProfile[];
        results: never[];
    } & {
        results: ({
            success: boolean;
            runDate: any;
            errorMessage: null;
            email: string;
            emailAfterMapping: string;
            filterStartDate: Date;
            filterEndDate: Date;
        } & {
            data: any;
        })[];
    }>;
    runConnectionTest(): Promise<{
        success: boolean;
    }>;
    runMessageTest(): Promise<{
        success: boolean;
    }>;
    authorize(email: string): Promise<{}>;
}

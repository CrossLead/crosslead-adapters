import { Configuration, Service } from '../../base/index';
import GoogleBaseAdapter from '../base/Adapter';
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
export default class GoogleCalendarAdapter extends GoogleBaseAdapter {
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
    getEvents(requestOpts: any): Promise<GoogleCalendarApiResult>;
}

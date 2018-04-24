import { Configuration, Service } from '../../base/index';
import GoogleBaseAdapter from '../base/Adapter';
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
        'description': string;
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
            readonly email: string;
            readonly emailAfterMapping: string;
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
    authorize(email: string): Promise<any>;
    getEvents(requestOpts: any): Promise<GoogleCalendarApiResult>;
    getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange | null>;
}

import { Configuration, Service } from '../../base/index';
import ActiveSyncBaseAdapter from '../base/Adapter';
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
export declare type ActiveSyncCalendarApiEvent = {
    [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};
export interface ActiveSyncCalendarApiResult {
    items: ActiveSyncCalendarApiEvent[];
    nextPageToken?: string;
}
export default class ActiveSyncCalendarAdapter extends ActiveSyncBaseAdapter {
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
    getCalendarData(email: string, password: string, endpoint: string): Promise<void>;
    getBatchData(userProfiles: UserProfile[] | undefined, filterStartDate: Date, filterEndDate: Date, fields?: string): Promise<{
        results: never[];
    }>;
    runConnectionTest(): Promise<{
        success: boolean;
        connectUrl: string;
    } | {
        message: any;
        success: boolean;
    }>;
    runMessageTest(): Promise<boolean>;
    authorize(userEmail: string): Promise<{}>;
}

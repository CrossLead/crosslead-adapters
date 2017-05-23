import 'moment-recur';
import { Configuration, Service } from '../../base/index';
import ExchangeServiceBaseAdapter from '../base/Adapter';
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'dateTimeCreated': string;
    'attendeeAddress': string;
    'attendeeName': string;
    'location': string;
    'status': string;
    'organizerEmail': string;
    'recurrence': string;
    'responseRequested': string;
    'responseStatus': string;
    'dateTimeStart': string;
    'dateTimeEnd': string;
    'subject': string;
    'url': string;
    'privacy': string;
};
export interface UserProfile {
    email: string;
    emailAfterMapping: string;
}
export declare type ExchangeServiceApiEvent = {
    [K in keyof (typeof fieldNameMap)]?: (typeof fieldNameMap)[K];
};
export interface ExchangeServiceApiResult {
    items: ExchangeServiceApiEvent[];
    nextPageToken?: string;
}
export default class ExchangeServiceCalendarAdapter extends ExchangeServiceBaseAdapter {
    static Configuration: typeof Configuration;
    static Service: typeof Service;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'dateTimeCreated': string;
        'attendeeAddress': string;
        'attendeeName': string;
        'location': string;
        'status': string;
        'organizerEmail': string;
        'recurrence': string;
        'responseRequested': string;
        'responseStatus': string;
        'dateTimeStart': string;
        'dateTimeEnd': string;
        'subject': string;
        'url': string;
        'privacy': string;
    };
    _config: Configuration;
    _service: Service;
    ews: any;
    constructor();
    reset(): this;
    init(): Promise<this>;
    private expandDaysOfWeek(daysOfWeek);
    private getRecurrence(startTime, filterEndDate, recurrenceObj);
    private isDeleted(exceptionsObj, event);
    private getExceptionEvents(event, exceptionsObj, filterStartDate, filterEndDate);
    private addToEvents(events, folder, filterStartDate, filterEndDate);
    getData(filterStartDate: Date, filterEndDate: Date, properties: any): Promise<{
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
        errorMessage: null;
    } & {
        errorMessage: any;
        success: boolean;
    }>;
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
    private initEws();
    private findItem(userEmail, startDate, endDate);
    private getFolder(userEmail);
    runConnectionTest(): Promise<{
        success: boolean;
        data: any;
    } | {
        message: any;
        success: boolean;
    }>;
}

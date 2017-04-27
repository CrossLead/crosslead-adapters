import 'moment-recur';
import { Configuration, Service } from '../../base/index';
import ActiveSyncBaseAdapter from '../base/Adapter';
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
export default class ActiveSyncCalendarAdapter extends ActiveSyncBaseAdapter {
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
    constructor();
    reset(): this;
    init(): Promise<this>;
    private expandDaysOfWeek(daysOfWeek);
    private getRecurrence(startTime, filterEndDate, recurrenceObj);
    private isDeleted(exceptionsObj, event);
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
    runConnectionTest(): Promise<{
        success: boolean;
        connectUrl: string | null;
    } | {
        message: any;
        success: boolean;
    }>;
}

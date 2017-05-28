import 'moment-recur';
import { Configuration, Service } from '../../base/index';
import ExchangeServiceBaseAdapter from '../base/Adapter';
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'categories': string;
    'dateTimeCreated': string;
    'attendeeAddress': string;
    'attendeeName': string;
    'hasAttachments': string;
    'importance': string;
    'allDay': string;
    'canceled': string;
    'locationName': string;
    'organizerName': string;
    'organizerEmail': string;
    'responseRequested': string;
    'responseStatus': string;
    'showAs': string;
    'dateTimeStart': string;
    'dateTimeEnd': string;
    'subject': string;
    'type': string;
    'privacy': string;
};
export interface UserProfile {
    email: string;
    emailAfterMapping: string;
}
export default class ExchangeServiceCalendarAdapter extends ExchangeServiceBaseAdapter {
    static Configuration: typeof Configuration;
    static Service: typeof Service;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'categories': string;
        'dateTimeCreated': string;
        'attendeeAddress': string;
        'attendeeName': string;
        'hasAttachments': string;
        'importance': string;
        'allDay': string;
        'canceled': string;
        'locationName': string;
        'organizerName': string;
        'organizerEmail': string;
        'responseRequested': string;
        'responseStatus': string;
        'showAs': string;
        'dateTimeStart': string;
        'dateTimeEnd': string;
        'subject': string;
        'type': string;
        'privacy': string;
    };
    _config: Configuration;
    _service: Service;
    ews: any;
    soapHeader: any;
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
            data: {
                [key: string]: string;
            }[];
        })[];
    }>;
    private setImpersonationUser(emailAddress);
    private initEws();
    private attachAttendees(out, item);
    private getOptionalAttendees(itemId, itemChangeKey);
    private getRequiredAttendees(itemId, itemChangeKey);
    private findItem(startDate, endDate);
    runConnectionTest(): Promise<{
        success: boolean;
        data: any;
    } | {
        message: any;
        success: boolean;
    }>;
}

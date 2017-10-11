import { Configuration } from '../../base/index';
import ExchangeServiceBaseAdapter from '../base/Adapter';
import ExchangeServiceService from '../base/Service';
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'categories': string;
    'createTime': string;
    'attendeeAddress': string;
    'attendeeName': string;
    'hasAttachments': string;
    'importance': string;
    'iCalUId': string;
    'allDay': string;
    'canceled': string;
    'location': string;
    'organizerName': string;
    'organizerEmail': string;
    'responseRequested': string;
    'response': string;
    'showAs': string;
    'startTime': string;
    'endTime': string;
    'name': string;
    'type': string;
    'url': string;
    'privacy': string;
};
export interface UserProfile {
    email: string;
    emailAfterMapping: string;
}
export default class ExchangeServiceCalendarAdapter extends ExchangeServiceBaseAdapter {
    static Configuration: typeof Configuration;
    static Service: typeof ExchangeServiceService;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'categories': string;
        'createTime': string;
        'attendeeAddress': string;
        'attendeeName': string;
        'hasAttachments': string;
        'importance': string;
        'iCalUId': string;
        'allDay': string;
        'canceled': string;
        'location': string;
        'organizerName': string;
        'organizerEmail': string;
        'responseRequested': string;
        'response': string;
        'showAs': string;
        'startTime': string;
        'endTime': string;
        'name': string;
        'type': string;
        'url': string;
        'privacy': string;
    };
    _config: Configuration;
    _service: ExchangeServiceService;
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
                [key: string]: any;
            }[];
        })[];
    }>;
    private hashCreds();
    private attachAttendees(out, item, addr);
    runConnectionTest(): Promise<{
        success: boolean;
        data: any;
    } | {
        message: any;
        success: boolean;
    }>;
}

import 'moment-recur';
import { Configuration, Service } from '../../base/index';
import { ActiveSyncBaseAdapter } from '../base/Adapter';
import { DateRange, UserProfile } from '../../../common/types';
import { ConnectionTestResult } from '../../base/Adapter';
/**
 * ActiveSync fields
 *
 * MeetingStatus
 *
 * 0 The event is an appointment, which has no attendees.
 * 1 or 9 The event is a meeting and the user is the meeting organizer.
 * 3 or 11 This event is a meeting, and the user is not the meeting organizer; the meeting was received from someone else.
 * 5 or 13 The meeting has been canceled and the user was the meeting organizer.
 * 7 or 15 The meeting has been canceled. The user was not the meeting organizer; the meeting was received from someone else.
 *
 */
export declare const fieldNameMap: {
    'eventId': string;
    'attendees': string;
    'createTime': string;
    'attendeeAddress': string;
    'attendeeName': string;
    'location': string;
    'status': string;
    'organizerEmail': string;
    'recurrence': string;
    'responseRequested': string;
    'response': string;
    'startTime': string;
    'endTime': string;
    'name': string;
    'url': string;
    'allDay': string;
    'privacy': string;
    'description': string;
};
export default class ActiveSyncCalendarAdapter extends ActiveSyncBaseAdapter {
    static Configuration: typeof Configuration;
    static Service: typeof Service;
    static fieldNameMap: {
        'eventId': string;
        'attendees': string;
        'createTime': string;
        'attendeeAddress': string;
        'attendeeName': string;
        'location': string;
        'status': string;
        'organizerEmail': string;
        'recurrence': string;
        'responseRequested': string;
        'response': string;
        'startTime': string;
        'endTime': string;
        'name': string;
        'url': string;
        'allDay': string;
        'privacy': string;
        'description': string;
    };
    _config: Configuration;
    _service: Service;
    constructor();
    reset(): this;
    init(): Promise<this>;
    private expandDaysOfWeek(daysOfWeek);
    private getRecurrence(startTime, filterEndDate, recurrenceObj);
    private checkOccurences(recurrence, occurrences, filterEndDate);
    private isDeleted(exceptionsObj, event);
    private setIfExists(fieldName, event, exEvent);
    private getExceptionEvents(event, exceptionsObj, filterStartDate, filterEndDate);
    private addToEvents(events, folder, filterStartDate, filterEndDate);
    private eventExists(events, event);
    private mkProvisionedClient();
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
    getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange | null>;
    runConnectionTest(): Promise<ConnectionTestResult>;
}

import Office365BaseAdapter from '../base/Adapter';
import { DateRange, UserProfile } from '../../../common/types';
/**
 * Office 365 Calendar adapter
 */
export default class Office365CalendarAdapter extends Office365BaseAdapter {
    static baseFields: string[];
    static fieldNameMap: {
        [key: string]: string;
    };
    getBatchData(userProfiles: any[], filterStartDate: Date, filterEndDate: Date, additionalFields?: any): Promise<{
        results: any;
        success: boolean;
        emails: any[];
        filterStartDate: Date;
        filterEndDate: Date;
        runDate: any;
    } | {
        errorMessage: Error;
        emails: any[];
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
    }>;
    getDatesOf(eventId: string, userProfile: UserProfile): Promise<DateRange | null>;
}

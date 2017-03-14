import Office365BaseAdapter from '../base/Adapter';
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
        errorMessage: any;
        emails: any[];
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
    }>;
}

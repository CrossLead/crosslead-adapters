import Office365BaseAdapter from '../base/Adapter';
/**
 * Office 365 Mail adapter
 */
export default class Office365MailAdapter extends Office365BaseAdapter {
    static baseFields: string[];
    static fieldNameMap: {
        [key: string]: string;
    };
    getBatchData(userProfiles: any[], filterStartDate: Date, filterEndDate: Date, additionalFields?: any): Promise<{
        results: any;
        success: boolean;
        userProfiles: any[];
        filterStartDate: Date;
        filterEndDate: Date;
        runDate: any;
    } | {
        errorMessage: any;
        userProfiles: any[];
        filterStartDate: Date;
        filterEndDate: Date;
        success: boolean;
        runDate: any;
    }>;
}

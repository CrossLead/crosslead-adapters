import { Service, Configuration } from '../../base/index';
export default class ExchangeServiceService extends Service {
    config: Configuration;
    ews: any;
    soapHeader: any;
    constructor(config: Configuration);
    init(): Promise<boolean>;
    setImpersonationUser(emailAddress: string): void;
    getOptionalAttendees(itemId: string, itemChangeKey: string): Promise<any>;
    getRequiredAttendees(itemId: string, itemChangeKey: string): Promise<any>;
    findItem(startDate: string, endDate: string): Promise<any>;
}

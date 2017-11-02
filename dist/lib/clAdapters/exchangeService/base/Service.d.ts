import { Service, Configuration } from '../../base/index';
import { DateRange } from '../../../common/types';
export default class ExchangeServiceService extends Service {
    config: Configuration;
    ews: any;
    constructor(config: Configuration);
    init(): Promise<boolean>;
    private buildSoapHeader(emailAddress);
    getOptionalAttendees(itemId: string, itemChangeKey: string, addr: string): Promise<any>;
    getRequiredAttendees(itemId: string, itemChangeKey: string, addr: string): Promise<any>;
    getDatesOf(itemId: string, addr: string): Promise<DateRange | null>;
    findItem(startDate: string, endDate: string, addr: string): Promise<any>;
}

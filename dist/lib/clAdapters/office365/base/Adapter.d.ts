import Adapter from '../../base/Adapter';
import Office365BaseService from './Service';
import Office365BaseConfiguration from './Configuration';
export declare type Office365Credentials = {
    email: string;
    clientId: string;
    tenantId: string;
    certificate: string;
    certificateThumbprint: string;
};
export interface Office365AdapterGetUserInfoOptions {
    userProfile: any;
    filterStartDate: Date;
    filterEndDate: Date;
    additionalFields?: any;
    $filter?: any;
    apiType?: any;
    maxPages?: number;
    recordsPerPage?: number;
}
/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
export default class Office365BaseAdapter extends Adapter {
    credentials: Office365Credentials;
    sensitiveCredentialsFields: (keyof Office365Credentials)[];
    _config: Office365BaseConfiguration;
    _service: Office365BaseService;
    static baseFields: any;
    accessToken?: string;
    accessTokenExpires?: Date;
    reset(): this;
    init(): Promise<this>;
    runConnectionTest(connectionData: any): Promise<any>;
    getBatchData(...args: any[]): Promise<any>;
    getAccessToken(): Promise<any>;
    getUserData(options: Office365AdapterGetUserInfoOptions, userData?: any, pageToGet?: number): Promise<any>;
    getFieldData(): Promise<void>;
}

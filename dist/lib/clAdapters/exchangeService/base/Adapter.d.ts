import { Adapter } from '../../base/index';
/**
 * `credentials` format:
 * ```
 * {
 *   username: 'USERNAME',
 *   password: 'PASSWORD',
 *   connectUrl: '' // Exchange EWS server endpoint
 * }
 * ```
 */
export declare type ExchangeServiceCredentials = {
    username: string;
    password: string;
    connectUrl: string;
};
declare abstract class ExchangeServiceBaseAdapter extends Adapter {
    credentials: ExchangeServiceCredentials;
    sensitiveCredentialsFields: (keyof ExchangeServiceCredentials)[];
    getFieldData(): Promise<void>;
}
export default ExchangeServiceBaseAdapter;

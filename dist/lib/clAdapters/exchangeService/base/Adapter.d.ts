import { Adapter } from '../../base/index';
/**
 * `credentials` format:
 * ```
 * {
 *   email: 'email@domain.com',
 *   password: 'PASSWORD',
 *   connectUrl: '' // Exchange EWS server endpoint
 * }
 * ```
 */
export declare type ExchangeServiceCredentials = {
    email: string;
    password: string;
    connectUrl: string;
};
declare abstract class ExchangeServiceBaseAdapter extends Adapter {
    credentials: ExchangeServiceCredentials;
    sensitiveCredentialsFields: (keyof ExchangeServiceCredentials)[];
    getFieldData(): Promise<void>;
}
export default ExchangeServiceBaseAdapter;

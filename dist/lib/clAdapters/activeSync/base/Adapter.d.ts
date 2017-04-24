import { Adapter } from '../../base/index';
/**
 * `credentials` format:
 * ```
 * {
 *   username: 'email@domain.com',
 *   email: 'email@domain.com', // Typically same as username
 *   password: 'PASSWORD',
 *   connectUrl: '' // ActiveSync server endpoint
 * }
 * ```
 */
export declare type ActiveSyncCredentials = {
    username: string;
    email: string;
    password: string;
    connectUrl: string;
};
declare abstract class ActiveSyncBaseAdapter extends Adapter {
    credentials: ActiveSyncCredentials;
    sensitiveCredentialsFields: (keyof ActiveSyncCredentials)[];
    getFieldData(): Promise<void>;
}
export default ActiveSyncBaseAdapter;

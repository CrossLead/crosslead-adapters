import { Adapter } from '../../base/index';
import { AdapterCredentials } from '../../base/Adapter';

/**
 * `credentials` format:
 * ```
 * {
 *   username: 'email@domain.com',
 *   email: 'email@domain.com', // Typically same as username
 *   password: 'PASSWORD',
 * }
 * ```
 */
export type ActiveSyncCredentials = {
  username: string;
  email: string;
  password: string;
};

abstract class ActiveSyncBaseAdapter extends Adapter {
  credentials: ActiveSyncCredentials = {
    username: '',
    email: '',
    password: ''
  };

  sensitiveCredentialsFields: (keyof ActiveSyncCredentials)[] = ['password'];

  async getFieldData() {
    throw new Error('Active Sync adapters currently do not support `getFieldData()`');
  }
}

export default ActiveSyncBaseAdapter;
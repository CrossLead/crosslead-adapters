import { Adapter } from '../../base/index';
import { AdapterCredentials } from '../../base/Adapter';

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
export type ExchangeServiceCredentials = {
  email: string;
  password: string;
  connectUrl: string;
};

abstract class ExchangeServiceBaseAdapter extends Adapter {
  credentials: ExchangeServiceCredentials = {
    email: '',
    password: '',
    connectUrl: ''
  };

  sensitiveCredentialsFields: (keyof ExchangeServiceCredentials)[] = ['password'];

  async getFieldData() {
    throw new Error('ExchangeService adapters currently do not support `getFieldData()`');
  }
}

export default ExchangeServiceBaseAdapter;
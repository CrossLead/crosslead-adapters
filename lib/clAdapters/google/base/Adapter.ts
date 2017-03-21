import { Adapter } from '../../base/index';
import { AdapterCredentials } from '../../base/Adapter';


/**
 * `credentials` format:
 * ```
 * {
 *   serviceEmail: 'serviceaccount@gsuiteapp.iam.gserviceaccount.com',
 *   email: 'serviceaccount@gsuiteapp.iam.gserviceaccount.com', // Typically same as serviceEmail
 *   certificate: '-----BEGIN PRIVATE KEY-----\n...',
 * }
 * ```
 */
export type GoogleCredentials = {
  serviceEmail: string;
  email: string;
  certificate: string;
};

abstract class GoogleBaseAdapter extends Adapter {
  credentials: GoogleCredentials = {
    serviceEmail: '',
    email: '',
    certificate: ''
  };
  sensitiveCredentialsFields: (keyof GoogleCredentials)[] = ['certificate'];

  async getFieldData() {
    throw new Error('Google adapters currently do not support `getFieldData()`');
  }
}

export default GoogleBaseAdapter;
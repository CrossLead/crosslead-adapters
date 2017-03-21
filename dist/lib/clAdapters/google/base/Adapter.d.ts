import { Adapter } from '../../base/index';
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
export declare type GoogleCredentials = {
    serviceEmail: string;
    email: string;
    certificate: string;
};
declare abstract class GoogleBaseAdapter extends Adapter {
    credentials: GoogleCredentials;
    sensitiveCredentialsFields: (keyof GoogleCredentials)[];
    getFieldData(): Promise<void>;
}
export default GoogleBaseAdapter;

import Adapter from '../base/Adapter';
/**
 * Credentials (access token) currently passed as param to `callSlackApiMethod`
 */
export declare type TeamsCredentials = {
    access_token: string;
    scope: string;
};
export default class SlackAdapter extends Adapter {
    credentials: TeamsCredentials;
    sensitiveCredentialsFields: (keyof TeamsCredentials)[];
    static baseApiUrl: string;
    /**
     * Rate limit (at prototype level) slack api calls to once per second.
     */
    static callSlackApiMethod(method: string, params?: {
        [key: string]: string;
    }): any;
    init(): Promise<void>;
    getFieldData(): Promise<void>;
}

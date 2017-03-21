import Adapter from '../base/Adapter';
/**
 * Credentials (access token) currently passed as param to `callSlackApiMethod`
 */
export declare type SlackCredentials = {
    access_token: string;
    scope: string;
    user_id: string;
    team_name: string;
    team_id: string;
};
export default class SlackAdapter extends Adapter {
    credentials: SlackCredentials;
    sensitiveCredentialsFields: (keyof SlackCredentials)[];
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

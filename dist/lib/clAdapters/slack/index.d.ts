import Adapter from '../base/Adapter';
export default class SlackAdapter extends Adapter {
    static baseApiUrl: string;
    /**
     * Rate limit (at prototype level) slack api calls to once per second.
     */
    static callSlackApiMethod(method: string, params?: {
        [key: string]: string;
    }): any;
    init(): Promise<void>;
}

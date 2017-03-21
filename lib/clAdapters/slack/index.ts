import Adapter from '../base/Adapter';
import * as request from 'request';
import rateLimit from '../../utils/rate-limit';

/**
 * Credentials (access token) currently passed as param to `callSlackApiMethod`
 */
export type SlackCredentials = {
    access_token: string;
    scope: string;
    user_id: string;
    team_name: string;
    team_id: string;
};

export default class SlackAdapter extends Adapter {
  credentials: SlackCredentials = {
    access_token: '',
    scope: '',
    user_id: '',
    team_name: '',
    team_id: ''
  };
  sensitiveCredentialsFields: (keyof SlackCredentials)[] = ['access_token'];

  static baseApiUrl = 'https://slack.com/api';

  /**
   * Rate limit (at prototype level) slack api calls to once per second.
   */
  @rateLimit<any>(1000)
  static callSlackApiMethod(method: string, params: {[key: string]: string} = {}): any {
    let paramString = '';
    for (const p in params) {
      paramString += `${p}=${params[p]}&`;
    }

    return new Promise((resolve, reject) => {
      request.get(
        `${this.baseApiUrl}/${method}?${paramString}`,
        (err, resp, body) => {
          if (!err && resp.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            reject(err);
          }
        }
      );
    });
  }

  // null init function...
  async init() {}

  async getFieldData() {
    throw new Error('Slack adapters currently do not support `getFieldData()`');
  }
}

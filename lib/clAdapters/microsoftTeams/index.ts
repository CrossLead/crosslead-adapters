import Adapter from '../base/Adapter';
import * as request from 'request';
import rateLimit from '../../utils/rate-limit';

export type TeamsCredentials = {
    access_token: string;
    scope: string;
};

export default class MicrosoftTeamsAdapter extends Adapter {
  credentials: TeamsCredentials = {
    access_token: '',
    scope: ''
  };
  sensitiveCredentialsFields: (keyof TeamsCredentials)[] = ['access_token'];

  static baseApiUrl = 'https://slack.com/api';

  /**
   * Rate limit (at prototype level) slack api calls to once per second.
   */
  @rateLimit<any>(1000)
  static callTeamsApiMethod(method: string, params: {[key: string]: string} = {}): any {
    console.log('callTeamsApiMethod');
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
  async init() {
    console.log('init MSTeams Adapter');
  }

  async getFieldData() {
    throw new Error('Microsoft Teams adapters currently do not support `getFieldData()`');
  }
}

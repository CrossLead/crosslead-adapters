import Adapter from '../base/Adapter';
import * as request from 'request';
import rateLimit from '../../utils/rate-limit';

export default class SlackAdapter extends Adapter {
  /**
   * Credentials (access token) currently passed as request params.
   * TODO: store in this property.
   */
  credentials = {};
  sensitiveCredentialsFields = [];

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

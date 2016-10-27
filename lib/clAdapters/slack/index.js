import Adapter from '../base/Adapter';
import request from 'request';
import rateLimit from '../../utils/rate-limit';

export default class SlackAdapter extends Adapter {


  static baseApiUrl = 'https://slack.com/api';

  /**
   * Rate limit (at prototype level) slack api calls to once per second.
   */
  @rateLimit(1000)
  static callSlackApiMethod(method, params = {}) {
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
  init() {}

}

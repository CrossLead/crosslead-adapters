import Adapter from '../base/Adapter';
import rateLimit from '../../utils/rate-limit';
import { Client } from '@microsoft/microsoft-graph-client';

export type TeamsCredentials = {
    refresh_token: string;
    access_token: string,
    scope: string,
    token_type: string,
    expires: number;
    organizationId: string,
    orgName: string,
    appId: string

};

export default class MicrosoftTeamsAdapter extends Adapter {

  credentials: TeamsCredentials = {
    refresh_token: '',
    access_token: ''
    scope: '',
    token_type: 'Bearer',
    expires: 0,
    organizationId: '',
    orgName: '',
    appId: ''

  };

  sensitiveCredentialsFields: (keyof TeamsCredentials)[] = ['refresh_token', 'access_token'];

  /**
   * Rate limit api calls to once per second.
   */
  @rateLimit<any>(1000)
  callTeamsApiMethod(method: string, params: {[key: string]: string} = {}): any {
    let paramString = '';
    for (const p in params) {
      paramString += `${p}=${params[p]}&`;
    }

    return new Promise((resolve, reject) => {

    });
  }

  //The access token is good only for an hour 
  async init() {}


  async const requestToken () {
  try {
    // let body = `${clientId}&scope=${encodeURI(scope)}&redirect_uri=${encodeURI(
    //   myCurrentURL
    // )}/api/msTeams/oauthCallback&client_secret=AA-d3=391tUm/AfyaQ_]Wp.i?B3TzfX8`;

    // if (isRefresh) {
    //   body = body + `&refresh_token=${accessCode}&grant_type=refresh_token`;
    // } else {
    //   body = body + `&code=${accessCode}&grant_type=authorization_code`;
    //   // body = body + `&grant_type=client_credentials`;
    // }

    // const paramString = `/${tenant}/oauth2/v2.0/token`;
    // const response = await fetch(`${MICROSOFT_LOGIN}${paramString}`, {
    //   method: 'POST',
    //   body,
    // });

    // return (await response.json()) as TokenSuccessResponse;
  } catch (err) {
    // logger.error(err);
    throw err;
  }
};

  async getFieldData() {
    throw new Error('Microsoft Teams adapters currently do not support `getFieldData()`');
  }
}
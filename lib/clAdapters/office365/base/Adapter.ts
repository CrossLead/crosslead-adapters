import * as uuid                       from 'node-uuid';
import * as crypto                     from 'crypto';
import * as request                    from 'request-promise';
import * as moment                     from 'moment';
import * as _                          from 'lodash';
import Adapter                    from '../../base/Adapter';
import Office365BaseService       from './Service';
import Office365BaseConfiguration from './Configuration';

export type Office365Credentials = {
  email: string;
  clientId: string,
  tenantId: string,
  certificate: string,
  certificateThumbprint: string
};

export interface Office365AdapterGetUserInfoOptions {
  userProfile: any;
  filterStartDate: Date;
  filterEndDate: Date;
  additionalFields?: any;
  $filter?: any;
  apiType?: any;
  maxPages?: number;
  recordsPerPage?: number;
}



/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
export default class Office365BaseAdapter extends Adapter {
  credentials: Office365Credentials;
  sensitiveCredentialsFields: (keyof Office365Credentials)[] = ['certificate'];

  _config: Office365BaseConfiguration;
  _service: Office365BaseService;

  static baseFields: any = {};

  accessToken?: string;
  accessTokenExpires?: Date;

  reset() {
    delete this._config;
    delete this._service;
    return this;
  }

  async init() {
    this._config  = new Office365BaseConfiguration(this.credentials);
    this._service = new Office365BaseService(this._config);
    await this._service.init();
    console.log(`Successfully initialized ${this.constructor.name} for email: ${this.credentials['email']}`);
    return this;
  }


  async runConnectionTest(connectionData: any) {
    this._config = new Office365BaseConfiguration(connectionData.credentials);

    const today           = () => moment().utc().startOf('day'),
          filterStartDate = today().add(-1, 'days').toDate(),
          filterEndDate   = today().toDate(),
          data            = await this.getBatchData(
                              [ {
                                email: this._config.credentials['email'],
                                emailAfterMapping: this._config.credentials['email']
                              } ],
                              filterStartDate,
                              filterEndDate,
                              ''
                            );

    // to see if it really worked, we need to pass in the first result
    return data.success && data.results[0] ? data.results[0] : data;
  }

  async getBatchData(...args: any[]): Promise<any> {
    throw new Error(`Must override in subclass!`);
  }


  async getAccessToken() {

    if (this.accessToken &&
        (typeof this.accessTokenExpires !== 'undefined') &&
        this.accessTokenExpires > new Date()) {
      return this.accessToken;
    }

    const {
      credentials : {
        clientId,
        tenantId,
        certificate,
        certificateThumbprint
      },
      options : {
        apiVersion
      }
    } = this._config;

    const tokenRequestUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token?api-version=${apiVersion}`;

    const jwtHeader = {
      'alg': 'RS256',
      'x5t': certificateThumbprint
    };

    // expire token in one hour
    const accessTokenExpires = ((new Date()).getTime() + 360000) / 1000;

    // grab new access token 10 seconds before expiration
    this.accessTokenExpires = new Date(accessTokenExpires * 1000 - 10000);

    const jwtPayload = {
      'aud': tokenRequestUrl,
      'exp': accessTokenExpires,
      'iss': clientId,
      'jti': uuid.v4(),
      'nbf': accessTokenExpires - 2 * 3600, // one hour before now
      'sub': clientId
    };

    const encode               = (header: any) => new Buffer(JSON.stringify(header)).toString('base64'),
          encodedJwtHeader     = encode(jwtHeader),
          encodedJwtPayload    = encode(jwtPayload),
          stringToSign         = encodedJwtHeader + '.' + encodedJwtPayload,
          encodedSignedJwtInfo = crypto
            .createSign('RSA-SHA256')
            .update(stringToSign)
            .sign(certificate, 'base64');

    const tokenRequestFormData = {
      client_id: clientId,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      grant_type: 'client_credentials',
      resource: 'https://outlook.office365.com/',
      client_assertion: encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo
    };

    const tokenRequestOptions = {
      method: 'POST',
      port: 443,
      uri: tokenRequestUrl,
      formData: tokenRequestFormData,
    };

    try {
      const tokenData = JSON.parse(await request(tokenRequestOptions));
      if (tokenData && tokenData.access_token) {
        return this.accessToken = tokenData.access_token;
      } else {
        throw new Error('Could not get access token.');
      }
    } catch (tokenData) {
      if (tokenData.name === 'StatusCodeError') {
        const messageData = JSON.parse(
          tokenData
            .message
            .replace(tokenData.statusCode + ' - ', '')
            .replace(/\"/g, '"')
        );

        throw new Error(messageData);
      } else {
        throw new Error(tokenData);
      }
    }
  }

  async getUserData(
    options: Office365AdapterGetUserInfoOptions,
    userData?: any,
    pageToGet = 1
  ): Promise<any> {
    const {
      userProfile,
      filterStartDate,
      filterEndDate,
      additionalFields,
      $filter,
      apiType,
      maxPages = 20,
      recordsPerPage = 25
    } = options;

    // accumulation of data
    userData = userData || { userProfile, filterStartDate, filterEndDate };

    const accessToken          = await this.getAccessToken(),
          { apiVersion }       = this._config.options,
          skip                 = (pageToGet - 1) * recordsPerPage,
          // extract static property...
          { baseFields = [] }       = this.constructor as any,
          // parameters to query email with...
          params: any               = {
            startDateTime: filterStartDate.toISOString(),
            endDateTime: filterEndDate.toISOString(),
            $top:     recordsPerPage,
            $skip:    skip,
            $select:  baseFields.join(',') + (additionalFields ? `,${additionalFields}` : ''),
          };
    if (apiType !== 'calendarview') {
      params.$filter = $filter;
    }

    // format parameters for url
    const urlParams = _(params)
      .map((value: string, key: string) => `${key}=${value}`)
      .join('&');

    const requestOptions = {
      method: 'GET',
      uri: `https://outlook.office365.com/api/v${apiVersion}/users('${userProfile.emailAfterMapping}')/${apiType}?${urlParams}`,
      headers : {
        Authorization: `Bearer ${accessToken}`,
        Accept:        'application/json;odata.metadata=none'
      }
    };

    try {
      userData.success = true;

      const { value: records = [] as any[] } = JSON.parse(await request(requestOptions)) || {};
      const e = userProfile.emailAfterMapping;

      if (userProfile.getAttachments && records.length) {
        for (let recIter = 0; recIter < records.length; recIter++) {
          const rec = records[recIter];
          const mid = rec.Id || '';
          rec.attachments = [];
          const attachmentOptions = {
            method: 'GET',
            uri: `https://outlook.office365.com/api/v${apiVersion}/users('${e}')/messages/${mid}/attachments`,
            headers : {
              Authorization: `Bearer ${accessToken}`,
              Accept:        'application/json;odata.metadata=none'
            }
          };
          const attachmentData = JSON.parse(await request(attachmentOptions)) || {};
          if (attachmentData.value && attachmentData.value.length > 0) {
            rec.attachments = attachmentData.value;
          }
        }
      }

      if (records && pageToGet === 1) {
        userData.data = records;
      }

      if (records && pageToGet > 1) {
        userData.data.push(...records);
      }

      // if the returned results are the maximum number of records per page,
      // we are not done yet, so recurse...
      if (records.length === recordsPerPage && pageToGet <= maxPages) {
        return this.getUserData(options, userData, pageToGet + 1);
      } else {
        return userData;
      }

    } catch (err) {
      Object.assign(userData, {
        success: false,
        errorMessage: new Error(err.name !== 'StatusCodeError' ?
                        JSON.stringify(err)          :
                        JSON.parse(
                              err.message
                                 .replace(err.statusCode + ' - ', '')
                                 .replace(/\"/g, '"')
                            )
                            .message)
      });
      return true;
    }

  }

  async getFieldData() {
    throw new Error('Office365 adapters currently do not support `getFieldData()`');
  }
}

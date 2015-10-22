import uuid                       from 'node-uuid';
import crypto                     from 'crypto';
import request                    from 'request-promise';
import moment                     from 'moment';
import Adapter                    from '../../base/Adapter';
import Office365BaseService       from './Service';
import Office365BaseConfiguration from './Configuration';


/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */
export default class Office365BaseAdapter extends Adapter {


  reset() {
    delete this._config;
    delete this._service;
    return this;
  }

  async init() {
    this._config  = new Office365BaseConfiguration(this.credentials, { apiVersion: '1.0' })
    this._service = new Office365BaseService(this._config);
    await this._service.init();
    console.log(`Successfully initialized ${this.name} for email: ${this.credentials.email}`);
    return this;
  }


  async runConnectionTest(connectionData) {
    this._config = new Office365BaseConfiguration(connectionData.credentials);

    const today           = () => moment().utc().startOf('day'),
          filterStartDate = today().add(-1, 'days').toDate(),
          filterEndDate   = today().toDate(),
          data            = await this.getBatchData(
                              [this._config.credentials.email],
                              filterStartDate,
                              filterEndDate,
                              ''
                            );

    //to see if it really worked, we need to pass in the first result
    return data.success && data.results[0] ? data.results[0]: data;
  }


  async getAccessToken() {

    if (this.accessToken && this.accessTokenExpires > new Date()) {
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
    this.accessTokenExpires = new Date(accessTokenExpires*1000 - 10000);

    const jwtPayload = {
      'aud': tokenRequestUrl,
      'exp': accessTokenExpires,
      'iss': clientId,
      'jti': uuid.v4(),
      'nbf': accessTokenExpires - 2*3600, // one hour before now
      'sub': clientId
    };

    const encode               = header => new Buffer(JSON.stringify(header)).toString('base64'),
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

}

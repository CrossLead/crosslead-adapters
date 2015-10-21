import uuid             from 'node-uuid';
import crypto           from 'crypto';
import rp               from 'request-promise';
import moment           from 'moment';
import _                from 'lodash';
import { Adapter,
         Configuration,
         Service }      from '../base/';



export default class Office365Adapter extends Adapter {


  // collect these fields always...
  static baseFields = [
    'Id',
    'Categories',
    'DateTimeCreated',
    'Subject',
    'Importance',
    'HasAttachments',
    'ParentFolderId',
    'From',
    'Sender',
    'ToRecipients',
    'CcRecipients',
    'BccRecipients',
    'ReplyTo',
    'ConversationId',
    'DateTimeReceived',
    'DateTimeSent',
    'IsDeliveryReceiptRequested',
    'IsReadReceiptRequested',
    'IsRead'
  ]


  // convert the names of the api response data
  static emailFieldNameMap = {
    // Desired...                 // Given...
    'emails':                     'value',
    'messageId':                  'Id',
    'conversationId':             'ConversationId',
    'dateTimeSent':               'DateTimeSent',
    'dateTimeReceived':           'DateTimeReceived',
    'importance':                 'Importance',
    'folderId':                   'ParentFolderId',
    'categories':                 'Categories',
    'contentType':                'Body.ContentType',
    'subject':                    'Subject',
    'bodyPreview':                'BodyPreview',
    'body':                       'Body.Content',
    'fromAddress':                'From.EmailAddress.Address',
    'fromName':                   'From.EmailAddress.Name',
    'toRecipients':               'ToRecipients',
    'toRecipientAddress':         'EmailAddress.Address',
    'toRecipientName':            'EmailAddress.Name',
    'ccRecipients':               'CcRecipients',
    'ccRecipientAddress':         'EmailAddress.Address',
    'ccRecipientName':            'EmailAddress.Name',
    'bccRecipients':              'BccRecipients',
    'bccRecipientAddress':        'EmailAddress.Address',
    'bccRecipientName':           'EmailAddress.Name',
    'isDeliveryReceiptRequested': 'IsDeliveryReceiptRequested',
    'isReadReceiptRequested':     'IsReadReceiptRequested',
    'hasAttachments':             'HasAttachments',
    'isDraft':                    'IsDraft',
    'isRead':                     'IsRead'
  }


  reset() {
    delete this._config;
    delete this._service;
    return this;
  }


  async init() {
    this._config = new Configuration(this.credentials, { apiVersion: '1.0' })
    this._service = new Service(this._config);
    await this._service.init();
    const msg = 'Successfully initialized Office365 for email: %s';
    console.log(msg, this.credentials.email);
    return this;
  }


  async getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {

    const { emailFieldNameMap } = Office365Adapter,
          dataAdapterRunStats   = {
            emails,
            filterStartDate,
            filterEndDate,
            success: false,
            runDate: moment().utc().toDate()
          };

    try {

      const emailData = await* emails.map(email => this.getEmailsForUser(
        email,
        filterStartDate,
        filterEndDate,
        additionalFields
      ));

      // replace data keys with desired mappings...
      const results = _.map(emailData, user => {
        const emailArray = (user.success && user.data[emailFieldNameMap.emails]) || [];
        return {
          email:            user.email,
          filterStartDate:  user.filterStartDate,
          filterEndDate:    user.filterEndDate,
          success:          user.success,
          errorMessage:     user.errorMessage,
          // map data with desired key names...
          data: _.map(emailArray, originalEmailMessage => {
            const mappedEmailMessage = {};

            // change to desired names
            _.each(emailFieldNameMap, (have, want) => {
              const mapped = _.get(originalEmailMessage, have);
              mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
            });

            // grab info from different correspondent types...
            // (since we're using an array literal here, 'for of' syntax will compile reasonably)
            for (const type of ['to', 'cc', 'bcc']) {
              const key = `${type}Recipient`;
              mappedEmailMessage[`${key}s`] = originalEmailMessage[emailFieldNameMap[`${key}s`]]
                .map(recipient => {
                  return {
                    address: _.get(recipient, emailFieldNameMap[`${key}Address`]),
                    name:    _.get(recipient, emailFieldNameMap[`${key}Name`])
                  }
                });
            }

            return mappedEmailMessage;
          })
        };
      });

      // return results and success!
      return {
        ...dataAdapterRunStats,
        results,
        success: true
      };

    } catch (errorMessage) {
      console.log(errorMessage.stack);
      console.log('Office365 GetBatchData Error: ' + JSON.stringify(errorMessage));
      return { ...dataAdapterRunStats, errorMessage };
    }

  }


  async runConnectionTest(connectionData) {
    this._config = new Configuration(connectionData.credentials);

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

    const encodedJwtHeader     = new Buffer(JSON.stringify(jwtHeader)).toString('base64'),
          encodedJwtPayload    = new Buffer(JSON.stringify(jwtPayload)).toString('base64'),
          stringToSign         = encodedJwtHeader + '.' + encodedJwtPayload,
          encodedSignedJwtInfo = crypto
            .createSign('RSA-SHA256')
            .update(stringToSign)
            .sign(certificate, 'base64');

    //define assertion
    const clientAssertion = encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo;

    const tokenRequestFormData = {
      client_id: clientId,
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      grant_type: 'client_credentials',
      resource: 'https://outlook.office365.com/',
      client_assertion: clientAssertion
    };

    const tokenRequestOptions = {
      method: 'POST',
      port: 443,
      uri: tokenRequestUrl,
      formData: tokenRequestFormData,
    };

    try {
      var tokenData = JSON.parse(await rp(tokenRequestOptions));
      if (tokenData && tokenData.access_token) {
        return this.accessToken = tokenData.access_token;
      } else {
        throw new Error('Could not get access token.');
      }
    } catch (err) {
      const tokenData = JSON.parse(JSON.stringify(err));
      if (tokenData.name === 'StatusCodeError') {
        const entireMessage = tokenData.message,
              messageJson   = entireMessage.replace(tokenData.statusCode + ' - ', ''),
              messageData   = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'),'"'));

        throw new Error(messageData);
      } else {
        throw new Error(err);
      }
    }
  }


  async getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet=1) {
    // accumulation of data
    emailData = emailData || { email, filterStartDate, filterEndDate };

    const accessToken     = await this.getAccessToken(),
          { apiVersion }  = this._config.options,
          recordsPerPage  = 25,
          maxPages        = 20,
          skip            = ((pageToGet -1) * recordsPerPage) + 1,
          // parameters to query email with...
          params          = {
            $top:     recordsPerPage,
            $skip:    skip,
            $select:  Office365Adapter.baseFields.join(',') + additionalFields,
            $filter:  ` IsDraft eq false
                          and DateTimeSent ge ${filterStartDate.toISOString().substring(0, 10)}
                          and DateTimeSent lt ${filterEndDate.toISOString().substring(0, 10)}
                      `.replace(/\s+/g, ' ')
                       .trim()
          };

    // format parameters for url
    const urlParams = _(params)
      .map((value, key) => `${key}=${value}`)
      .join('&');

    const emailRequestOptions = {
      method: 'GET',
      uri: `https://outlook.office365.com/api/v${apiVersion}/users('${email}')/messages?${urlParams}`,
      headers : {
        Authorization: `Bearer ${accessToken}`,
        Accept:        'application/json;odata.metadata=none'
      }
    };

    try {
      emailData.success = true;
      const parsedBody = JSON.parse(await rp(emailRequestOptions));

      if (parsedBody && pageToGet === 1) {
        emailData.data = parsedBody;
      } else if (parsedBody.value && pageToGet > 1) {
        emailData.data.value = emailData.data.value.concat(parsedBody.value);
      }

      if (parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages) {
        return this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet + 1);
      } else {
        return emailData;
      }
    } catch (err) {
      emailData.success = false;
      if (err.name === 'StatusCodeError') {
        const entireMessage = err.message,
              messageJson = entireMessage.replace(err.statusCode + ' - ', ''),
              messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'),'"'));

        emailData.errorMessage = messageData.error.message;
      } else {
        emailData.errorMessage = JSON.stringify(err);
      }
      return true;
    }

  }


}

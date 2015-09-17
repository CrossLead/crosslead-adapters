import _              from 'lodash';
import crypto         from 'crypto';
import moment         from 'moment';
import request        from 'request-promise';
import querystring    from 'querystring';
import BaseAdapter    from './baseAdapter';
import Configuration  from './Configuration';
import Service        from './Service';


export default class GoogleCalendarAdapter extends BaseAdapter {
  // no constructor necessary if no new logic...


  async init() {
    this._config = new Configuration(this.credentials);
    this._service = new Service(this._config);

    await this._service.init();

    console.log(
      'Successfully initialized gmail adapter for email: %s',
      this.credentials.email
    );

    return this;
  }


  reset() {
    delete this._config;
    delete this._service;
  }


  async getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
    const {
            clientId,
            email,
            serviceEmail,
            certificate
          } = this._config.credentials,
          { apiVersion } = this.options,
          dataAdapterRunStats = {
            success: true,
            runDate: moment().utc().toDate(),
            filterStartDate,
            filterEndDate,
            emails
          };

    try {
      //first try to get token for the admin - if that fails, then all will fail
      await getAccessToken(clientId, serviceEmail, email, certificate);

      dataAdapterRunStats.results = mapEmailData(
        await* _.map(emails, email => getUserEmails({
          clientId,
          serviceEmail,
          apiVersion,
          filterStartDate,
          filterEndDate,
          additionalFields,
          privateKey  : certificate,
          userEmail   : email,
          result      : { email, filterStartDate, filterEndDate }
        }))
      );

      return dataAdapterRunStats;
    } catch (err) {
      dataAdapterRunStats.success = false;
      dataAdapterRunStats.errorMessage = err;
      console.log('GoogleMail GetBatchData Error: ' + JSON.stringify(err));
      return dataAdapterRunStats;
    }

  }

  async runConnectionTest(connectionData) {
    this._config = new Configuration(connectionData.credentials);

    const filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate(),
          filterEndDate = moment().utc().startOf('day').toDate(),
          data = await this.getBatchData(
            [this._config.credentials.email],
            filterStartDate,
            filterEndDate,
            ''
          );

    if (data.success && data.results[0]) {
      //to see if it really worked, we need to pass in the first result
      return data.results[0];
    } else {
      return data;
    }
  }

  async runMessageTest(connectionData) {
    this._config = new Configuration(connectionData.credentials);

    try {
      const filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate(),
            filterEndDate = moment().utc().startOf('day').toDate(),
            data = await this.getBatchData(
              [this._config.credentials.email],
              filterStartDate,
              filterEndDate,
              'Subject,BodyPreview,Body'
            );

      console.log('runMessageTest worked', data.results[0]);
    } catch (err) {
      console.log('runMessageTest Error: ' + JSON.stringify(err));
    }

  }

}


async function getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result) {
  const fields = additionalFields
    .replace('BodyPreview', 'snippet')
    .replace('Body',        'payload(parts)')
    .replace('Subject',     'payload(parts)');

  result.messageData = JSON.parse(await request({
    method: 'GET',
    uri: (
      'https://www.googleapis.com/gmail/' +
        'v'           + apiVersion +
        '/users/'     + userEmail +
        '/messages/'  + messageId +
        '?fields=id,threadId,labelIds,payload(headers)' + (fields ? `,${fields}` : '')
    ),
    headers : {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  }));

  //remove subject header
  if (!/Subject/.test(additionalFields)) {
    const subjectHeader = _.find(
      _.get(result, 'messageData.payload.headers'),
      { name : 'Subject' }
    );

    if (subjectHeader) {
      subjectHeader.value = '';
    }
  }

  return true;
};

async function getAccessToken(clientId, adminEmail, userEmail, privateKey) {
  const tokenRequestUrl = 'https://www.googleapis.com/oauth2/v3/token',
        unixEpochTime = Math.floor((new Date()).getTime() / 1000),
        jwtHeader = {
          alg: 'RS256',
          typ: 'JWT'
        },
        jwtPayload = {
          iss: adminEmail,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          aud: tokenRequestUrl,
          exp: unixEpochTime + 3600,
          iat: unixEpochTime,
          sub: userEmail
        };

  const encode = header => new Buffer(JSON.stringify(header)).toString('base64'),
        encodedJwtHeader = encode(jwtHeader),
        encodedJwtPayload = encode(jwtPayload),
        stringToSign = [encodedJwtHeader, encodedJwtPayload].join('.'),
        signer = crypto.createSign('RSA-SHA256');

  signer.update(stringToSign);

  const encodedSignedJwtInfo = signer.sign(privateKey, 'base64'),
        //define assertion
        clientAssertion = [encodedJwtHeader, encodedJwtPayload, encodedSignedJwtInfo].join('.'),
        tokenRequestFormData = {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: clientAssertion
        };

  const requestData = querystring.stringify(tokenRequestFormData),
        requestDataLength = requestData.length;

  try {
    const tokenData = JSON.parse(await request({
      method: 'POST',
      port: 443,
      uri: tokenRequestUrl,
      body: requestData,
      multipart: false,
      headers: {
        'Content-Length': requestDataLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }));

    if (tokenData && tokenData.access_token) {
      return tokenData.access_token;
    } else {
      return Promise.reject('Could not get access token.');
    }
  } catch (err) {
    const tokenData = JSON.parse(JSON.stringify(err));
    if (tokenData.name === 'StatusCodeError') {
      const entireMessage = tokenData.message,
            messageJson = entireMessage.replace(tokenData.statusCode + ' - ', ''),
            messageData = JSON.parse(messageJson.replace(/\"/g,'"'));

      return Promise.reject(messageData);
    } else {
      return Promise.reject(err);
    }
  }

};

async function getUserEmails(opts) {

  const {
    clientId,
    serviceEmail,
    userEmail,
    privateKey,
    apiVersion,
    filterStartDate,
    filterEndDate,
    additionalFields,
    result
  } = opts;

  try {

    const token = await getAccessToken(clientId, serviceEmail, userEmail, privateKey),
          emailRequestOptions = {
            method: 'GET',
            uri: (
              'https://www.googleapis.com/gmail/' +
                  'v' + apiVersion +
                  '/users/' + userEmail +
                  '/messages?q=after:'   + filterStartDate.toISOString().substring(0, 10) +
                         ' AND before: ' + filterEndDate.toISOString().substring(0, 10)
            ),
            headers : {
              Authorization: 'Bearer ' + token,
              Accept: 'application/json;odata.metadata=none'
            }
          };

    result.success = true;

    result.data = {
      messageList: JSON.parse(await request(emailRequestOptions)),
      messages: []
    };

    return await* _.map(result.data.messageList.messages, message => {
      result.data.messages.push({ messageId: message.id });
      return getSingleMessageDetails(
        message.id,
        userEmail,
        token,
        apiVersion,
        additionalFields,
        message
      );
    })

  } catch (err) {

    result.success = false;
    if (err.name === 'StatusCodeError') {
      const entireMessage = err.message,
            messageJson = entireMessage.replace(err.statusCode + ' - ', ''),
            messageData = JSON.parse(messageJson.replace(/\"/g,'"'));
      result.errorMessage = messageData.error.message;
    } else {
      result.errorMessage = JSON.stringify(err);
    }
    return true;

  }

}

function getHeaderValue(message, headerName) {
  const headerValues = _(message.payload.headers)
          .filter(header => header.name === headerName)
          .pluck('value')
          .value();
  if (headerValues.length > 0) {
    return headerValues[0];
  } else {
    return null;
  }
}

// TODO: try to check if there is actually an email address?
function getEmailAddressObjectFromString(value) {
  var returnObject = {
    name: value,
    address: value
  };

  if (value && value.indexOf('>') > 0) {
    var valueArray = value.split(' ');
    returnObject.address = valueArray[valueArray.length - 1].replace('<', '').replace('>', '');
    returnObject.name = value.replace(' ' + valueArray[valueArray.length - 1], '');
  }

  return returnObject;
};

var hasLabel = function(message, labelValue) {
  return message.labelIds.indexOf(labelValue) >= 0;
};


function mapEmailData(emailData) {
  return emailData.map(user => ({
    email:            user.email,
    filterStartDate:  user.filterStartDate,
    filterEndDate:    user.filterEndDate,
    success:          user.success,
    errorMessage:     user.errorMessage,
    data:             !user.success ? [] : user.data.messages.map(cleanMessage)
  }));
}


function cleanMessage(message) {

  const messageData = message.messageData,
        dateReceived = getHeaderValue(messageData, 'Received');

  if (dateReceived) {
    var datePartOfValue = dateReceived.split(';')[1];
    message.dateTimeReceived = moment(new Date(datePartOfValue)).utc().toDate();
  }

  message.importance = 'Normal';
  if (hasLabel(messageData, 'IMPORTANT')) {
    message.importance = 'Important';
  }

  if (hasLabel(messageData, 'SENT')) {
    message.folderId = message.folderName = 'Sent Items';
  } else {
    message.folderId = message.folderName = 'Inbox';
  }

  if (_.get(messageData, 'payload.parts.length')) {
    message.contentType = messageData.payload.parts[0].mimeType;
    message.body = new Buffer(messageData.payload.parts[0].body.data, 'base64').toString();
  }

  const addresses = field => getHeaderValue(messageData, field)
    .split(',')
    .map(getEmailAddressObjectFromString);

  return _.extend(message, {
    conversationId:               messageData.threadId,
    dateTimeSent:                 moment(new Date(getHeaderValue(messageData, 'Date'))).utc().toDate(),
    categories:                   messageData.labelIds,
    subject:                      getHeaderValue(messageData, 'Subject'),
    bodyPreview:                  messageData.snippet,
    isDeliveryReceiptRequested:   null,
    isReadReceiptRequested:       null,
    hasAttachments:               null,
    isDraft:                      null,
    isRead:                       hasLabel(messageData, 'READ'),
    fromAddress:                  getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).address,
    fromName:                     getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).name,
    toRecipients:                 addresses('To'),
    ccRecipients:                 addresses('Cc'),
    bccRecipients:                addresses('Bcc')
  });
}

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = GoogleAdapter;

var _crypto = require('crypto');

var crypto = _interopRequireWildcard(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _util = require('util');

var util = _interopRequireWildcard(_util);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _querystring = require('querystring');

var querystring = _interopRequireWildcard(_querystring);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _Adapter = require('../base/Adapter');

var _Adapter2 = _interopRequireDefault(_Adapter);

var _googleJs = require('./google-js.js');

var GoogleMail = _interopRequireWildcard(_googleJs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function GoogleAdapter() {
  _Adapter2.default.call(this);
};

util.inherits(GoogleAdapter, _Adapter2.default);

GoogleAdapter.prototype.init = function () {
  var _this = this;
  this._config = new GoogleMail.Configuration(this.credentials);
  this._service = new GoogleMail.Service(this._config);
  return this._service.init().then(function () /*client*/{
    var msg = 'Successfully initialized gmail adapter for email: %s';
    console.log(msg, _this.credentials.email);
    return _this;
  });
};

GoogleAdapter.prototype.reset = function () {
  delete this._config;
  delete this._service;
};

var getSingleMessageDetails = function getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result) {
  var additionalFieldsToQuery = additionalFields.replace('BodyPreview', 'snippet');
  additionalFieldsToQuery = additionalFieldsToQuery.replace('Body', 'payload(parts)');
  additionalFieldsToQuery = additionalFieldsToQuery.replace('Subject', 'payload(parts)');

  if (additionalFieldsToQuery !== '') {
    additionalFieldsToQuery = ',' + additionalFieldsToQuery;
  }

  var messageRequestOptions = {
    method: 'GET',
    uri: 'https://www.googleapis.com/gmail/v' + apiVersion + '/users/' + userEmail + '/messages/' + messageId + '?fields=id,threadId,labelIds,payload(headers)' + additionalFieldsToQuery,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };
  return (0, _requestPromise2.default)(messageRequestOptions).then(function (messageDetails) {
    result.messageData = JSON.parse(messageDetails);
    if (additionalFields.indexOf('Subject') === -1) {
      //remove subject header
      var headers = _.get(result, 'messageData.payload.headers');
      var n = _.get(headers, 'length');
      if (n > 0) {
        for (var headerIter = 0; headerIter < n; headerIter++) {
          if (headers[headerIter].name === 'Subject') {
            headers[headerIter].value = '';
          }
        }
      }
    }

    return true;
  });
};

var getAccessToken = function getAccessToken(clientId, adminEmail, userEmail, privateKey) {
  var tokenRequestUrl = 'https://www.googleapis.com/oauth2/v3/token';
  var unixEpochTime = Math.floor(new Date().getTime() / 1000);

  var jwtHeader = {
    alg: 'RS256',
    typ: 'JWT'
  };

  var jwtPayload = {
    'iss': adminEmail,
    'scope': 'https://www.googleapis.com/auth/gmail.readonly',
    'aud': tokenRequestUrl,
    'exp': unixEpochTime + 3600,
    'iat': unixEpochTime,
    'sub': userEmail
  };

  var encodedJwtHeader = new Buffer((0, _stringify2.default)(jwtHeader)).toString('base64');
  var encodedJwtPayload = new Buffer((0, _stringify2.default)(jwtPayload)).toString('base64');
  var stringToSign = encodedJwtHeader + '.' + encodedJwtPayload;

  //sign it!
  var signer = crypto.createSign('RSA-SHA256');
  signer.update(stringToSign);

  var encodedSignedJwtInfo = signer.sign(privateKey, 'base64');

  //define assertion
  var clientAssertion = encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo;

  var tokenRequestFormData = {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: clientAssertion
  };

  var requestData = querystring.stringify(tokenRequestFormData);
  var requestDataLength = requestData.length;

  var tokenRequestOptions = {
    method: 'POST',
    port: 443,
    uri: tokenRequestUrl,
    body: requestData,
    multipart: false,
    headers: {
      'Content-Length': requestDataLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  return (0, _requestPromise2.default)(tokenRequestOptions).then(function (body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      return tokenData.access_token;
    } else {
      return _promise2.default.reject('Could not get access token.');
    }
  }).catch(function (err) {
    var tokenData = JSON.parse((0, _stringify2.default)(err));
    if (tokenData.name === 'StatusCodeError') {
      var entireMessage = tokenData.message;
      var messageJson = entireMessage.replace(tokenData.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
      //console.log('-----');
      //console.log(messageData);
      return _promise2.default.reject(messageData);
    } else {
      return _promise2.default.reject(err);
    }
  });
};

var getMoreEmails = function getMoreEmails(messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, nextPageToken) {
  emailRequestOptions.uri = firstUri + '&pageToken=' + nextPageToken;
  var tempPageToken = '';
  return (0, _requestPromise2.default)(emailRequestOptions).then(function (body) {
    var messageDetailPromises = [];
    var messageList = JSON.parse(body);
    tempPageToken = messageList.nextPageToken;

    if (messageList.messages) {
      for (var messageIter = 0; messageIter < messageList.messages.length; messageIter++) {
        var messageId = messageList.messages[messageIter].id;
        var nextMessage = { messageId: messageId };
        messages.push(nextMessage);
        messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, nextMessage));
      }
    }

    return _promise2.default.all(messageDetailPromises);
  }).then(function () {
    if (tempPageToken) {
      return getMoreEmails(messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, tempPageToken);
    } else {
      return true;
    }
  });
};

var getUserEmails = function getUserEmails(clientId, serviceEmail, userEmail, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, result) {
  var token = '';
  var emailRequestOptions = {};
  var firstUri = '';
  return getAccessToken(clientId, serviceEmail, userEmail, privateKey).then(function (tokenResponse) {
    token = tokenResponse;
    var queryFilter = '\"after:' + filterStartDate.toISOString().substring(0, 10).replace(/-/g, '/') + ' before:' + filterEndDate.toISOString().substring(0, 10).replace(/-/g, '/') + '\"';

    firstUri = 'https://www.googleapis.com/gmail/v' + apiVersion + '/users/' + userEmail + '/messages?maxResults=100&q=' + queryFilter;

    emailRequestOptions = {
      method: 'GET',
      uri: firstUri,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json;odata.metadata=none'
      }
    };
    return (0, _requestPromise2.default)(emailRequestOptions);
  }).then(function (body) {
    var messageDetailPromises = [];
    result.data = {};
    result.data.messageList = JSON.parse(body);
    result.data.messages = [];

    var messages = _.get(result, 'data.messageList.messages');

    if (messages) {
      for (var messageIter = 0; messageIter < messages.length; messageIter++) {
        var messageId = messages[messageIter].id;
        result.data.messages.push({ messageId: messageId });
        messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result.data.messages[messageIter]));
      }
    }

    return _promise2.default.all(messageDetailPromises);
  }).then(function () {
    //console.log(result.data.messageList);
    if (result.data.messageList.nextPageToken) {
      return getMoreEmails(result.data.messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, result.data.messageList.nextPageToken);
    } else {
      return true;
    }
  }).then(function () {
    result.success = true;
  }).catch(function (err) {
    result.success = false;
    if (err.name === 'StatusCodeError') {
      var entireMessage = err.message;
      var messageJson = entireMessage.replace(err.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
      result.errorMessage = messageData.error.message;
    } else {
      result.errorMessage = (0, _stringify2.default)(err);
    }
    return true;
  });
};

var getHeaderValue = function getHeaderValue(message, headerName) {
  var headerValues = _(message.payload.headers).filter(function (header) {
    return header.name === headerName;
  }).pluck('value').value();
  if (headerValues.length > 0) {
    return headerValues[0];
  } else {
    return null;
  }
};

var getEmailAddressObjectFromString = function getEmailAddressObjectFromString(value) {
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

var convertEmailListToArrayOfEmailAddressObjects = function convertEmailListToArrayOfEmailAddressObjects(emailList) {
  var emailAddressObjectArray = [];
  if (emailList) {
    var emailArray = emailList.split(',');
    for (var emailIter = 0; emailIter < emailArray.length; emailIter++) {
      emailAddressObjectArray.push(getEmailAddressObjectFromString(emailArray[emailIter]));
    }
  }

  return emailAddressObjectArray;
};

var hasLabel = function hasLabel(message, labelValue) {
  return message.labelIds && message.labelIds.length && message.labelIds.indexOf(labelValue) >= 0;
};

var getFirstScalarPart = function getFirstScalarPart(partToCheck) {
  var returnObject = partToCheck;
  _.forEach(partToCheck.headers, function (header) {
    if (header.name === 'Content-Type' && header.value.indexOf('multipart/') > -1 && partToCheck.parts.length > 0) {
      returnObject = getFirstScalarPart(partToCheck.parts[0]);
    }
  });
  return returnObject;
};

var mapEmailData = function mapEmailData(emailData) {
  var mappedData = [];

  for (var userIter = 0; userIter < emailData.length; userIter++) {
    var mappedUser = _.assign({}, emailData[userIter], {
      data: [],
      success: emailData[userIter].success,
      errorMessage: emailData[userIter].errorMessage
    });

    if (emailData[userIter].success) {
      for (var i = 0; i < emailData[userIter].data.messages.length; i++) {
        var originalEmailMessage = emailData[userIter].data.messages[i];
        var mappedEmailMessage = {};

        mappedEmailMessage = originalEmailMessage;
        var messageData = originalEmailMessage.messageData;

        mappedEmailMessage.messageId = originalEmailMessage.messageId;
        mappedEmailMessage.conversationId = messageData.threadId;
        mappedEmailMessage.dateTimeSent = (0, _moment2.default)(new Date(getHeaderValue(messageData, 'Date'))).utc().toDate();

        var dateReceived = getHeaderValue(messageData, 'Received');
        if (dateReceived) {
          var datePartOfValue = dateReceived.split(';')[1];
          mappedEmailMessage.dateTimeReceived = (0, _moment2.default)(new Date(datePartOfValue)).utc().toDate();
        }

        mappedEmailMessage.importance = 'Normal';
        if (hasLabel(messageData, 'IMPORTANT')) {
          mappedEmailMessage.importance = 'Important';
        }

        mappedEmailMessage.categories = messageData.labelIds;

        if (hasLabel(messageData, 'SENT')) {
          mappedEmailMessage.folderId = 'Sent Items';
          mappedEmailMessage.folderName = 'Sent Items';
        } else {
          mappedEmailMessage.folderId = 'Inbox';
          mappedEmailMessage.folderName = 'Inbox';
        }

        mappedEmailMessage.subject = getHeaderValue(messageData, 'Subject');
        mappedEmailMessage.bodyPreview = messageData.snippet;

        if (messageData.payload.parts && messageData.payload.parts.length > 0) {
          var partToCheck = getFirstScalarPart(messageData.payload.parts[0]);
          mappedEmailMessage.contentType = partToCheck.mimeType;
          mappedEmailMessage.body = new Buffer(partToCheck.body.data, 'base64').toString();
        }

        mappedEmailMessage.isDeliveryReceiptRequested = null;
        mappedEmailMessage.isReadReceiptRequested = null;
        mappedEmailMessage.hasAttachments = null;
        mappedEmailMessage.isDraft = null;
        mappedEmailMessage.isRead = hasLabel(messageData, 'READ');

        mappedEmailMessage.fromAddress = getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).address;
        mappedEmailMessage.fromName = getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).name;

        mappedEmailMessage.toRecipients = convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'To'));

        mappedEmailMessage.ccRecipients = convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'Cc'));

        mappedEmailMessage.bccRecipients = convertEmailListToArrayOfEmailAddressObjects(getHeaderValue(messageData, 'Bcc'));

        delete mappedEmailMessage.messageData;
        mappedUser.data.push(mappedEmailMessage);
      }
    }
    mappedData.push(mappedUser);
  }

  return mappedData;
};

var getEmailData = function getEmailData(emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion) {
  var emailResults = [];
  var emailResultPromises = [];

  for (var emailIter = 0; emailIter < emails.length; emailIter++) {
    //initialize emailResults with the email object passed in
    //and add filter dates
    emailResults[emailIter] = _.assign({}, emails[emailIter], {
      filterStartDate: filterStartDate,
      filterEndDate: filterEndDate
    });

    emailResultPromises.push(getUserEmails(clientId, serviceEmail, emails[emailIter].emailAfterMapping, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, emailResults[emailIter]));
  }

  return _promise2.default.all(emailResultPromises).then(function () {
    return emailResults;
  });
};

GoogleAdapter.prototype.getBatchData = function (emails, filterStartDate, filterEndDate, additionalFields) {
  var clientId = this._config.credentials.clientId;
  var clientEmail = this._config.credentials.email;
  var serviceEmail = this._config.credentials.serviceEmail;
  var privateKey = this._config.credentials.certificate;
  var apiVersion = this._config.options.apiVersion;

  var dataAdapterRunStats = {
    success: true,
    runDate: (0, _moment2.default)().utc().toDate(),
    filterStartDate: filterStartDate,
    filterEndDate: filterEndDate,
    emails: emails
  };

  //first try to get token for the admin - if that fails, then all will fail
  return getAccessToken(clientId, serviceEmail, clientEmail, privateKey).then(function () {
    return getEmailData(emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion);
  }).then(function (emailData) {
    return mapEmailData(emailData);
  }).then(function (mappedEmailData) {
    dataAdapterRunStats.results = mappedEmailData;
    return dataAdapterRunStats;
  }).catch(function (err) {
    dataAdapterRunStats.success = false;
    dataAdapterRunStats.errorMessage = err;
    console.log('GoogleMail GetBatchData Error: ' + (0, _stringify2.default)(err));
    return dataAdapterRunStats;
  });
};

GoogleAdapter.prototype.runConnectionTest = function (connectionData) {
  var _this = this;
  _this._config = new GoogleMail.Configuration(connectionData.credentials);
  var filterStartDate = (0, _moment2.default)().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = (0, _moment2.default)().utc().startOf('day').toDate();
  return _this.getBatchData([{ emailAfterMapping: _this._config.credentials.email }], filterStartDate, filterEndDate, '').then(function (data) {
    if (data.success && data.results[0]) {
      //to see if it really worked, we need to pass in the first result
      return data.results[0];
    } else {
      return data;
    }
  });
};

GoogleAdapter.prototype.runMessageTest = function (connectionData) {
  var _this = this;
  _this._config = new GoogleMail.Configuration(connectionData.credentials);
  var filterStartDate = (0, _moment2.default)().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = (0, _moment2.default)().utc().startOf('day').add(1, 'days').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, 'Subject,BodyPreview,Body').then(function (data) {
    console.log('runMessageTest worked');
    console.log(data.results[0]);
  }).catch(function (err) {
    console.log('runMessageTest Error: ' + (0, _stringify2.default)(err));
  });
};
//# sourceMappingURL=../../clAdapters/google-mail/index.js.map
'use strict';

var crypto = require('crypto');
var rp = require('request-promise');
var util = require('util');
var BaseAdapter = require('./baseAdapter');
var GoogleMail = require('./google-js.js');
var moment = require('moment');
var querystring = require('querystring');
var _ = require('lodash');

var GoogleAdapter = module.exports = function GoogleAdapter() {
  BaseAdapter.call(this);
};

util.inherits(GoogleAdapter, BaseAdapter);

GoogleAdapter.prototype.init = function() {
  var _this = this;
  this._config = new GoogleMail.Configuration(this.credentials);
  this._service = new GoogleMail.Service(this._config);
  return this._service
    .init()
    .then(function( /*client*/ ) {
      var msg = 'Successfully initialized gmail adapter for email: %s';
      console.log(msg, _this.credentials.email);
      return _this;
    });
};

GoogleAdapter.prototype.reset = function() {
  delete this._config;
  delete this._service;
};

var getSingleMessageDetails = function(messageId, userEmail, token, apiVersion, additionalFields, result) {
  var additionalFieldsToQuery = additionalFields.replace('BodyPreview', 'snippet');
  additionalFieldsToQuery = additionalFieldsToQuery.replace('Body', 'payload(parts)');
  additionalFieldsToQuery = additionalFieldsToQuery.replace('Subject', 'payload(parts)');

  if (additionalFieldsToQuery !== '') {
    additionalFieldsToQuery = ',' + additionalFieldsToQuery;
  }

  var messageRequestOptions = {
    method: 'GET',
    uri: 'https://www.googleapis.com/gmail/v' + apiVersion + '/users/' + userEmail + '/messages/' + messageId + '?fields=id,threadId,labelIds,payload(headers)' + additionalFieldsToQuery,
    headers : {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };
  return rp(messageRequestOptions)
  .then(function(messageDetails) {
    result.messageData = JSON.parse(messageDetails);
    if (additionalFields.indexOf('Subject') === -1) {
      //remove subject header
      if (result.messageData.payload && result.messageData.payload.headers && result.messageData.payload.headers.length > 0) {
        for (var headerIter = 0; headerIter < result.messageData.payload.headers.length; headerIter++) {
          if (result.messageData.payload.headers[headerIter].name === 'Subject') {
            result.messageData.payload.headers[headerIter].value = '';
          }
        }
      }
    }

    return true;
  });
};

var getAccessToken = function(clientId, adminEmail, userEmail, privateKey) {
  var tokenRequestUrl = 'https://www.googleapis.com/oauth2/v3/token';
  var unixEpochTime = Math.floor((new Date()).getTime() / 1000);

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

  var encodedJwtHeader = new Buffer(JSON.stringify(jwtHeader)).toString('base64');
  var encodedJwtPayload = new Buffer(JSON.stringify(jwtPayload)).toString('base64');
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

  return rp(tokenRequestOptions)
  .then(function(body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      return tokenData.access_token;
    } else {
      return Promise.reject('Could not get access token.');
    }
  })
  .catch(function(err) {
    var tokenData = JSON.parse(JSON.stringify(err));
    if (tokenData.name === 'StatusCodeError') {
      var entireMessage = tokenData.message;
      var messageJson = entireMessage.replace(tokenData.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'),'"'));
      //console.log('-----');
      //console.log(messageData);
      return Promise.reject(messageData);
    } else {
      return Promise.reject(err);
    }
  });
};

var getUserEmails = function(clientId, serviceEmail, userEmail, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, result) {
  var token = '';
  return getAccessToken(clientId, serviceEmail, userEmail, privateKey)
  .then(function(tokenResponse) {
    token = tokenResponse;
    var emailRequestOptions = {
      method: 'GET',
      uri: 'https://www.googleapis.com/gmail/v' + apiVersion + '/users/' + userEmail + '/messages?q=after:' + filterStartDate.toISOString().substring(0, 10) + ' AND before: ' + filterEndDate.toISOString().substring(0, 10),
      headers : {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json;odata.metadata=none'
      }
    };
    return rp(emailRequestOptions);
  })
  .then(function(body) {
    var messageDetailPromises = [];
    result.success = true;
    result.data = {};
    result.data.messageList = JSON.parse(body);
    result.data.messages = [];

    if (result.data.messageList.messages) {
      for (var messageIter = 0; messageIter < result.data.messageList.messages.length; messageIter++) {
        var messageId = result.data.messageList.messages[messageIter].id;
        result.data.messages.push({messageId: messageId});
        messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result.data.messages[messageIter]));
      }
    }

    return Promise.all(messageDetailPromises);
  })
  .catch(function(err) {
    result.success = false;
    if (err.name === 'StatusCodeError') {
      var entireMessage = err.message;
      var messageJson = entireMessage.replace(err.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'),'"'));
      result.errorMessage = messageData.error.message;
    } else {
      result.errorMessage = JSON.stringify(err);
    }
    return true;
  });
};

var getHeaderValue = function(message, headerName) {
  var headerValues = _(message.payload.headers)
          .filter(function(header) { return header.name === headerName; })
          .pluck('value')
          .value();
  if (headerValues.length > 0) {
    return headerValues[0];
  } else {
    return null;
  }
};

var getEmailAddressObjectFromString = function(value) {
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

var convertEmailListToArrayOfEmailAddressObjects = function(emailList) {
  var emailAddressObjectArray = [];
  if (emailList) {
    var emailArray = emailList.split(',');
    for (var emailIter = 0; emailIter < emailArray.length; emailIter++) {
      emailAddressObjectArray.push(getEmailAddressObjectFromString(emailArray[emailIter]));
    }
  }

  return emailAddressObjectArray;
};

var hasLabel = function(message, labelValue) {
  return message.labelIds.indexOf(labelValue) >= 0;
};

var mapEmailData = function(emailData) {
  var mappedData = [];

  for (var userIter = 0; userIter < emailData.length; userIter++) {
    var mappedUser = {
      email: emailData[userIter].email,
      filterStartDate: emailData[userIter].filterStartDate,
      filterEndDate: emailData[userIter].filterEndDate,
      data: [],
      success: emailData[userIter].success,
      errorMessage: emailData[userIter].errorMessage
    };

    if (emailData[userIter].success) {
      for (var i = 0; i < emailData[userIter].data['messages'].length; i++) {
        var originalEmailMessage = emailData[userIter].data['messages'][i];
        var mappedEmailMessage = {};

        mappedEmailMessage = originalEmailMessage;
        var messageData = originalEmailMessage.messageData;

        mappedEmailMessage.messageId = originalEmailMessage.messageId;
        mappedEmailMessage.conversationId = messageData.threadId;
        mappedEmailMessage.dateTimeSent = moment(new Date(getHeaderValue(messageData, 'Date'))).utc().toDate();

        var dateReceived = getHeaderValue(messageData, 'Received');
        if (dateReceived) {
          var datePartOfValue = dateReceived.split(';')[1];
          mappedEmailMessage.dateTimeReceived = moment(new Date(datePartOfValue)).utc().toDate();
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
          mappedEmailMessage.contentType = messageData.payload.parts[0].mimeType;
          mappedEmailMessage.body = new Buffer(messageData.payload.parts[0].body.data, 'base64').toString();
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

        mappedUser.data.push(mappedEmailMessage);
      }
    }
    mappedData.push(mappedUser);
  }

  return mappedData;
};

var getEmailData = function(emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion) {
  var emailResults = [];
  var emailResultPromises = [];
  var emailIter = 0;
  for (emailIter = 0; emailIter < emails.length; emailIter++) {
    emailResults[emailIter] = {email: emails[emailIter], filterStartDate: filterStartDate, filterEndDate: filterEndDate};
    emailResultPromises.push(getUserEmails(clientId, serviceEmail, emails[emailIter], privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, emailResults[emailIter]));
  }

  return Promise.all(emailResultPromises)
  .then(function() {
    return emailResults;
  });
};

GoogleAdapter.prototype.getBatchData = function(emails, filterStartDate, filterEndDate, additionalFields) {
  var clientId = this._config.credentials.clientId;
  var clientEmail = this._config.credentials.email;
  var serviceEmail = this._config.credentials.serviceEmail;
  var privateKey = this._config.credentials.certificate;
  var apiVersion = this._config.options.apiVersion;

  var dataAdapterRunStats = {
    success: true,
    runDate: moment().utc().toDate(),
    filterStartDate: filterStartDate,
    filterEndDate: filterEndDate,
    emails: emails
  };

  //first try to get token for the admin - if that fails, then all will fail
  return getAccessToken(clientId, serviceEmail, clientEmail, privateKey)
  .then(function(emailData) {
    return getEmailData(emails, filterStartDate, filterEndDate, additionalFields, clientId, serviceEmail, privateKey, apiVersion)
  })
  .then(function(emailData) {
    return mapEmailData(emailData);
  })
  .then(function(mappedEmailData) {
    dataAdapterRunStats.results = mappedEmailData;
    return dataAdapterRunStats;
  })
  .catch(function(err) {
    dataAdapterRunStats.success = false;
    dataAdapterRunStats.errorMessage = err;
    console.log('GoogleMail GetBatchData Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

GoogleAdapter.prototype.runConnectionTest = function(connectionData) {
  var _this = this;
  _this._config = new GoogleMail.Configuration(connectionData.credentials);
  var filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = moment().utc().startOf('day').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, '')
  .then(function(data) {
    if (data.success && data.results[0]) {
      //to see if it really worked, we need to pass in the first result
      return data.results[0];
    } else {
      return data;
    }
  });
};

GoogleAdapter.prototype.runMessageTest = function(connectionData) {
  var _this = this;
  _this._config = new GoogleMail.Configuration(connectionData.credentials);
  var filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = moment().utc().startOf('day').add(1, 'days').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, 'Subject,BodyPreview,Body')
  .then(function(data) {
    console.log('runMessageTest worked');
    console.log(data.results[0]);
  })
  .catch(function(err) {
    console.log('runMessageTest Error: ' + JSON.stringify(err));
  });
};

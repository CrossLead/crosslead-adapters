'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var crypto = require('crypto');
var rp = require('request-promise');
var util = require('util');
var BaseAdapter = require('../base/Adapter');
var GoogleMail = require('./google-js.js');
var moment = require('moment');
var querystring = require('querystring');
var _ = require('lodash');

var GoogleAdapter = module.exports = function GoogleAdapter() {
  BaseAdapter.call(this);
};

util.inherits(GoogleAdapter, BaseAdapter);

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
  return rp(messageRequestOptions).then(function (messageDetails) {
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

  return rp(tokenRequestOptions).then(function (body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      return tokenData.access_token;
    } else {
      return _Promise.reject('Could not get access token.');
    }
  })['catch'](function (err) {
    var tokenData = JSON.parse(JSON.stringify(err));
    if (tokenData.name === 'StatusCodeError') {
      var entireMessage = tokenData.message;
      var messageJson = entireMessage.replace(tokenData.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
      //console.log('-----');
      //console.log(messageData);
      return _Promise.reject(messageData);
    } else {
      return _Promise.reject(err);
    }
  });
};

var getMoreEmails = function getMoreEmails(messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, nextPageToken) {
  emailRequestOptions.uri = firstUri + '&pageToken=' + nextPageToken;
  var tempPageToken = '';
  return rp(emailRequestOptions).then(function (body) {
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

    return _Promise.all(messageDetailPromises);
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
    firstUri = 'https://www.googleapis.com/gmail/v' + apiVersion + '/users/' + userEmail + '/messages?maxResults=100&q="after:' + filterStartDate.toISOString().substring(0, 10).replace(/-/g, "/") + ' before:' + filterEndDate.toISOString().substring(0, 10).replace(/-/g, "/") + '"';
    emailRequestOptions = {
      method: 'GET',
      uri: firstUri,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json;odata.metadata=none'
      }
    };
    return rp(emailRequestOptions);
  }).then(function (body) {
    var messageDetailPromises = [];
    result.data = {};
    result.data.messageList = JSON.parse(body);
    result.data.messages = [];

    if (result.data.messageList.messages) {
      for (var messageIter = 0; messageIter < result.data.messageList.messages.length; messageIter++) {
        var messageId = result.data.messageList.messages[messageIter].id;
        result.data.messages.push({ messageId: messageId });
        messageDetailPromises.push(getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result.data.messages[messageIter]));
      }
    }

    return _Promise.all(messageDetailPromises);
  }).then(function () {
    //console.log(result.data.messageList);
    if (result.data.messageList.nextPageToken) {
      return getMoreEmails(result.data.messages, userEmail, token, apiVersion, additionalFields, emailRequestOptions, firstUri, result.data.messageList.nextPageToken);
    } else {
      return true;
    }
  }).then(function () {
    result.success = true;
  })['catch'](function (err) {
    result.success = false;
    if (err.name === 'StatusCodeError') {
      var entireMessage = err.message;
      var messageJson = entireMessage.replace(err.statusCode + ' - ', '');
      var messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
      result.errorMessage = messageData.error.message;
    } else {
      result.errorMessage = JSON.stringify(err);
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

var mapEmailData = function mapEmailData(emailData) {
  var mappedData = [];

  for (var userIter = 0; userIter < emailData.length; userIter++) {
    var mappedUser = _.assign({}, emailData[userIter], {
      data: [],
      success: emailData[userIter].success,
      errorMessage: emailData[userIter].errorMessage
    });

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
  var emailIter = 0;
  for (emailIter = 0; emailIter < emails.length; emailIter++) {
    //initialize emailResults with the email object passed in
    //and add filter dates
    emailResults[emailIter] = _.assign({}, emails[emailIter], {
      filterStartDate: filterStartDate,
      filterEndDate: filterEndDate
    });

    emailResultPromises.push(getUserEmails(clientId, serviceEmail, emails[emailIter].emailAfterMapping, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, emailResults[emailIter]));
  }

  return _Promise.all(emailResultPromises).then(function () {
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
    runDate: moment().utc().toDate(),
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
  })['catch'](function (err) {
    dataAdapterRunStats.success = false;
    dataAdapterRunStats.errorMessage = err;
    console.log('GoogleMail GetBatchData Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

GoogleAdapter.prototype.runConnectionTest = function (connectionData) {
  var _this = this;
  _this._config = new GoogleMail.Configuration(connectionData.credentials);
  var filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = moment().utc().startOf('day').toDate();
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
  var filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = moment().utc().startOf('day').add(1, 'days').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, 'Subject,BodyPreview,Body').then(function (data) {
    console.log('runMessageTest worked');
    console.log(data.results[0]);
  })['catch'](function (err) {
    console.log('runMessageTest Error: ' + JSON.stringify(err));
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGdvb2dsZS1tYWlsXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7QUFFYixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDekMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUxQixJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsYUFBYSxHQUFHO0FBQzVELGFBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDeEIsQ0FBQzs7QUFFRixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFMUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN4QyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlELE1BQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRCxTQUFPLElBQUksQ0FBQyxRQUFRLENBQ2pCLElBQUksRUFB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QyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzdFLE1BQUksYUFBYSxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzFFLFNBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsMEJBQTBCLENBQUMsQ0FDdkgsSUFBSSxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNyQyxXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUM5QixDQUFDLFNBQ0ksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixXQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUM3RCxDQUFDLENBQUM7Q0FDSixDQUFDIiwiZmlsZSI6ImNsQWRhcHRlcnNcXGdvb2dsZS1tYWlsXFxpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcclxudmFyIHJwID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XHJcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xyXG52YXIgQmFzZUFkYXB0ZXIgPSByZXF1aXJlKCcuLi9iYXNlL0FkYXB0ZXInKTtcclxudmFyIEdvb2dsZU1haWwgPSByZXF1aXJlKCcuL2dvb2dsZS1qcy5qcycpO1xyXG52YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XHJcbnZhciBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XHJcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG52YXIgR29vZ2xlQWRhcHRlciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gR29vZ2xlQWRhcHRlcigpIHtcclxuICBCYXNlQWRhcHRlci5jYWxsKHRoaXMpO1xyXG59O1xyXG5cclxudXRpbC5pbmhlcml0cyhHb29nbGVBZGFwdGVyLCBCYXNlQWRhcHRlcik7XHJcblxyXG5Hb29nbGVBZGFwdGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuICB0aGlzLl9jb25maWcgPSBuZXcgR29vZ2xlTWFpbC5Db25maWd1cmF0aW9uKHRoaXMuY3JlZGVudGlhbHMpO1xyXG4gIHRoaXMuX3NlcnZpY2UgPSBuZXcgR29vZ2xlTWFpbC5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XHJcbiAgcmV0dXJuIHRoaXMuX3NlcnZpY2VcclxuICAgIC5pbml0KClcclxuICAgIC50aGVuKGZ1bmN0aW9uKCAvKmNsaWVudCovICkge1xyXG4gICAgICB2YXIgbXNnID0gJ1N1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBnbWFpbCBhZGFwdGVyIGZvciBlbWFpbDogJXMnO1xyXG4gICAgICBjb25zb2xlLmxvZyhtc2csIF90aGlzLmNyZWRlbnRpYWxzLmVtYWlsKTtcclxuICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfSk7XHJcbn07XHJcblxyXG5Hb29nbGVBZGFwdGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gIGRlbGV0ZSB0aGlzLl9jb25maWc7XHJcbiAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XHJcbn07XHJcblxyXG52YXIgZ2V0U2luZ2xlTWVzc2FnZURldGFpbHMgPSBmdW5jdGlvbihtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdCkge1xyXG4gIHZhciBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSA9IGFkZGl0aW9uYWxGaWVsZHMucmVwbGFjZSgnQm9keVByZXZpZXcnLCAnc25pcHBldCcpO1xyXG4gIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5ID0gYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkucmVwbGFjZSgnQm9keScsICdwYXlsb2FkKHBhcnRzKScpO1xyXG4gIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5ID0gYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkucmVwbGFjZSgnU3ViamVjdCcsICdwYXlsb2FkKHBhcnRzKScpO1xyXG5cclxuICBpZiAoYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkgIT09ICcnKSB7XHJcbiAgICBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSA9ICcsJyArIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5O1xyXG4gIH1cclxuXHJcbiAgdmFyIG1lc3NhZ2VSZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICB1cmk6ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9nbWFpbC92JyArIGFwaVZlcnNpb24gKyAnL3VzZXJzLycgKyB1c2VyRW1haWwgKyAnL21lc3NhZ2VzLycgKyBtZXNzYWdlSWQgKyAnP2ZpZWxkcz1pZCx0aHJlYWRJZCxsYWJlbElkcyxwYXlsb2FkKGhlYWRlcnMpJyArIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5LFxyXG4gICAgaGVhZGVycyA6IHtcclxuICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW4sXHJcbiAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcclxuICAgIH1cclxuICB9O1xyXG4gIHJldHVybiBycChtZXNzYWdlUmVxdWVzdE9wdGlvbnMpXHJcbiAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZURldGFpbHMpIHtcclxuICAgIHJlc3VsdC5tZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZURldGFpbHMpO1xyXG4gICAgaWYgKGFkZGl0aW9uYWxGaWVsZHMuaW5kZXhPZignU3ViamVjdCcpID09PSAtMSkge1xyXG4gICAgICAvL3JlbW92ZSBzdWJqZWN0IGhlYWRlclxyXG4gICAgICBpZiAocmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQgJiYgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVycyAmJiByZXN1bHQubWVzc2FnZURhdGEucGF5bG9hZC5oZWFkZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKHZhciBoZWFkZXJJdGVyID0gMDsgaGVhZGVySXRlciA8IHJlc3VsdC5tZXNzYWdlRGF0YS5wYXlsb2FkLmhlYWRlcnMubGVuZ3RoOyBoZWFkZXJJdGVyKyspIHtcclxuICAgICAgICAgIGlmIChyZXN1bHQubWVzc2FnZURhdGEucGF5bG9hZC5oZWFkZXJzW2hlYWRlckl0ZXJdLm5hbWUgPT09ICdTdWJqZWN0Jykge1xyXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZURhdGEucGF5bG9hZC5oZWFkZXJzW2hlYWRlckl0ZXJdLnZhbHVlID0gJyc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0QWNjZXNzVG9rZW4gPSBmdW5jdGlvbihjbGllbnRJZCwgYWRtaW5FbWFpbCwgdXNlckVtYWlsLCBwcml2YXRlS2V5KSB7XHJcbiAgdmFyIHRva2VuUmVxdWVzdFVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjMvdG9rZW4nO1xyXG4gIHZhciB1bml4RXBvY2hUaW1lID0gTWF0aC5mbG9vcigobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcblxyXG4gIHZhciBqd3RIZWFkZXIgPSB7XHJcbiAgICBhbGc6ICdSUzI1NicsXHJcbiAgICB0eXA6ICdKV1QnXHJcbiAgfTtcclxuXHJcbiAgdmFyIGp3dFBheWxvYWQgPSB7XHJcbiAgICAnaXNzJzogYWRtaW5FbWFpbCxcclxuICAgICdzY29wZSc6ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2dtYWlsLnJlYWRvbmx5JyxcclxuICAgICdhdWQnOiB0b2tlblJlcXVlc3RVcmwsXHJcbiAgICAnZXhwJzogdW5peEVwb2NoVGltZSArIDM2MDAsXHJcbiAgICAnaWF0JzogdW5peEVwb2NoVGltZSxcclxuICAgICdzdWInOiB1c2VyRW1haWxcclxuICB9O1xyXG5cclxuICB2YXIgZW5jb2RlZEp3dEhlYWRlciA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0SGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xyXG4gIHZhciBlbmNvZGVkSnd0UGF5bG9hZCA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0UGF5bG9hZCkpLnRvU3RyaW5nKCdiYXNlNjQnKTtcclxuICB2YXIgc3RyaW5nVG9TaWduID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkO1xyXG5cclxuICAvL3NpZ24gaXQhXHJcbiAgdmFyIHNpZ25lciA9IGNyeXB0by5jcmVhdGVTaWduKCdSU0EtU0hBMjU2Jyk7XHJcbiAgc2lnbmVyLnVwZGF0ZShzdHJpbmdUb1NpZ24pO1xyXG5cclxuICB2YXIgZW5jb2RlZFNpZ25lZEp3dEluZm8gPSBzaWduZXIuc2lnbihwcml2YXRlS2V5LCAnYmFzZTY0Jyk7XHJcblxyXG4gIC8vZGVmaW5lIGFzc2VydGlvblxyXG4gIHZhciBjbGllbnRBc3NlcnRpb24gPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mbztcclxuXHJcbiAgdmFyIHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xyXG4gICAgZ3JhbnRfdHlwZTogJ3VybjppZXRmOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmp3dC1iZWFyZXInLFxyXG4gICAgYXNzZXJ0aW9uOiBjbGllbnRBc3NlcnRpb25cclxuICB9O1xyXG5cclxuICB2YXIgcmVxdWVzdERhdGEgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkodG9rZW5SZXF1ZXN0Rm9ybURhdGEpO1xyXG4gIHZhciByZXF1ZXN0RGF0YUxlbmd0aCA9IHJlcXVlc3REYXRhLmxlbmd0aDtcclxuXHJcbiAgdmFyIHRva2VuUmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgIHBvcnQ6IDQ0MyxcclxuICAgIHVyaTogdG9rZW5SZXF1ZXN0VXJsLFxyXG4gICAgYm9keTogcmVxdWVzdERhdGEsXHJcbiAgICBtdWx0aXBhcnQ6IGZhbHNlLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQ29udGVudC1MZW5ndGgnOiByZXF1ZXN0RGF0YUxlbmd0aCxcclxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIHJwKHRva2VuUmVxdWVzdE9wdGlvbnMpXHJcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xyXG4gICAgdmFyIHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW4pIHtcclxuICAgICAgcmV0dXJuIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xyXG4gICAgfVxyXG4gIH0pXHJcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgdmFyIHRva2VuRGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICBpZiAodG9rZW5EYXRhLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XHJcbiAgICAgIHZhciBlbnRpcmVNZXNzYWdlID0gdG9rZW5EYXRhLm1lc3NhZ2U7XHJcbiAgICAgIHZhciBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XHJcbiAgICAgIHZhciBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZUpzb24ucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXCInLCAnZycpLCdcIicpKTtcclxuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0nKTtcclxuICAgICAgLy9jb25zb2xlLmxvZyhtZXNzYWdlRGF0YSk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtZXNzYWdlRGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbnZhciBnZXRNb3JlRW1haWxzID0gZnVuY3Rpb24obWVzc2FnZXMsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIGVtYWlsUmVxdWVzdE9wdGlvbnMsIGZpcnN0VXJpLCBuZXh0UGFnZVRva2VuKSB7XHJcbiAgZW1haWxSZXF1ZXN0T3B0aW9ucy51cmkgPSBmaXJzdFVyaSArICcmcGFnZVRva2VuPScgKyBuZXh0UGFnZVRva2VuO1xyXG4gIHZhciB0ZW1wUGFnZVRva2VuID0gJyc7XHJcbiAgcmV0dXJuIHJwKGVtYWlsUmVxdWVzdE9wdGlvbnMpXHJcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xyXG4gICAgdmFyIG1lc3NhZ2VEZXRhaWxQcm9taXNlcyA9IFtdO1xyXG4gICAgdmFyIG1lc3NhZ2VMaXN0ID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgIHRlbXBQYWdlVG9rZW4gPSBtZXNzYWdlTGlzdC5uZXh0UGFnZVRva2VuO1xyXG5cclxuICAgIGlmIChtZXNzYWdlTGlzdC5tZXNzYWdlcykge1xyXG4gICAgICBmb3IgKHZhciBtZXNzYWdlSXRlciA9IDA7IG1lc3NhZ2VJdGVyIDwgbWVzc2FnZUxpc3QubWVzc2FnZXMubGVuZ3RoOyBtZXNzYWdlSXRlcisrKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VJZCA9IG1lc3NhZ2VMaXN0Lm1lc3NhZ2VzW21lc3NhZ2VJdGVyXS5pZDtcclxuICAgICAgICB2YXIgbmV4dE1lc3NhZ2UgPSB7bWVzc2FnZUlkOiBtZXNzYWdlSWR9O1xyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobmV4dE1lc3NhZ2UpO1xyXG4gICAgICAgIG1lc3NhZ2VEZXRhaWxQcm9taXNlcy5wdXNoKGdldFNpbmdsZU1lc3NhZ2VEZXRhaWxzKG1lc3NhZ2VJZCwgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgbmV4dE1lc3NhZ2UpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbChtZXNzYWdlRGV0YWlsUHJvbWlzZXMpO1xyXG4gIH0pXHJcbiAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICBpZih0ZW1wUGFnZVRva2VuKSB7XHJcbiAgICAgIHJldHVybiBnZXRNb3JlRW1haWxzKG1lc3NhZ2VzLCB1c2VyRW1haWwsIHRva2VuLCBhcGlWZXJzaW9uLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlcXVlc3RPcHRpb25zLCBmaXJzdFVyaSwgdGVtcFBhZ2VUb2tlbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbnZhciBnZXRVc2VyRW1haWxzID0gZnVuY3Rpb24oY2xpZW50SWQsIHNlcnZpY2VFbWFpbCwgdXNlckVtYWlsLCBwcml2YXRlS2V5LCBhcGlWZXJzaW9uLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdCkge1xyXG4gIHZhciB0b2tlbiA9ICcnO1xyXG4gIHZhciBlbWFpbFJlcXVlc3RPcHRpb25zID0ge307XHJcbiAgdmFyIGZpcnN0VXJpID0gJyc7XHJcbiAgcmV0dXJuIGdldEFjY2Vzc1Rva2VuKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHVzZXJFbWFpbCwgcHJpdmF0ZUtleSlcclxuICAudGhlbihmdW5jdGlvbih0b2tlblJlc3BvbnNlKSB7XHJcbiAgICB0b2tlbiA9IHRva2VuUmVzcG9uc2U7XHJcbiAgICBmaXJzdFVyaSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9nbWFpbC92JyArIGFwaVZlcnNpb24gKyAnL3VzZXJzLycgKyB1c2VyRW1haWwgKyAnL21lc3NhZ2VzP21heFJlc3VsdHM9MTAwJnE9XCJhZnRlcjonICsgZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKS5yZXBsYWNlKC8tL2csIFwiL1wiKSArICcgYmVmb3JlOicgKyBmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKS5yZXBsYWNlKC8tL2csIFwiL1wiKSArICdcIic7XHJcbiAgICBlbWFpbFJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICB1cmk6IGZpcnN0VXJpLFxyXG4gICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxyXG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBycChlbWFpbFJlcXVlc3RPcHRpb25zKTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uKGJvZHkpIHtcclxuICAgIHZhciBtZXNzYWdlRGV0YWlsUHJvbWlzZXMgPSBbXTtcclxuICAgIHJlc3VsdC5kYXRhID0ge307XHJcbiAgICByZXN1bHQuZGF0YS5tZXNzYWdlTGlzdCA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICByZXN1bHQuZGF0YS5tZXNzYWdlcyA9IFtdO1xyXG5cclxuICAgIGlmIChyZXN1bHQuZGF0YS5tZXNzYWdlTGlzdC5tZXNzYWdlcykge1xyXG4gICAgICBmb3IgKHZhciBtZXNzYWdlSXRlciA9IDA7IG1lc3NhZ2VJdGVyIDwgcmVzdWx0LmRhdGEubWVzc2FnZUxpc3QubWVzc2FnZXMubGVuZ3RoOyBtZXNzYWdlSXRlcisrKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VJZCA9IHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm1lc3NhZ2VzW21lc3NhZ2VJdGVyXS5pZDtcclxuICAgICAgICByZXN1bHQuZGF0YS5tZXNzYWdlcy5wdXNoKHttZXNzYWdlSWQ6IG1lc3NhZ2VJZH0pO1xyXG4gICAgICAgIG1lc3NhZ2VEZXRhaWxQcm9taXNlcy5wdXNoKGdldFNpbmdsZU1lc3NhZ2VEZXRhaWxzKG1lc3NhZ2VJZCwgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgcmVzdWx0LmRhdGEubWVzc2FnZXNbbWVzc2FnZUl0ZXJdKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobWVzc2FnZURldGFpbFByb21pc2VzKTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgLy9jb25zb2xlLmxvZyhyZXN1bHQuZGF0YS5tZXNzYWdlTGlzdCk7XHJcbiAgICBpZihyZXN1bHQuZGF0YS5tZXNzYWdlTGlzdC5uZXh0UGFnZVRva2VuKSB7XHJcbiAgICAgIHJldHVybiBnZXRNb3JlRW1haWxzKHJlc3VsdC5kYXRhLm1lc3NhZ2VzLCB1c2VyRW1haWwsIHRva2VuLCBhcGlWZXJzaW9uLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlcXVlc3RPcHRpb25zLCBmaXJzdFVyaSwgcmVzdWx0LmRhdGEubWVzc2FnZUxpc3QubmV4dFBhZ2VUb2tlbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlO1xyXG4gIH0pXHJcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgcmVzdWx0LnN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgIGlmIChlcnIubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcclxuICAgICAgdmFyIGVudGlyZU1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcclxuICAgICAgdmFyIG1lc3NhZ2VKc29uID0gZW50aXJlTWVzc2FnZS5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKTtcclxuICAgICAgdmFyIG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlSnNvbi5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxcIicsICdnJyksJ1wiJykpO1xyXG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gbWVzc2FnZURhdGEuZXJyb3IubWVzc2FnZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlc3VsdC5lcnJvck1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShlcnIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0SGVhZGVyVmFsdWUgPSBmdW5jdGlvbihtZXNzYWdlLCBoZWFkZXJOYW1lKSB7XHJcbiAgdmFyIGhlYWRlclZhbHVlcyA9IF8obWVzc2FnZS5wYXlsb2FkLmhlYWRlcnMpXHJcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGhlYWRlcikgeyByZXR1cm4gaGVhZGVyLm5hbWUgPT09IGhlYWRlck5hbWU7IH0pXHJcbiAgICAgICAgICAucGx1Y2soJ3ZhbHVlJylcclxuICAgICAgICAgIC52YWx1ZSgpO1xyXG4gIGlmIChoZWFkZXJWYWx1ZXMubGVuZ3RoID4gMCkge1xyXG4gICAgcmV0dXJuIGhlYWRlclZhbHVlc1swXTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG59O1xyXG5cclxudmFyIGdldEVtYWlsQWRkcmVzc09iamVjdEZyb21TdHJpbmcgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG4gIHZhciByZXR1cm5PYmplY3QgPSB7XHJcbiAgICBuYW1lOiB2YWx1ZSxcclxuICAgIGFkZHJlc3M6IHZhbHVlXHJcbiAgfTtcclxuXHJcbiAgaWYgKHZhbHVlICYmIHZhbHVlLmluZGV4T2YoJz4nKSA+IDApIHtcclxuICAgIHZhciB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoJyAnKTtcclxuICAgIHJldHVybk9iamVjdC5hZGRyZXNzID0gdmFsdWVBcnJheVt2YWx1ZUFycmF5Lmxlbmd0aCAtIDFdLnJlcGxhY2UoJzwnLCAnJykucmVwbGFjZSgnPicsICcnKTtcclxuICAgIHJldHVybk9iamVjdC5uYW1lID0gdmFsdWUucmVwbGFjZSgnICcgKyB2YWx1ZUFycmF5W3ZhbHVlQXJyYXkubGVuZ3RoIC0gMV0sICcnKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXR1cm5PYmplY3Q7XHJcbn07XHJcblxyXG52YXIgY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMgPSBmdW5jdGlvbihlbWFpbExpc3QpIHtcclxuICB2YXIgZW1haWxBZGRyZXNzT2JqZWN0QXJyYXkgPSBbXTtcclxuICBpZiAoZW1haWxMaXN0KSB7XHJcbiAgICB2YXIgZW1haWxBcnJheSA9IGVtYWlsTGlzdC5zcGxpdCgnLCcpO1xyXG4gICAgZm9yICh2YXIgZW1haWxJdGVyID0gMDsgZW1haWxJdGVyIDwgZW1haWxBcnJheS5sZW5ndGg7IGVtYWlsSXRlcisrKSB7XHJcbiAgICAgIGVtYWlsQWRkcmVzc09iamVjdEFycmF5LnB1c2goZ2V0RW1haWxBZGRyZXNzT2JqZWN0RnJvbVN0cmluZyhlbWFpbEFycmF5W2VtYWlsSXRlcl0pKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBlbWFpbEFkZHJlc3NPYmplY3RBcnJheTtcclxufTtcclxuXHJcbnZhciBoYXNMYWJlbCA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxhYmVsVmFsdWUpIHtcclxuICByZXR1cm4gbWVzc2FnZS5sYWJlbElkcyAmJiBtZXNzYWdlLmxhYmVsSWRzLmxlbmd0aCAmJiAobWVzc2FnZS5sYWJlbElkcy5pbmRleE9mKGxhYmVsVmFsdWUpID49IDApO1xyXG59O1xyXG5cclxudmFyIG1hcEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xyXG4gIHZhciBtYXBwZWREYXRhID0gW107XHJcblxyXG4gIGZvciAodmFyIHVzZXJJdGVyID0gMDsgdXNlckl0ZXIgPCBlbWFpbERhdGEubGVuZ3RoOyB1c2VySXRlcisrKSB7XHJcbiAgICB2YXIgbWFwcGVkVXNlciA9IF8uYXNzaWduKHt9LCBlbWFpbERhdGFbdXNlckl0ZXJdLCB7XHJcbiAgICAgIGRhdGE6IFtdLFxyXG4gICAgICBzdWNjZXNzOiBlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MsXHJcbiAgICAgIGVycm9yTWVzc2FnZTogZW1haWxEYXRhW3VzZXJJdGVyXS5lcnJvck1lc3NhZ2VcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbJ21lc3NhZ2VzJ10ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPSBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbJ21lc3NhZ2VzJ11baV07XHJcbiAgICAgICAgdmFyIG1hcHBlZEVtYWlsTWVzc2FnZSA9IHt9O1xyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UgPSBvcmlnaW5hbEVtYWlsTWVzc2FnZTtcclxuICAgICAgICB2YXIgbWVzc2FnZURhdGEgPSBvcmlnaW5hbEVtYWlsTWVzc2FnZS5tZXNzYWdlRGF0YTtcclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLm1lc3NhZ2VJZCA9IG9yaWdpbmFsRW1haWxNZXNzYWdlLm1lc3NhZ2VJZDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udmVyc2F0aW9uSWQgPSBtZXNzYWdlRGF0YS50aHJlYWRJZDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZGF0ZVRpbWVTZW50ID0gbW9tZW50KG5ldyBEYXRlKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnRGF0ZScpKSkudXRjKCkudG9EYXRlKCk7XHJcblxyXG4gICAgICAgIHZhciBkYXRlUmVjZWl2ZWQgPSBnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ1JlY2VpdmVkJyk7XHJcbiAgICAgICAgaWYgKGRhdGVSZWNlaXZlZCkge1xyXG4gICAgICAgICAgdmFyIGRhdGVQYXJ0T2ZWYWx1ZSA9IGRhdGVSZWNlaXZlZC5zcGxpdCgnOycpWzFdO1xyXG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmRhdGVUaW1lUmVjZWl2ZWQgPSBtb21lbnQobmV3IERhdGUoZGF0ZVBhcnRPZlZhbHVlKSkudXRjKCkudG9EYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9ICdOb3JtYWwnO1xyXG4gICAgICAgIGlmIChoYXNMYWJlbChtZXNzYWdlRGF0YSwgJ0lNUE9SVEFOVCcpKSB7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9ICdJbXBvcnRhbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNhdGVnb3JpZXMgPSBtZXNzYWdlRGF0YS5sYWJlbElkcztcclxuXHJcbiAgICAgICAgaWYgKGhhc0xhYmVsKG1lc3NhZ2VEYXRhLCAnU0VOVCcpKSB7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVySWQgPSAnU2VudCBJdGVtcyc7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVyTmFtZSA9ICdTZW50IEl0ZW1zJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZvbGRlcklkID0gJ0luYm94JztcclxuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5mb2xkZXJOYW1lID0gJ0luYm94JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5zdWJqZWN0ID0gZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdTdWJqZWN0Jyk7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmJvZHlQcmV2aWV3ID0gbWVzc2FnZURhdGEuc25pcHBldDtcclxuXHJcbiAgICAgICAgaWYgKG1lc3NhZ2VEYXRhLnBheWxvYWQucGFydHMgJiYgbWVzc2FnZURhdGEucGF5bG9hZC5wYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udGVudFR5cGUgPSBtZXNzYWdlRGF0YS5wYXlsb2FkLnBhcnRzWzBdLm1pbWVUeXBlO1xyXG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmJvZHkgPSBuZXcgQnVmZmVyKG1lc3NhZ2VEYXRhLnBheWxvYWQucGFydHNbMF0uYm9keS5kYXRhLCAnYmFzZTY0JykudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCA9IG51bGw7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQgPSBudWxsO1xyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5oYXNBdHRhY2htZW50cyA9IG51bGw7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzRHJhZnQgPSBudWxsO1xyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc1JlYWQgPSBoYXNMYWJlbChtZXNzYWdlRGF0YSwgJ1JFQUQnKTtcclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZyb21BZGRyZXNzID0gZ2V0RW1haWxBZGRyZXNzT2JqZWN0RnJvbVN0cmluZyhnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ0Zyb20nKSkuYWRkcmVzcztcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZnJvbU5hbWUgPSBnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnRnJvbScpKS5uYW1lO1xyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UudG9SZWNpcGllbnRzID0gY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdUbycpKTtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY2NSZWNpcGllbnRzID0gY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdDYycpKTtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYmNjUmVjaXBpZW50cyA9IGNvbnZlcnRFbWFpbExpc3RUb0FycmF5T2ZFbWFpbEFkZHJlc3NPYmplY3RzKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnQmNjJykpO1xyXG5cclxuICAgICAgICBkZWxldGUgbWFwcGVkRW1haWxNZXNzYWdlLm1lc3NhZ2VEYXRhO1xyXG4gICAgICAgIG1hcHBlZFVzZXIuZGF0YS5wdXNoKG1hcHBlZEVtYWlsTWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIG1hcHBlZERhdGEucHVzaChtYXBwZWRVc2VyKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBtYXBwZWREYXRhO1xyXG59O1xyXG5cclxudmFyIGdldEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBjbGllbnRJZCwgc2VydmljZUVtYWlsLCBwcml2YXRlS2V5LCBhcGlWZXJzaW9uKSB7XHJcbiAgdmFyIGVtYWlsUmVzdWx0cyA9IFtdO1xyXG4gIHZhciBlbWFpbFJlc3VsdFByb21pc2VzID0gW107XHJcbiAgdmFyIGVtYWlsSXRlciA9IDA7XHJcbiAgZm9yIChlbWFpbEl0ZXIgPSAwOyBlbWFpbEl0ZXIgPCBlbWFpbHMubGVuZ3RoOyBlbWFpbEl0ZXIrKykge1xyXG4gICAgLy9pbml0aWFsaXplIGVtYWlsUmVzdWx0cyB3aXRoIHRoZSBlbWFpbCBvYmplY3QgcGFzc2VkIGluXHJcbiAgICAvL2FuZCBhZGQgZmlsdGVyIGRhdGVzXHJcbiAgICBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSA9IF8uYXNzaWduKHt9LCBlbWFpbHNbZW1haWxJdGVyXSwge1xyXG4gICAgICBmaWx0ZXJTdGFydERhdGU6IGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgICAgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgZW1haWxSZXN1bHRQcm9taXNlcy5wdXNoKGdldFVzZXJFbWFpbHMoY2xpZW50SWQsIHNlcnZpY2VFbWFpbCwgZW1haWxzW2VtYWlsSXRlcl0uZW1haWxBZnRlck1hcHBpbmcsIHByaXZhdGVLZXksIGFwaVZlcnNpb24sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxSZXN1bHRzW2VtYWlsSXRlcl0pKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBQcm9taXNlLmFsbChlbWFpbFJlc3VsdFByb21pc2VzKVxyXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGVtYWlsUmVzdWx0cztcclxuICB9KTtcclxufTtcclxuXHJcbkdvb2dsZUFkYXB0ZXIucHJvdG90eXBlLmdldEJhdGNoRGF0YSA9IGZ1bmN0aW9uKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XHJcbiAgdmFyIGNsaWVudElkID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmNsaWVudElkO1xyXG4gIHZhciBjbGllbnRFbWFpbCA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbDtcclxuICB2YXIgc2VydmljZUVtYWlsID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLnNlcnZpY2VFbWFpbDtcclxuICB2YXIgcHJpdmF0ZUtleSA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5jZXJ0aWZpY2F0ZTtcclxuICB2YXIgYXBpVmVyc2lvbiA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLmFwaVZlcnNpb247XHJcblxyXG4gIHZhciBkYXRhQWRhcHRlclJ1blN0YXRzID0ge1xyXG4gICAgc3VjY2VzczogdHJ1ZSxcclxuICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpLFxyXG4gICAgZmlsdGVyU3RhcnREYXRlOiBmaWx0ZXJTdGFydERhdGUsXHJcbiAgICBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlLFxyXG4gICAgZW1haWxzOiBlbWFpbHNcclxuICB9O1xyXG5cclxuICAvL2ZpcnN0IHRyeSB0byBnZXQgdG9rZW4gZm9yIHRoZSBhZG1pbiAtIGlmIHRoYXQgZmFpbHMsIHRoZW4gYWxsIHdpbGwgZmFpbFxyXG4gIHJldHVybiBnZXRBY2Nlc3NUb2tlbihjbGllbnRJZCwgc2VydmljZUVtYWlsLCBjbGllbnRFbWFpbCwgcHJpdmF0ZUtleSlcclxuICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBnZXRFbWFpbERhdGEoZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHByaXZhdGVLZXksIGFwaVZlcnNpb24pO1xyXG4gIH0pXHJcbiAgLnRoZW4oZnVuY3Rpb24oZW1haWxEYXRhKSB7XHJcbiAgICByZXR1cm4gbWFwRW1haWxEYXRhKGVtYWlsRGF0YSk7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbihtYXBwZWRFbWFpbERhdGEpIHtcclxuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMucmVzdWx0cyA9IG1hcHBlZEVtYWlsRGF0YTtcclxuICAgIHJldHVybiBkYXRhQWRhcHRlclJ1blN0YXRzO1xyXG4gIH0pXHJcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5zdWNjZXNzID0gZmFsc2U7XHJcbiAgICBkYXRhQWRhcHRlclJ1blN0YXRzLmVycm9yTWVzc2FnZSA9IGVycjtcclxuICAgIGNvbnNvbGUubG9nKCdHb29nbGVNYWlsIEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XHJcbiAgfSk7XHJcbn07XHJcblxyXG5Hb29nbGVBZGFwdGVyLnByb3RvdHlwZS5ydW5Db25uZWN0aW9uVGVzdCA9IGZ1bmN0aW9uKGNvbm5lY3Rpb25EYXRhKSB7XHJcbiAgdmFyIF90aGlzID0gdGhpcztcclxuICBfdGhpcy5fY29uZmlnID0gbmV3IEdvb2dsZU1haWwuQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XHJcbiAgdmFyIGZpbHRlclN0YXJ0RGF0ZSA9IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKTtcclxuICB2YXIgZmlsdGVyRW5kRGF0ZSA9IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLnRvRGF0ZSgpO1xyXG4gIHJldHVybiBfdGhpcy5nZXRCYXRjaERhdGEoW3tlbWFpbEFmdGVyTWFwcGluZzogX3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbH1dLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsICcnKVxyXG4gIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIGlmIChkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5yZXN1bHRzWzBdKSB7XHJcbiAgICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XHJcbiAgICAgIHJldHVybiBkYXRhLnJlc3VsdHNbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbkdvb2dsZUFkYXB0ZXIucHJvdG90eXBlLnJ1bk1lc3NhZ2VUZXN0ID0gZnVuY3Rpb24oY29ubmVjdGlvbkRhdGEpIHtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gIF90aGlzLl9jb25maWcgPSBuZXcgR29vZ2xlTWFpbC5Db25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcclxuICB2YXIgZmlsdGVyU3RhcnREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykuYWRkKC0xLCAnZGF5cycpLnRvRGF0ZSgpO1xyXG4gIHZhciBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykuYWRkKDEsICdkYXlzJykudG9EYXRlKCk7XHJcbiAgcmV0dXJuIF90aGlzLmdldEJhdGNoRGF0YShbX3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbF0sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgJ1N1YmplY3QsQm9keVByZXZpZXcsQm9keScpXHJcbiAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coJ3J1bk1lc3NhZ2VUZXN0IHdvcmtlZCcpO1xyXG4gICAgY29uc29sZS5sb2coZGF0YS5yZXN1bHRzWzBdKTtcclxuICB9KVxyXG4gIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgIGNvbnNvbGUubG9nKCdydW5NZXNzYWdlVGVzdCBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gIH0pO1xyXG59O1xyXG4iXX0=
//# sourceMappingURL=index.js.map

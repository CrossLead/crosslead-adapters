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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLW1haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNwQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDN0MsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDM0MsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN6QyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTFCLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDNUQsYUFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN4QixDQUFDOztBQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDOztBQUUxQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ3hDLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDOUQsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JELFNBQU8sSUFBSSxDQUFDLFFBQVEsQ0FDakIsSUFBSSxFQUFFLENBQ04sSUFBSSxDQUFD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LFdBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdELENBQUMsQ0FBQztDQUNKLENBQUMiLCJmaWxlIjoiY2xBZGFwdGVycy9nb29nbGUtbWFpbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbnZhciBycCA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG52YXIgQmFzZUFkYXB0ZXIgPSByZXF1aXJlKCcuLi9iYXNlL0FkYXB0ZXInKTtcbnZhciBHb29nbGVNYWlsID0gcmVxdWlyZSgnLi9nb29nbGUtanMuanMnKTtcbnZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbnZhciBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG52YXIgR29vZ2xlQWRhcHRlciA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gR29vZ2xlQWRhcHRlcigpIHtcbiAgQmFzZUFkYXB0ZXIuY2FsbCh0aGlzKTtcbn07XG5cbnV0aWwuaW5oZXJpdHMoR29vZ2xlQWRhcHRlciwgQmFzZUFkYXB0ZXIpO1xuXG5Hb29nbGVBZGFwdGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuX2NvbmZpZyA9IG5ldyBHb29nbGVNYWlsLkNvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscyk7XG4gIHRoaXMuX3NlcnZpY2UgPSBuZXcgR29vZ2xlTWFpbC5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG4gIHJldHVybiB0aGlzLl9zZXJ2aWNlXG4gICAgLmluaXQoKVxuICAgIC50aGVuKGZ1bmN0aW9uKCAvKmNsaWVudCovICkge1xuICAgICAgdmFyIG1zZyA9ICdTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgZ21haWwgYWRhcHRlciBmb3IgZW1haWw6ICVzJztcbiAgICAgIGNvbnNvbGUubG9nKG1zZywgX3RoaXMuY3JlZGVudGlhbHMuZW1haWwpO1xuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH0pO1xufTtcblxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG59O1xuXG52YXIgZ2V0U2luZ2xlTWVzc2FnZURldGFpbHMgPSBmdW5jdGlvbihtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdCkge1xuICB2YXIgYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkgPSBhZGRpdGlvbmFsRmllbGRzLnJlcGxhY2UoJ0JvZHlQcmV2aWV3JywgJ3NuaXBwZXQnKTtcbiAgYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkgPSBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeS5yZXBsYWNlKCdCb2R5JywgJ3BheWxvYWQocGFydHMpJyk7XG4gIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5ID0gYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkucmVwbGFjZSgnU3ViamVjdCcsICdwYXlsb2FkKHBhcnRzKScpO1xuXG4gIGlmIChhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSAhPT0gJycpIHtcbiAgICBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSA9ICcsJyArIGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5O1xuICB9XG5cbiAgdmFyIG1lc3NhZ2VSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVyaTogJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2dtYWlsL3YnICsgYXBpVmVyc2lvbiArICcvdXNlcnMvJyArIHVzZXJFbWFpbCArICcvbWVzc2FnZXMvJyArIG1lc3NhZ2VJZCArICc/ZmllbGRzPWlkLHRocmVhZElkLGxhYmVsSWRzLHBheWxvYWQoaGVhZGVycyknICsgYWRkaXRpb25hbEZpZWxkc1RvUXVlcnksXG4gICAgaGVhZGVycyA6IHtcbiAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxuICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHJwKG1lc3NhZ2VSZXF1ZXN0T3B0aW9ucylcbiAgLnRoZW4oZnVuY3Rpb24obWVzc2FnZURldGFpbHMpIHtcbiAgICByZXN1bHQubWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VEZXRhaWxzKTtcbiAgICBpZiAoYWRkaXRpb25hbEZpZWxkcy5pbmRleE9mKCdTdWJqZWN0JykgPT09IC0xKSB7XG4gICAgICAvL3JlbW92ZSBzdWJqZWN0IGhlYWRlclxuICAgICAgaWYgKHJlc3VsdC5tZXNzYWdlRGF0YS5wYXlsb2FkICYmIHJlc3VsdC5tZXNzYWdlRGF0YS5wYXlsb2FkLmhlYWRlcnMgJiYgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGhlYWRlckl0ZXIgPSAwOyBoZWFkZXJJdGVyIDwgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVycy5sZW5ndGg7IGhlYWRlckl0ZXIrKykge1xuICAgICAgICAgIGlmIChyZXN1bHQubWVzc2FnZURhdGEucGF5bG9hZC5oZWFkZXJzW2hlYWRlckl0ZXJdLm5hbWUgPT09ICdTdWJqZWN0Jykge1xuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVyc1toZWFkZXJJdGVyXS52YWx1ZSA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn07XG5cbnZhciBnZXRBY2Nlc3NUb2tlbiA9IGZ1bmN0aW9uKGNsaWVudElkLCBhZG1pbkVtYWlsLCB1c2VyRW1haWwsIHByaXZhdGVLZXkpIHtcbiAgdmFyIHRva2VuUmVxdWVzdFVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjMvdG9rZW4nO1xuICB2YXIgdW5peEVwb2NoVGltZSA9IE1hdGguZmxvb3IoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApO1xuXG4gIHZhciBqd3RIZWFkZXIgPSB7XG4gICAgYWxnOiAnUlMyNTYnLFxuICAgIHR5cDogJ0pXVCdcbiAgfTtcblxuICB2YXIgand0UGF5bG9hZCA9IHtcbiAgICAnaXNzJzogYWRtaW5FbWFpbCxcbiAgICAnc2NvcGUnOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seScsXG4gICAgJ2F1ZCc6IHRva2VuUmVxdWVzdFVybCxcbiAgICAnZXhwJzogdW5peEVwb2NoVGltZSArIDM2MDAsXG4gICAgJ2lhdCc6IHVuaXhFcG9jaFRpbWUsXG4gICAgJ3N1Yic6IHVzZXJFbWFpbFxuICB9O1xuXG4gIHZhciBlbmNvZGVkSnd0SGVhZGVyID0gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShqd3RIZWFkZXIpKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gIHZhciBlbmNvZGVkSnd0UGF5bG9hZCA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0UGF5bG9hZCkpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgdmFyIHN0cmluZ1RvU2lnbiA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZDtcblxuICAvL3NpZ24gaXQhXG4gIHZhciBzaWduZXIgPSBjcnlwdG8uY3JlYXRlU2lnbignUlNBLVNIQTI1NicpO1xuICBzaWduZXIudXBkYXRlKHN0cmluZ1RvU2lnbik7XG5cbiAgdmFyIGVuY29kZWRTaWduZWRKd3RJbmZvID0gc2lnbmVyLnNpZ24ocHJpdmF0ZUtleSwgJ2Jhc2U2NCcpO1xuXG4gIC8vZGVmaW5lIGFzc2VydGlvblxuICB2YXIgY2xpZW50QXNzZXJ0aW9uID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkICsgJy4nICsgZW5jb2RlZFNpZ25lZEp3dEluZm87XG5cbiAgdmFyIHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xuICAgIGdyYW50X3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTpqd3QtYmVhcmVyJyxcbiAgICBhc3NlcnRpb246IGNsaWVudEFzc2VydGlvblxuICB9O1xuXG4gIHZhciByZXF1ZXN0RGF0YSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0b2tlblJlcXVlc3RGb3JtRGF0YSk7XG4gIHZhciByZXF1ZXN0RGF0YUxlbmd0aCA9IHJlcXVlc3REYXRhLmxlbmd0aDtcblxuICB2YXIgdG9rZW5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBwb3J0OiA0NDMsXG4gICAgdXJpOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgYm9keTogcmVxdWVzdERhdGEsXG4gICAgbXVsdGlwYXJ0OiBmYWxzZSxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1MZW5ndGgnOiByZXF1ZXN0RGF0YUxlbmd0aCxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gcnAodG9rZW5SZXF1ZXN0T3B0aW9ucylcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xuICAgIHZhciB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgIGlmICh0b2tlbkRhdGEgJiYgdG9rZW5EYXRhLmFjY2Vzc190b2tlbikge1xuICAgICAgcmV0dXJuIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnQ291bGQgbm90IGdldCBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgfVxuICB9KVxuICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgdmFyIHRva2VuRGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG4gICAgaWYgKHRva2VuRGF0YS5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgdmFyIGVudGlyZU1lc3NhZ2UgPSB0b2tlbkRhdGEubWVzc2FnZTtcbiAgICAgIHZhciBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XG4gICAgICB2YXIgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCctLS0tLScpO1xuICAgICAgLy9jb25zb2xlLmxvZyhtZXNzYWdlRGF0YSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWVzc2FnZURhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGdldE1vcmVFbWFpbHMgPSBmdW5jdGlvbihtZXNzYWdlcywgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxSZXF1ZXN0T3B0aW9ucywgZmlyc3RVcmksIG5leHRQYWdlVG9rZW4pIHtcbiAgZW1haWxSZXF1ZXN0T3B0aW9ucy51cmkgPSBmaXJzdFVyaSArICcmcGFnZVRva2VuPScgKyBuZXh0UGFnZVRva2VuO1xuICB2YXIgdGVtcFBhZ2VUb2tlbiA9ICcnO1xuICByZXR1cm4gcnAoZW1haWxSZXF1ZXN0T3B0aW9ucylcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xuICAgIHZhciBtZXNzYWdlRGV0YWlsUHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgbWVzc2FnZUxpc3QgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgIHRlbXBQYWdlVG9rZW4gPSBtZXNzYWdlTGlzdC5uZXh0UGFnZVRva2VuO1xuXG4gICAgaWYgKG1lc3NhZ2VMaXN0Lm1lc3NhZ2VzKSB7XG4gICAgICBmb3IgKHZhciBtZXNzYWdlSXRlciA9IDA7IG1lc3NhZ2VJdGVyIDwgbWVzc2FnZUxpc3QubWVzc2FnZXMubGVuZ3RoOyBtZXNzYWdlSXRlcisrKSB7XG4gICAgICAgIHZhciBtZXNzYWdlSWQgPSBtZXNzYWdlTGlzdC5tZXNzYWdlc1ttZXNzYWdlSXRlcl0uaWQ7XG4gICAgICAgIHZhciBuZXh0TWVzc2FnZSA9IHttZXNzYWdlSWQ6IG1lc3NhZ2VJZH07XG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobmV4dE1lc3NhZ2UpO1xuICAgICAgICBtZXNzYWdlRGV0YWlsUHJvbWlzZXMucHVzaChnZXRTaW5nbGVNZXNzYWdlRGV0YWlscyhtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIG5leHRNZXNzYWdlKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKG1lc3NhZ2VEZXRhaWxQcm9taXNlcyk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgIGlmKHRlbXBQYWdlVG9rZW4pIHtcbiAgICAgIHJldHVybiBnZXRNb3JlRW1haWxzKG1lc3NhZ2VzLCB1c2VyRW1haWwsIHRva2VuLCBhcGlWZXJzaW9uLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlcXVlc3RPcHRpb25zLCBmaXJzdFVyaSwgdGVtcFBhZ2VUb2tlbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZ2V0VXNlckVtYWlscyA9IGZ1bmN0aW9uKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHVzZXJFbWFpbCwgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbiwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCByZXN1bHQpIHtcbiAgdmFyIHRva2VuID0gJyc7XG4gIHZhciBlbWFpbFJlcXVlc3RPcHRpb25zID0ge307XG4gIHZhciBmaXJzdFVyaSA9ICcnO1xuICByZXR1cm4gZ2V0QWNjZXNzVG9rZW4oY2xpZW50SWQsIHNlcnZpY2VFbWFpbCwgdXNlckVtYWlsLCBwcml2YXRlS2V5KVxuICAudGhlbihmdW5jdGlvbih0b2tlblJlc3BvbnNlKSB7XG4gICAgdG9rZW4gPSB0b2tlblJlc3BvbnNlO1xuICAgIHZhciBxdWVyeUZpbHRlciA9ICdcXFwiYWZ0ZXI6JyArIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCkucmVwbGFjZSgvLS9nLCAnLycpICsgJyBiZWZvcmU6JyArIGZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApLnJlcGxhY2UoLy0vZywgJy8nKSArICdcXFwiJztcbiAgICBmaXJzdFVyaSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9nbWFpbC92JyArIGFwaVZlcnNpb24gKyAnL3VzZXJzLycgKyB1c2VyRW1haWwgKyAnL21lc3NhZ2VzP21heFJlc3VsdHM9MTAwJnE9JyArIHF1ZXJ5RmlsdGVyO1xuICAgIGVtYWlsUmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJpOiBmaXJzdFVyaSxcbiAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gcnAoZW1haWxSZXF1ZXN0T3B0aW9ucyk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKGJvZHkpIHtcbiAgICB2YXIgbWVzc2FnZURldGFpbFByb21pc2VzID0gW107XG4gICAgcmVzdWx0LmRhdGEgPSB7fTtcbiAgICByZXN1bHQuZGF0YS5tZXNzYWdlTGlzdCA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgcmVzdWx0LmRhdGEubWVzc2FnZXMgPSBbXTtcblxuICAgIGlmIChyZXN1bHQuZGF0YS5tZXNzYWdlTGlzdC5tZXNzYWdlcykge1xuICAgICAgZm9yICh2YXIgbWVzc2FnZUl0ZXIgPSAwOyBtZXNzYWdlSXRlciA8IHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm1lc3NhZ2VzLmxlbmd0aDsgbWVzc2FnZUl0ZXIrKykge1xuICAgICAgICB2YXIgbWVzc2FnZUlkID0gcmVzdWx0LmRhdGEubWVzc2FnZUxpc3QubWVzc2FnZXNbbWVzc2FnZUl0ZXJdLmlkO1xuICAgICAgICByZXN1bHQuZGF0YS5tZXNzYWdlcy5wdXNoKHttZXNzYWdlSWQ6IG1lc3NhZ2VJZH0pO1xuICAgICAgICBtZXNzYWdlRGV0YWlsUHJvbWlzZXMucHVzaChnZXRTaW5nbGVNZXNzYWdlRGV0YWlscyhtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdC5kYXRhLm1lc3NhZ2VzW21lc3NhZ2VJdGVyXSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLmFsbChtZXNzYWdlRGV0YWlsUHJvbWlzZXMpO1xuICB9KVxuICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0KTtcbiAgICBpZihyZXN1bHQuZGF0YS5tZXNzYWdlTGlzdC5uZXh0UGFnZVRva2VuKSB7XG4gICAgICByZXR1cm4gZ2V0TW9yZUVtYWlscyhyZXN1bHQuZGF0YS5tZXNzYWdlcywgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxSZXF1ZXN0T3B0aW9ucywgZmlyc3RVcmksIHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm5leHRQYWdlVG9rZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgIHJlc3VsdC5zdWNjZXNzID0gdHJ1ZTtcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIHJlc3VsdC5zdWNjZXNzID0gZmFsc2U7XG4gICAgaWYgKGVyci5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgdmFyIGVudGlyZU1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgIHZhciBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XG4gICAgICB2YXIgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gbWVzc2FnZURhdGEuZXJyb3IubWVzc2FnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LmVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn07XG5cbnZhciBnZXRIZWFkZXJWYWx1ZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGhlYWRlck5hbWUpIHtcbiAgdmFyIGhlYWRlclZhbHVlcyA9IF8obWVzc2FnZS5wYXlsb2FkLmhlYWRlcnMpXG4gICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihoZWFkZXIpIHsgcmV0dXJuIGhlYWRlci5uYW1lID09PSBoZWFkZXJOYW1lOyB9KVxuICAgICAgICAgIC5wbHVjaygndmFsdWUnKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICBpZiAoaGVhZGVyVmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gaGVhZGVyVmFsdWVzWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG52YXIgZ2V0RW1haWxBZGRyZXNzT2JqZWN0RnJvbVN0cmluZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciByZXR1cm5PYmplY3QgPSB7XG4gICAgbmFtZTogdmFsdWUsXG4gICAgYWRkcmVzczogdmFsdWVcbiAgfTtcblxuICBpZiAodmFsdWUgJiYgdmFsdWUuaW5kZXhPZignPicpID4gMCkge1xuICAgIHZhciB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoJyAnKTtcbiAgICByZXR1cm5PYmplY3QuYWRkcmVzcyA9IHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGggLSAxXS5yZXBsYWNlKCc8JywgJycpLnJlcGxhY2UoJz4nLCAnJyk7XG4gICAgcmV0dXJuT2JqZWN0Lm5hbWUgPSB2YWx1ZS5yZXBsYWNlKCcgJyArIHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGggLSAxXSwgJycpO1xuICB9XG5cbiAgcmV0dXJuIHJldHVybk9iamVjdDtcbn07XG5cbnZhciBjb252ZXJ0RW1haWxMaXN0VG9BcnJheU9mRW1haWxBZGRyZXNzT2JqZWN0cyA9IGZ1bmN0aW9uKGVtYWlsTGlzdCkge1xuICB2YXIgZW1haWxBZGRyZXNzT2JqZWN0QXJyYXkgPSBbXTtcbiAgaWYgKGVtYWlsTGlzdCkge1xuICAgIHZhciBlbWFpbEFycmF5ID0gZW1haWxMaXN0LnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgZW1haWxJdGVyID0gMDsgZW1haWxJdGVyIDwgZW1haWxBcnJheS5sZW5ndGg7IGVtYWlsSXRlcisrKSB7XG4gICAgICBlbWFpbEFkZHJlc3NPYmplY3RBcnJheS5wdXNoKGdldEVtYWlsQWRkcmVzc09iamVjdEZyb21TdHJpbmcoZW1haWxBcnJheVtlbWFpbEl0ZXJdKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVtYWlsQWRkcmVzc09iamVjdEFycmF5O1xufTtcblxudmFyIGhhc0xhYmVsID0gZnVuY3Rpb24obWVzc2FnZSwgbGFiZWxWYWx1ZSkge1xuICByZXR1cm4gbWVzc2FnZS5sYWJlbElkcyAmJiBtZXNzYWdlLmxhYmVsSWRzLmxlbmd0aCAmJiAobWVzc2FnZS5sYWJlbElkcy5pbmRleE9mKGxhYmVsVmFsdWUpID49IDApO1xufTtcblxudmFyIGdldEZpcnN0U2NhbGFyUGFydCA9IGZ1bmN0aW9uKHBhcnRUb0NoZWNrKSB7XG4gIHZhciByZXR1cm5PYmplY3QgPSBwYXJ0VG9DaGVjaztcbiAgXy5mb3JFYWNoKHBhcnRUb0NoZWNrLmhlYWRlcnMsIGZ1bmN0aW9uKGhlYWRlcikge1xuICAgIGlmKGhlYWRlci5uYW1lID09PSAnQ29udGVudC1UeXBlJyAmJiBoZWFkZXIudmFsdWUuaW5kZXhPZignbXVsdGlwYXJ0LycpID4gLTEgJiYgcGFydFRvQ2hlY2sucGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuT2JqZWN0ID0gZ2V0Rmlyc3RTY2FsYXJQYXJ0KHBhcnRUb0NoZWNrLnBhcnRzWzBdKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0dXJuT2JqZWN0O1xufTtcblxudmFyIG1hcEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xuICB2YXIgbWFwcGVkRGF0YSA9IFtdO1xuXG4gIGZvciAodmFyIHVzZXJJdGVyID0gMDsgdXNlckl0ZXIgPCBlbWFpbERhdGEubGVuZ3RoOyB1c2VySXRlcisrKSB7XG4gICAgdmFyIG1hcHBlZFVzZXIgPSBfLmFzc2lnbih7fSwgZW1haWxEYXRhW3VzZXJJdGVyXSwge1xuICAgICAgZGF0YTogW10sXG4gICAgICBzdWNjZXNzOiBlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MsXG4gICAgICBlcnJvck1lc3NhZ2U6IGVtYWlsRGF0YVt1c2VySXRlcl0uZXJyb3JNZXNzYWdlXG4gICAgfSk7XG5cbiAgICBpZiAoZW1haWxEYXRhW3VzZXJJdGVyXS5zdWNjZXNzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVtYWlsRGF0YVt1c2VySXRlcl0uZGF0YVsnbWVzc2FnZXMnXS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPSBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbJ21lc3NhZ2VzJ11baV07XG4gICAgICAgIHZhciBtYXBwZWRFbWFpbE1lc3NhZ2UgPSB7fTtcblxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UgPSBvcmlnaW5hbEVtYWlsTWVzc2FnZTtcbiAgICAgICAgdmFyIG1lc3NhZ2VEYXRhID0gb3JpZ2luYWxFbWFpbE1lc3NhZ2UubWVzc2FnZURhdGE7XG5cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLm1lc3NhZ2VJZCA9IG9yaWdpbmFsRW1haWxNZXNzYWdlLm1lc3NhZ2VJZDtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNvbnZlcnNhdGlvbklkID0gbWVzc2FnZURhdGEudGhyZWFkSWQ7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5kYXRlVGltZVNlbnQgPSBtb21lbnQobmV3IERhdGUoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdEYXRlJykpKS51dGMoKS50b0RhdGUoKTtcblxuICAgICAgICB2YXIgZGF0ZVJlY2VpdmVkID0gZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdSZWNlaXZlZCcpO1xuICAgICAgICBpZiAoZGF0ZVJlY2VpdmVkKSB7XG4gICAgICAgICAgdmFyIGRhdGVQYXJ0T2ZWYWx1ZSA9IGRhdGVSZWNlaXZlZC5zcGxpdCgnOycpWzFdO1xuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5kYXRlVGltZVJlY2VpdmVkID0gbW9tZW50KG5ldyBEYXRlKGRhdGVQYXJ0T2ZWYWx1ZSkpLnV0YygpLnRvRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmltcG9ydGFuY2UgPSAnTm9ybWFsJztcbiAgICAgICAgaWYgKGhhc0xhYmVsKG1lc3NhZ2VEYXRhLCAnSU1QT1JUQU5UJykpIHtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9ICdJbXBvcnRhbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNhdGVnb3JpZXMgPSBtZXNzYWdlRGF0YS5sYWJlbElkcztcblxuICAgICAgICBpZiAoaGFzTGFiZWwobWVzc2FnZURhdGEsICdTRU5UJykpIHtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVySWQgPSAnU2VudCBJdGVtcyc7XG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZvbGRlck5hbWUgPSAnU2VudCBJdGVtcyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZvbGRlcklkID0gJ0luYm94JztcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVyTmFtZSA9ICdJbmJveCc7XG4gICAgICAgIH1cblxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2Uuc3ViamVjdCA9IGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnU3ViamVjdCcpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYm9keVByZXZpZXcgPSBtZXNzYWdlRGF0YS5zbmlwcGV0O1xuXG4gICAgICAgIGlmIChtZXNzYWdlRGF0YS5wYXlsb2FkLnBhcnRzICYmIG1lc3NhZ2VEYXRhLnBheWxvYWQucGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJ0VG9DaGVjayA9IGdldEZpcnN0U2NhbGFyUGFydChtZXNzYWdlRGF0YS5wYXlsb2FkLnBhcnRzWzBdKTtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udGVudFR5cGUgPSBwYXJ0VG9DaGVjay5taW1lVHlwZTtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYm9keSA9IG5ldyBCdWZmZXIocGFydFRvQ2hlY2suYm9keS5kYXRhLCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCA9IG51bGw7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc1JlYWRSZWNlaXB0UmVxdWVzdGVkID0gbnVsbDtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmhhc0F0dGFjaG1lbnRzID0gbnVsbDtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzRHJhZnQgPSBudWxsO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNSZWFkID0gaGFzTGFiZWwobWVzc2FnZURhdGEsICdSRUFEJyk7XG5cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZyb21BZGRyZXNzID0gZ2V0RW1haWxBZGRyZXNzT2JqZWN0RnJvbVN0cmluZyhnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ0Zyb20nKSkuYWRkcmVzcztcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZyb21OYW1lID0gZ2V0RW1haWxBZGRyZXNzT2JqZWN0RnJvbVN0cmluZyhnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ0Zyb20nKSkubmFtZTtcblxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UudG9SZWNpcGllbnRzID0gY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdUbycpKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNjUmVjaXBpZW50cyA9IGNvbnZlcnRFbWFpbExpc3RUb0FycmF5T2ZFbWFpbEFkZHJlc3NPYmplY3RzKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnQ2MnKSk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzID0gY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdCY2MnKSk7XG5cbiAgICAgICAgZGVsZXRlIG1hcHBlZEVtYWlsTWVzc2FnZS5tZXNzYWdlRGF0YTtcbiAgICAgICAgbWFwcGVkVXNlci5kYXRhLnB1c2gobWFwcGVkRW1haWxNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWFwcGVkRGF0YS5wdXNoKG1hcHBlZFVzZXIpO1xuICB9XG5cbiAgcmV0dXJuIG1hcHBlZERhdGE7XG59O1xuXG52YXIgZ2V0RW1haWxEYXRhID0gZnVuY3Rpb24oZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHByaXZhdGVLZXksIGFwaVZlcnNpb24pIHtcbiAgdmFyIGVtYWlsUmVzdWx0cyA9IFtdO1xuICB2YXIgZW1haWxSZXN1bHRQcm9taXNlcyA9IFtdO1xuICB2YXIgZW1haWxJdGVyID0gMDtcbiAgZm9yIChlbWFpbEl0ZXIgPSAwOyBlbWFpbEl0ZXIgPCBlbWFpbHMubGVuZ3RoOyBlbWFpbEl0ZXIrKykge1xuICAgIC8vaW5pdGlhbGl6ZSBlbWFpbFJlc3VsdHMgd2l0aCB0aGUgZW1haWwgb2JqZWN0IHBhc3NlZCBpblxuICAgIC8vYW5kIGFkZCBmaWx0ZXIgZGF0ZXNcbiAgICBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSA9IF8uYXNzaWduKHt9LCBlbWFpbHNbZW1haWxJdGVyXSwge1xuICAgICAgZmlsdGVyU3RhcnREYXRlOiBmaWx0ZXJTdGFydERhdGUsXG4gICAgICBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlXG4gICAgfSk7XG5cbiAgICBlbWFpbFJlc3VsdFByb21pc2VzLnB1c2goZ2V0VXNlckVtYWlscyhjbGllbnRJZCwgc2VydmljZUVtYWlsLCBlbWFpbHNbZW1haWxJdGVyXS5lbWFpbEFmdGVyTWFwcGluZywgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbiwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSkpO1xuICB9XG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKGVtYWlsUmVzdWx0UHJvbWlzZXMpXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBlbWFpbFJlc3VsdHM7XG4gIH0pO1xufTtcblxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUuZ2V0QmF0Y2hEYXRhID0gZnVuY3Rpb24oZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcbiAgdmFyIGNsaWVudElkID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmNsaWVudElkO1xuICB2YXIgY2xpZW50RW1haWwgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWw7XG4gIHZhciBzZXJ2aWNlRW1haWwgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuc2VydmljZUVtYWlsO1xuICB2YXIgcHJpdmF0ZUtleSA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5jZXJ0aWZpY2F0ZTtcbiAgdmFyIGFwaVZlcnNpb24gPSB0aGlzLl9jb25maWcub3B0aW9ucy5hcGlWZXJzaW9uO1xuXG4gIHZhciBkYXRhQWRhcHRlclJ1blN0YXRzID0ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKCksXG4gICAgZmlsdGVyU3RhcnREYXRlOiBmaWx0ZXJTdGFydERhdGUsXG4gICAgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZSxcbiAgICBlbWFpbHM6IGVtYWlsc1xuICB9O1xuXG4gIC8vZmlyc3QgdHJ5IHRvIGdldCB0b2tlbiBmb3IgdGhlIGFkbWluIC0gaWYgdGhhdCBmYWlscywgdGhlbiBhbGwgd2lsbCBmYWlsXG4gIHJldHVybiBnZXRBY2Nlc3NUb2tlbihjbGllbnRJZCwgc2VydmljZUVtYWlsLCBjbGllbnRFbWFpbCwgcHJpdmF0ZUtleSlcbiAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGdldEVtYWlsRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgY2xpZW50SWQsIHNlcnZpY2VFbWFpbCwgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbik7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xuICAgIHJldHVybiBtYXBFbWFpbERhdGEoZW1haWxEYXRhKTtcbiAgfSlcbiAgLnRoZW4oZnVuY3Rpb24obWFwcGVkRW1haWxEYXRhKSB7XG4gICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5yZXN1bHRzID0gbWFwcGVkRW1haWxEYXRhO1xuICAgIHJldHVybiBkYXRhQWRhcHRlclJ1blN0YXRzO1xuICB9KVxuICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5zdWNjZXNzID0gZmFsc2U7XG4gICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5lcnJvck1lc3NhZ2UgPSBlcnI7XG4gICAgY29uc29sZS5sb2coJ0dvb2dsZU1haWwgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG4gICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XG4gIH0pO1xufTtcblxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUucnVuQ29ubmVjdGlvblRlc3QgPSBmdW5jdGlvbihjb25uZWN0aW9uRGF0YSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBfdGhpcy5fY29uZmlnID0gbmV3IEdvb2dsZU1haWwuQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XG4gIHZhciBmaWx0ZXJTdGFydERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCk7XG4gIHZhciBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XG4gIHJldHVybiBfdGhpcy5nZXRCYXRjaERhdGEoW3tlbWFpbEFmdGVyTWFwcGluZzogX3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbH1dLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsICcnKVxuICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0pIHtcbiAgICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgICByZXR1cm4gZGF0YS5yZXN1bHRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH0pO1xufTtcblxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUucnVuTWVzc2FnZVRlc3QgPSBmdW5jdGlvbihjb25uZWN0aW9uRGF0YSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBfdGhpcy5fY29uZmlnID0gbmV3IEdvb2dsZU1haWwuQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XG4gIHZhciBmaWx0ZXJTdGFydERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCk7XG4gIHZhciBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykuYWRkKDEsICdkYXlzJykudG9EYXRlKCk7XG4gIHJldHVybiBfdGhpcy5nZXRCYXRjaERhdGEoW190aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWxdLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsICdTdWJqZWN0LEJvZHlQcmV2aWV3LEJvZHknKVxuICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgY29uc29sZS5sb2coJ3J1bk1lc3NhZ2VUZXN0IHdvcmtlZCcpO1xuICAgIGNvbnNvbGUubG9nKGRhdGEucmVzdWx0c1swXSk7XG4gIH0pXG4gIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICBjb25zb2xlLmxvZygncnVuTWVzc2FnZVRlc3QgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgfSk7XG59O1xuIl19
//# sourceMappingURL=index.js.map

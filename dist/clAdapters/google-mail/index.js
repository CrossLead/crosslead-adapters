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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnNcXGdvb2dsZS1tYWlsXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7QUFFYixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDcEMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDekMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUxQixJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsYUFBYSxHQUFHO0FBQzVELGFBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDeEIsQ0FBQzs7QUFFRixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFMUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUN4QyxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlELE1BQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRCxTQUFPLElBQUksQ0FBQyxRQUFRLENBQ2pCLElBQUksRUFB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d0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDN0QsQ0FBQyxDQUFDO0NBQ0osQ0FBQyIsImZpbGUiOiJjbEFkYXB0ZXJzXFxnb29nbGUtbWFpbFxcaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XHJcbnZhciBycCA9IHJlcXVpcmUoJ3JlcXVlc3QtcHJvbWlzZScpO1xyXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcclxudmFyIEJhc2VBZGFwdGVyID0gcmVxdWlyZSgnLi4vYmFzZS9BZGFwdGVyJyk7XHJcbnZhciBHb29nbGVNYWlsID0gcmVxdWlyZSgnLi9nb29nbGUtanMuanMnKTtcclxudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xyXG52YXIgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xyXG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxudmFyIEdvb2dsZUFkYXB0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdvb2dsZUFkYXB0ZXIoKSB7XHJcbiAgQmFzZUFkYXB0ZXIuY2FsbCh0aGlzKTtcclxufTtcclxuXHJcbnV0aWwuaW5oZXJpdHMoR29vZ2xlQWRhcHRlciwgQmFzZUFkYXB0ZXIpO1xyXG5cclxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgdGhpcy5fY29uZmlnID0gbmV3IEdvb2dsZU1haWwuQ29uZmlndXJhdGlvbih0aGlzLmNyZWRlbnRpYWxzKTtcclxuICB0aGlzLl9zZXJ2aWNlID0gbmV3IEdvb2dsZU1haWwuU2VydmljZSh0aGlzLl9jb25maWcpO1xyXG4gIHJldHVybiB0aGlzLl9zZXJ2aWNlXHJcbiAgICAuaW5pdCgpXHJcbiAgICAudGhlbihmdW5jdGlvbiggLypjbGllbnQqLyApIHtcclxuICAgICAgdmFyIG1zZyA9ICdTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgZ21haWwgYWRhcHRlciBmb3IgZW1haWw6ICVzJztcclxuICAgICAgY29uc29sZS5sb2cobXNnLCBfdGhpcy5jcmVkZW50aWFscy5lbWFpbCk7XHJcbiAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH0pO1xyXG59O1xyXG5cclxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICBkZWxldGUgdGhpcy5fY29uZmlnO1xyXG4gIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xyXG59O1xyXG5cclxudmFyIGdldFNpbmdsZU1lc3NhZ2VEZXRhaWxzID0gZnVuY3Rpb24obWVzc2FnZUlkLCB1c2VyRW1haWwsIHRva2VuLCBhcGlWZXJzaW9uLCBhZGRpdGlvbmFsRmllbGRzLCByZXN1bHQpIHtcclxuICB2YXIgYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkgPSBhZGRpdGlvbmFsRmllbGRzLnJlcGxhY2UoJ0JvZHlQcmV2aWV3JywgJ3NuaXBwZXQnKTtcclxuICBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSA9IGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5LnJlcGxhY2UoJ0JvZHknLCAncGF5bG9hZChwYXJ0cyknKTtcclxuICBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSA9IGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5LnJlcGxhY2UoJ1N1YmplY3QnLCAncGF5bG9hZChwYXJ0cyknKTtcclxuXHJcbiAgaWYgKGFkZGl0aW9uYWxGaWVsZHNUb1F1ZXJ5ICE9PSAnJykge1xyXG4gICAgYWRkaXRpb25hbEZpZWxkc1RvUXVlcnkgPSAnLCcgKyBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeTtcclxuICB9XHJcblxyXG4gIHZhciBtZXNzYWdlUmVxdWVzdE9wdGlvbnMgPSB7XHJcbiAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgdXJpOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZ21haWwvdicgKyBhcGlWZXJzaW9uICsgJy91c2Vycy8nICsgdXNlckVtYWlsICsgJy9tZXNzYWdlcy8nICsgbWVzc2FnZUlkICsgJz9maWVsZHM9aWQsdGhyZWFkSWQsbGFiZWxJZHMscGF5bG9hZChoZWFkZXJzKScgKyBhZGRpdGlvbmFsRmllbGRzVG9RdWVyeSxcclxuICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxyXG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXHJcbiAgICB9XHJcbiAgfTtcclxuICByZXR1cm4gcnAobWVzc2FnZVJlcXVlc3RPcHRpb25zKVxyXG4gIC50aGVuKGZ1bmN0aW9uKG1lc3NhZ2VEZXRhaWxzKSB7XHJcbiAgICByZXN1bHQubWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VEZXRhaWxzKTtcclxuICAgIGlmIChhZGRpdGlvbmFsRmllbGRzLmluZGV4T2YoJ1N1YmplY3QnKSA9PT0gLTEpIHtcclxuICAgICAgLy9yZW1vdmUgc3ViamVjdCBoZWFkZXJcclxuICAgICAgaWYgKHJlc3VsdC5tZXNzYWdlRGF0YS5wYXlsb2FkICYmIHJlc3VsdC5tZXNzYWdlRGF0YS5wYXlsb2FkLmhlYWRlcnMgJiYgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaGVhZGVySXRlciA9IDA7IGhlYWRlckl0ZXIgPCByZXN1bHQubWVzc2FnZURhdGEucGF5bG9hZC5oZWFkZXJzLmxlbmd0aDsgaGVhZGVySXRlcisrKSB7XHJcbiAgICAgICAgICBpZiAocmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVyc1toZWFkZXJJdGVyXS5uYW1lID09PSAnU3ViamVjdCcpIHtcclxuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VEYXRhLnBheWxvYWQuaGVhZGVyc1toZWFkZXJJdGVyXS52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldEFjY2Vzc1Rva2VuID0gZnVuY3Rpb24oY2xpZW50SWQsIGFkbWluRW1haWwsIHVzZXJFbWFpbCwgcHJpdmF0ZUtleSkge1xyXG4gIHZhciB0b2tlblJlcXVlc3RVcmwgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YzL3Rva2VuJztcclxuICB2YXIgdW5peEVwb2NoVGltZSA9IE1hdGguZmxvb3IoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG5cclxuICB2YXIgand0SGVhZGVyID0ge1xyXG4gICAgYWxnOiAnUlMyNTYnLFxyXG4gICAgdHlwOiAnSldUJ1xyXG4gIH07XHJcblxyXG4gIHZhciBqd3RQYXlsb2FkID0ge1xyXG4gICAgJ2lzcyc6IGFkbWluRW1haWwsXHJcbiAgICAnc2NvcGUnOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9nbWFpbC5yZWFkb25seScsXHJcbiAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxyXG4gICAgJ2V4cCc6IHVuaXhFcG9jaFRpbWUgKyAzNjAwLFxyXG4gICAgJ2lhdCc6IHVuaXhFcG9jaFRpbWUsXHJcbiAgICAnc3ViJzogdXNlckVtYWlsXHJcbiAgfTtcclxuXHJcbiAgdmFyIGVuY29kZWRKd3RIZWFkZXIgPSBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGp3dEhlYWRlcikpLnRvU3RyaW5nKCdiYXNlNjQnKTtcclxuICB2YXIgZW5jb2RlZEp3dFBheWxvYWQgPSBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGp3dFBheWxvYWQpKS50b1N0cmluZygnYmFzZTY0Jyk7XHJcbiAgdmFyIHN0cmluZ1RvU2lnbiA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZDtcclxuXHJcbiAgLy9zaWduIGl0IVxyXG4gIHZhciBzaWduZXIgPSBjcnlwdG8uY3JlYXRlU2lnbignUlNBLVNIQTI1NicpO1xyXG4gIHNpZ25lci51cGRhdGUoc3RyaW5nVG9TaWduKTtcclxuXHJcbiAgdmFyIGVuY29kZWRTaWduZWRKd3RJbmZvID0gc2lnbmVyLnNpZ24ocHJpdmF0ZUtleSwgJ2Jhc2U2NCcpO1xyXG5cclxuICAvL2RlZmluZSBhc3NlcnRpb25cclxuICB2YXIgY2xpZW50QXNzZXJ0aW9uID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkICsgJy4nICsgZW5jb2RlZFNpZ25lZEp3dEluZm87XHJcblxyXG4gIHZhciB0b2tlblJlcXVlc3RGb3JtRGF0YSA9IHtcclxuICAgIGdyYW50X3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTpqd3QtYmVhcmVyJyxcclxuICAgIGFzc2VydGlvbjogY2xpZW50QXNzZXJ0aW9uXHJcbiAgfTtcclxuXHJcbiAgdmFyIHJlcXVlc3REYXRhID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRva2VuUmVxdWVzdEZvcm1EYXRhKTtcclxuICB2YXIgcmVxdWVzdERhdGFMZW5ndGggPSByZXF1ZXN0RGF0YS5sZW5ndGg7XHJcblxyXG4gIHZhciB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xyXG4gICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICBwb3J0OiA0NDMsXHJcbiAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcclxuICAgIGJvZHk6IHJlcXVlc3REYXRhLFxyXG4gICAgbXVsdGlwYXJ0OiBmYWxzZSxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogcmVxdWVzdERhdGFMZW5ndGgsXHJcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiBycCh0b2tlblJlcXVlc3RPcHRpb25zKVxyXG4gIC50aGVuKGZ1bmN0aW9uKGJvZHkpIHtcclxuICAgIHZhciB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgaWYgKHRva2VuRGF0YSAmJiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuKSB7XHJcbiAgICAgIHJldHVybiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdDb3VsZCBub3QgZ2V0IGFjY2VzcyB0b2tlbi4nKTtcclxuICAgIH1cclxuICB9KVxyXG4gIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgIHZhciB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVycikpO1xyXG4gICAgaWYgKHRva2VuRGF0YS5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xyXG4gICAgICB2YXIgZW50aXJlTWVzc2FnZSA9IHRva2VuRGF0YS5tZXNzYWdlO1xyXG4gICAgICB2YXIgbWVzc2FnZUpzb24gPSBlbnRpcmVNZXNzYWdlLnJlcGxhY2UodG9rZW5EYXRhLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpO1xyXG4gICAgICB2YXIgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XHJcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tJyk7XHJcbiAgICAgIC8vY29uc29sZS5sb2cobWVzc2FnZURhdGEpO1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWVzc2FnZURhdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0TW9yZUVtYWlscyA9IGZ1bmN0aW9uKG1lc3NhZ2VzLCB1c2VyRW1haWwsIHRva2VuLCBhcGlWZXJzaW9uLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlcXVlc3RPcHRpb25zLCBmaXJzdFVyaSwgbmV4dFBhZ2VUb2tlbikge1xyXG4gIGVtYWlsUmVxdWVzdE9wdGlvbnMudXJpID0gZmlyc3RVcmkgKyAnJnBhZ2VUb2tlbj0nICsgbmV4dFBhZ2VUb2tlbjtcclxuICB2YXIgdGVtcFBhZ2VUb2tlbiA9ICcnO1xyXG4gIHJldHVybiBycChlbWFpbFJlcXVlc3RPcHRpb25zKVxyXG4gIC50aGVuKGZ1bmN0aW9uKGJvZHkpIHtcclxuICAgIHZhciBtZXNzYWdlRGV0YWlsUHJvbWlzZXMgPSBbXTtcclxuICAgIHZhciBtZXNzYWdlTGlzdCA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICB0ZW1wUGFnZVRva2VuID0gbWVzc2FnZUxpc3QubmV4dFBhZ2VUb2tlbjtcclxuXHJcbiAgICBpZiAobWVzc2FnZUxpc3QubWVzc2FnZXMpIHtcclxuICAgICAgZm9yICh2YXIgbWVzc2FnZUl0ZXIgPSAwOyBtZXNzYWdlSXRlciA8IG1lc3NhZ2VMaXN0Lm1lc3NhZ2VzLmxlbmd0aDsgbWVzc2FnZUl0ZXIrKykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlSWQgPSBtZXNzYWdlTGlzdC5tZXNzYWdlc1ttZXNzYWdlSXRlcl0uaWQ7XHJcbiAgICAgICAgdmFyIG5leHRNZXNzYWdlID0ge21lc3NhZ2VJZDogbWVzc2FnZUlkfTtcclxuICAgICAgICBtZXNzYWdlcy5wdXNoKG5leHRNZXNzYWdlKTtcclxuICAgICAgICBtZXNzYWdlRGV0YWlsUHJvbWlzZXMucHVzaChnZXRTaW5nbGVNZXNzYWdlRGV0YWlscyhtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIG5leHRNZXNzYWdlKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwobWVzc2FnZURldGFpbFByb21pc2VzKTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgaWYodGVtcFBhZ2VUb2tlbikge1xyXG4gICAgICByZXR1cm4gZ2V0TW9yZUVtYWlscyhtZXNzYWdlcywgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxSZXF1ZXN0T3B0aW9ucywgZmlyc3RVcmksIHRlbXBQYWdlVG9rZW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn07XHJcblxyXG52YXIgZ2V0VXNlckVtYWlscyA9IGZ1bmN0aW9uKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHVzZXJFbWFpbCwgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbiwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCByZXN1bHQpIHtcclxuICB2YXIgdG9rZW4gPSAnJztcclxuICB2YXIgZW1haWxSZXF1ZXN0T3B0aW9ucyA9IHt9O1xyXG4gIHZhciBmaXJzdFVyaSA9ICcnO1xyXG4gIHJldHVybiBnZXRBY2Nlc3NUb2tlbihjbGllbnRJZCwgc2VydmljZUVtYWlsLCB1c2VyRW1haWwsIHByaXZhdGVLZXkpXHJcbiAgLnRoZW4oZnVuY3Rpb24odG9rZW5SZXNwb25zZSkge1xyXG4gICAgdG9rZW4gPSB0b2tlblJlc3BvbnNlO1xyXG4gICAgZmlyc3RVcmkgPSAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZ21haWwvdicgKyBhcGlWZXJzaW9uICsgJy91c2Vycy8nICsgdXNlckVtYWlsICsgJy9tZXNzYWdlcz9tYXhSZXN1bHRzPTEwMCZxPVwiYWZ0ZXI6JyArIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCkucmVwbGFjZSgvLS9nLCBcIi9cIikgKyAnIGJlZm9yZTonICsgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCkucmVwbGFjZSgvLS9nLCBcIi9cIikgKyAnXCInO1xyXG4gICAgZW1haWxSZXF1ZXN0T3B0aW9ucyA9IHtcclxuICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgdXJpOiBmaXJzdFVyaSxcclxuICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiAnQmVhcmVyICcgKyB0b2tlbixcclxuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gcnAoZW1haWxSZXF1ZXN0T3B0aW9ucyk7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbihib2R5KSB7XHJcbiAgICB2YXIgbWVzc2FnZURldGFpbFByb21pc2VzID0gW107XHJcbiAgICByZXN1bHQuZGF0YSA9IHt9O1xyXG4gICAgcmVzdWx0LmRhdGEubWVzc2FnZUxpc3QgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgcmVzdWx0LmRhdGEubWVzc2FnZXMgPSBbXTtcclxuXHJcbiAgICBpZiAocmVzdWx0LmRhdGEubWVzc2FnZUxpc3QubWVzc2FnZXMpIHtcclxuICAgICAgZm9yICh2YXIgbWVzc2FnZUl0ZXIgPSAwOyBtZXNzYWdlSXRlciA8IHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm1lc3NhZ2VzLmxlbmd0aDsgbWVzc2FnZUl0ZXIrKykge1xyXG4gICAgICAgIHZhciBtZXNzYWdlSWQgPSByZXN1bHQuZGF0YS5tZXNzYWdlTGlzdC5tZXNzYWdlc1ttZXNzYWdlSXRlcl0uaWQ7XHJcbiAgICAgICAgcmVzdWx0LmRhdGEubWVzc2FnZXMucHVzaCh7bWVzc2FnZUlkOiBtZXNzYWdlSWR9KTtcclxuICAgICAgICBtZXNzYWdlRGV0YWlsUHJvbWlzZXMucHVzaChnZXRTaW5nbGVNZXNzYWdlRGV0YWlscyhtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdC5kYXRhLm1lc3NhZ2VzW21lc3NhZ2VJdGVyXSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKG1lc3NhZ2VEZXRhaWxQcm9taXNlcyk7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgIC8vY29uc29sZS5sb2cocmVzdWx0LmRhdGEubWVzc2FnZUxpc3QpO1xyXG4gICAgaWYocmVzdWx0LmRhdGEubWVzc2FnZUxpc3QubmV4dFBhZ2VUb2tlbikge1xyXG4gICAgICByZXR1cm4gZ2V0TW9yZUVtYWlscyhyZXN1bHQuZGF0YS5tZXNzYWdlcywgdXNlckVtYWlsLCB0b2tlbiwgYXBpVmVyc2lvbiwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxSZXF1ZXN0T3B0aW9ucywgZmlyc3RVcmksIHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm5leHRQYWdlVG9rZW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgIHJlc3VsdC5zdWNjZXNzID0gdHJ1ZTtcclxuICB9KVxyXG4gIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgIHJlc3VsdC5zdWNjZXNzID0gZmFsc2U7XHJcbiAgICBpZiAoZXJyLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XHJcbiAgICAgIHZhciBlbnRpcmVNZXNzYWdlID0gZXJyLm1lc3NhZ2U7XHJcbiAgICAgIHZhciBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XHJcbiAgICAgIHZhciBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZUpzb24ucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXCInLCAnZycpLCdcIicpKTtcclxuICAgICAgcmVzdWx0LmVycm9yTWVzc2FnZSA9IG1lc3NhZ2VEYXRhLmVycm9yLm1lc3NhZ2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0pO1xyXG59O1xyXG5cclxudmFyIGdldEhlYWRlclZhbHVlID0gZnVuY3Rpb24obWVzc2FnZSwgaGVhZGVyTmFtZSkge1xyXG4gIHZhciBoZWFkZXJWYWx1ZXMgPSBfKG1lc3NhZ2UucGF5bG9hZC5oZWFkZXJzKVxyXG4gICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihoZWFkZXIpIHsgcmV0dXJuIGhlYWRlci5uYW1lID09PSBoZWFkZXJOYW1lOyB9KVxyXG4gICAgICAgICAgLnBsdWNrKCd2YWx1ZScpXHJcbiAgICAgICAgICAudmFsdWUoKTtcclxuICBpZiAoaGVhZGVyVmFsdWVzLmxlbmd0aCA+IDApIHtcclxuICAgIHJldHVybiBoZWFkZXJWYWx1ZXNbMF07XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICB2YXIgcmV0dXJuT2JqZWN0ID0ge1xyXG4gICAgbmFtZTogdmFsdWUsXHJcbiAgICBhZGRyZXNzOiB2YWx1ZVxyXG4gIH07XHJcblxyXG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCc+JykgPiAwKSB7XHJcbiAgICB2YXIgdmFsdWVBcnJheSA9IHZhbHVlLnNwbGl0KCcgJyk7XHJcbiAgICByZXR1cm5PYmplY3QuYWRkcmVzcyA9IHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGggLSAxXS5yZXBsYWNlKCc8JywgJycpLnJlcGxhY2UoJz4nLCAnJyk7XHJcbiAgICByZXR1cm5PYmplY3QubmFtZSA9IHZhbHVlLnJlcGxhY2UoJyAnICsgdmFsdWVBcnJheVt2YWx1ZUFycmF5Lmxlbmd0aCAtIDFdLCAnJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmV0dXJuT2JqZWN0O1xyXG59O1xyXG5cclxudmFyIGNvbnZlcnRFbWFpbExpc3RUb0FycmF5T2ZFbWFpbEFkZHJlc3NPYmplY3RzID0gZnVuY3Rpb24oZW1haWxMaXN0KSB7XHJcbiAgdmFyIGVtYWlsQWRkcmVzc09iamVjdEFycmF5ID0gW107XHJcbiAgaWYgKGVtYWlsTGlzdCkge1xyXG4gICAgdmFyIGVtYWlsQXJyYXkgPSBlbWFpbExpc3Quc3BsaXQoJywnKTtcclxuICAgIGZvciAodmFyIGVtYWlsSXRlciA9IDA7IGVtYWlsSXRlciA8IGVtYWlsQXJyYXkubGVuZ3RoOyBlbWFpbEl0ZXIrKykge1xyXG4gICAgICBlbWFpbEFkZHJlc3NPYmplY3RBcnJheS5wdXNoKGdldEVtYWlsQWRkcmVzc09iamVjdEZyb21TdHJpbmcoZW1haWxBcnJheVtlbWFpbEl0ZXJdKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZW1haWxBZGRyZXNzT2JqZWN0QXJyYXk7XHJcbn07XHJcblxyXG52YXIgaGFzTGFiZWwgPSBmdW5jdGlvbihtZXNzYWdlLCBsYWJlbFZhbHVlKSB7XHJcbiAgcmV0dXJuIG1lc3NhZ2UubGFiZWxJZHMgJiYgbWVzc2FnZS5sYWJlbElkcy5sZW5ndGggJiYgKG1lc3NhZ2UubGFiZWxJZHMuaW5kZXhPZihsYWJlbFZhbHVlKSA+PSAwKTtcclxufTtcclxuXHJcbnZhciBnZXRGaXJzdFNjYWxhclBhcnQgPSBmdW5jdGlvbihwYXJ0VG9DaGVjaykge1xyXG4gIHZhciByZXR1cm5PYmplY3QgPSBwYXJ0VG9DaGVjaztcclxuICBfLmZvckVhY2gocGFydFRvQ2hlY2suaGVhZGVycywgZnVuY3Rpb24oaGVhZGVyKSB7XHJcbiAgICBpZihoZWFkZXIubmFtZSA9PT0gJ0NvbnRlbnQtVHlwZScgJiYgaGVhZGVyLnZhbHVlLmluZGV4T2YoJ211bHRpcGFydC8nKSA+IC0xICYmIHBhcnRUb0NoZWNrLnBhcnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuT2JqZWN0ID0gZ2V0Rmlyc3RTY2FsYXJQYXJ0KHBhcnRUb0NoZWNrLnBhcnRzWzBdKTtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gcmV0dXJuT2JqZWN0O1xyXG59O1xyXG5cclxudmFyIG1hcEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xyXG4gIHZhciBtYXBwZWREYXRhID0gW107XHJcblxyXG4gIGZvciAodmFyIHVzZXJJdGVyID0gMDsgdXNlckl0ZXIgPCBlbWFpbERhdGEubGVuZ3RoOyB1c2VySXRlcisrKSB7XHJcbiAgICB2YXIgbWFwcGVkVXNlciA9IF8uYXNzaWduKHt9LCBlbWFpbERhdGFbdXNlckl0ZXJdLCB7XHJcbiAgICAgIGRhdGE6IFtdLFxyXG4gICAgICBzdWNjZXNzOiBlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MsXHJcbiAgICAgIGVycm9yTWVzc2FnZTogZW1haWxEYXRhW3VzZXJJdGVyXS5lcnJvck1lc3NhZ2VcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbJ21lc3NhZ2VzJ10ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPSBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbJ21lc3NhZ2VzJ11baV07XHJcbiAgICAgICAgdmFyIG1hcHBlZEVtYWlsTWVzc2FnZSA9IHt9O1xyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UgPSBvcmlnaW5hbEVtYWlsTWVzc2FnZTtcclxuICAgICAgICB2YXIgbWVzc2FnZURhdGEgPSBvcmlnaW5hbEVtYWlsTWVzc2FnZS5tZXNzYWdlRGF0YTtcclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLm1lc3NhZ2VJZCA9IG9yaWdpbmFsRW1haWxNZXNzYWdlLm1lc3NhZ2VJZDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udmVyc2F0aW9uSWQgPSBtZXNzYWdlRGF0YS50aHJlYWRJZDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZGF0ZVRpbWVTZW50ID0gbW9tZW50KG5ldyBEYXRlKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnRGF0ZScpKSkudXRjKCkudG9EYXRlKCk7XHJcblxyXG4gICAgICAgIHZhciBkYXRlUmVjZWl2ZWQgPSBnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ1JlY2VpdmVkJyk7XHJcbiAgICAgICAgaWYgKGRhdGVSZWNlaXZlZCkge1xyXG4gICAgICAgICAgdmFyIGRhdGVQYXJ0T2ZWYWx1ZSA9IGRhdGVSZWNlaXZlZC5zcGxpdCgnOycpWzFdO1xyXG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmRhdGVUaW1lUmVjZWl2ZWQgPSBtb21lbnQobmV3IERhdGUoZGF0ZVBhcnRPZlZhbHVlKSkudXRjKCkudG9EYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9ICdOb3JtYWwnO1xyXG4gICAgICAgIGlmIChoYXNMYWJlbChtZXNzYWdlRGF0YSwgJ0lNUE9SVEFOVCcpKSB7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9ICdJbXBvcnRhbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNhdGVnb3JpZXMgPSBtZXNzYWdlRGF0YS5sYWJlbElkcztcclxuXHJcbiAgICAgICAgaWYgKGhhc0xhYmVsKG1lc3NhZ2VEYXRhLCAnU0VOVCcpKSB7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVySWQgPSAnU2VudCBJdGVtcyc7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVyTmFtZSA9ICdTZW50IEl0ZW1zJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZvbGRlcklkID0gJ0luYm94JztcclxuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5mb2xkZXJOYW1lID0gJ0luYm94JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5zdWJqZWN0ID0gZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdTdWJqZWN0Jyk7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmJvZHlQcmV2aWV3ID0gbWVzc2FnZURhdGEuc25pcHBldDtcclxuXHJcbiAgICAgICAgaWYgKG1lc3NhZ2VEYXRhLnBheWxvYWQucGFydHMgJiYgbWVzc2FnZURhdGEucGF5bG9hZC5wYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICB2YXIgcGFydFRvQ2hlY2sgPSBnZXRGaXJzdFNjYWxhclBhcnQobWVzc2FnZURhdGEucGF5bG9hZC5wYXJ0c1swXSk7XHJcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udGVudFR5cGUgPSBwYXJ0VG9DaGVjay5taW1lVHlwZTtcclxuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5ib2R5ID0gbmV3IEJ1ZmZlcihwYXJ0VG9DaGVjay5ib2R5LmRhdGEsICdiYXNlNjQnKS50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkID0gbnVsbDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCA9IG51bGw7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmhhc0F0dGFjaG1lbnRzID0gbnVsbDtcclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNEcmFmdCA9IG51bGw7XHJcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzUmVhZCA9IGhhc0xhYmVsKG1lc3NhZ2VEYXRhLCAnUkVBRCcpO1xyXG5cclxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZnJvbUFkZHJlc3MgPSBnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnRnJvbScpKS5hZGRyZXNzO1xyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5mcm9tTmFtZSA9IGdldEVtYWlsQWRkcmVzc09iamVjdEZyb21TdHJpbmcoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdGcm9tJykpLm5hbWU7XHJcblxyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS50b1JlY2lwaWVudHMgPSBjb252ZXJ0RW1haWxMaXN0VG9BcnJheU9mRW1haWxBZGRyZXNzT2JqZWN0cyhnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ1RvJykpO1xyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5jY1JlY2lwaWVudHMgPSBjb252ZXJ0RW1haWxMaXN0VG9BcnJheU9mRW1haWxBZGRyZXNzT2JqZWN0cyhnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ0NjJykpO1xyXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzID0gY29udmVydEVtYWlsTGlzdFRvQXJyYXlPZkVtYWlsQWRkcmVzc09iamVjdHMoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdCY2MnKSk7XHJcblxyXG4gICAgICAgIGRlbGV0ZSBtYXBwZWRFbWFpbE1lc3NhZ2UubWVzc2FnZURhdGE7XHJcbiAgICAgICAgbWFwcGVkVXNlci5kYXRhLnB1c2gobWFwcGVkRW1haWxNZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbWFwcGVkRGF0YS5wdXNoKG1hcHBlZFVzZXIpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG1hcHBlZERhdGE7XHJcbn07XHJcblxyXG52YXIgZ2V0RW1haWxEYXRhID0gZnVuY3Rpb24oZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHByaXZhdGVLZXksIGFwaVZlcnNpb24pIHtcclxuICB2YXIgZW1haWxSZXN1bHRzID0gW107XHJcbiAgdmFyIGVtYWlsUmVzdWx0UHJvbWlzZXMgPSBbXTtcclxuICB2YXIgZW1haWxJdGVyID0gMDtcclxuICBmb3IgKGVtYWlsSXRlciA9IDA7IGVtYWlsSXRlciA8IGVtYWlscy5sZW5ndGg7IGVtYWlsSXRlcisrKSB7XHJcbiAgICAvL2luaXRpYWxpemUgZW1haWxSZXN1bHRzIHdpdGggdGhlIGVtYWlsIG9iamVjdCBwYXNzZWQgaW5cclxuICAgIC8vYW5kIGFkZCBmaWx0ZXIgZGF0ZXNcclxuICAgIGVtYWlsUmVzdWx0c1tlbWFpbEl0ZXJdID0gXy5hc3NpZ24oe30sIGVtYWlsc1tlbWFpbEl0ZXJdLCB7XHJcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxyXG4gICAgICBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlXHJcbiAgICB9KTtcclxuXHJcbiAgICBlbWFpbFJlc3VsdFByb21pc2VzLnB1c2goZ2V0VXNlckVtYWlscyhjbGllbnRJZCwgc2VydmljZUVtYWlsLCBlbWFpbHNbZW1haWxJdGVyXS5lbWFpbEFmdGVyTWFwcGluZywgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbiwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSkpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIFByb21pc2UuYWxsKGVtYWlsUmVzdWx0UHJvbWlzZXMpXHJcbiAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gZW1haWxSZXN1bHRzO1xyXG4gIH0pO1xyXG59O1xyXG5cclxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUuZ2V0QmF0Y2hEYXRhID0gZnVuY3Rpb24oZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMpIHtcclxuICB2YXIgY2xpZW50SWQgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuY2xpZW50SWQ7XHJcbiAgdmFyIGNsaWVudEVtYWlsID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsO1xyXG4gIHZhciBzZXJ2aWNlRW1haWwgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuc2VydmljZUVtYWlsO1xyXG4gIHZhciBwcml2YXRlS2V5ID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmNlcnRpZmljYXRlO1xyXG4gIHZhciBhcGlWZXJzaW9uID0gdGhpcy5fY29uZmlnLm9wdGlvbnMuYXBpVmVyc2lvbjtcclxuXHJcbiAgdmFyIGRhdGFBZGFwdGVyUnVuU3RhdHMgPSB7XHJcbiAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgcnVuRGF0ZTogbW9tZW50KCkudXRjKCkudG9EYXRlKCksXHJcbiAgICBmaWx0ZXJTdGFydERhdGU6IGZpbHRlclN0YXJ0RGF0ZSxcclxuICAgIGZpbHRlckVuZERhdGU6IGZpbHRlckVuZERhdGUsXHJcbiAgICBlbWFpbHM6IGVtYWlsc1xyXG4gIH07XHJcblxyXG4gIC8vZmlyc3QgdHJ5IHRvIGdldCB0b2tlbiBmb3IgdGhlIGFkbWluIC0gaWYgdGhhdCBmYWlscywgdGhlbiBhbGwgd2lsbCBmYWlsXHJcbiAgcmV0dXJuIGdldEFjY2Vzc1Rva2VuKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIGNsaWVudEVtYWlsLCBwcml2YXRlS2V5KVxyXG4gIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGdldEVtYWlsRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgY2xpZW50SWQsIHNlcnZpY2VFbWFpbCwgcHJpdmF0ZUtleSwgYXBpVmVyc2lvbik7XHJcbiAgfSlcclxuICAudGhlbihmdW5jdGlvbihlbWFpbERhdGEpIHtcclxuICAgIHJldHVybiBtYXBFbWFpbERhdGEoZW1haWxEYXRhKTtcclxuICB9KVxyXG4gIC50aGVuKGZ1bmN0aW9uKG1hcHBlZEVtYWlsRGF0YSkge1xyXG4gICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5yZXN1bHRzID0gbWFwcGVkRW1haWxEYXRhO1xyXG4gICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XHJcbiAgfSlcclxuICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICBkYXRhQWRhcHRlclJ1blN0YXRzLnN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMuZXJyb3JNZXNzYWdlID0gZXJyO1xyXG4gICAgY29uc29sZS5sb2coJ0dvb2dsZU1haWwgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgICByZXR1cm4gZGF0YUFkYXB0ZXJSdW5TdGF0cztcclxuICB9KTtcclxufTtcclxuXHJcbkdvb2dsZUFkYXB0ZXIucHJvdG90eXBlLnJ1bkNvbm5lY3Rpb25UZXN0ID0gZnVuY3Rpb24oY29ubmVjdGlvbkRhdGEpIHtcclxuICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gIF90aGlzLl9jb25maWcgPSBuZXcgR29vZ2xlTWFpbC5Db25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcclxuICB2YXIgZmlsdGVyU3RhcnREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykuYWRkKC0xLCAnZGF5cycpLnRvRGF0ZSgpO1xyXG4gIHZhciBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XHJcbiAgcmV0dXJuIF90aGlzLmdldEJhdGNoRGF0YShbe2VtYWlsQWZ0ZXJNYXBwaW5nOiBfdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsfV0sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgJycpXHJcbiAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgaWYgKGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0pIHtcclxuICAgICAgLy90byBzZWUgaWYgaXQgcmVhbGx5IHdvcmtlZCwgd2UgbmVlZCB0byBwYXNzIGluIHRoZSBmaXJzdCByZXN1bHRcclxuICAgICAgcmV0dXJuIGRhdGEucmVzdWx0c1swXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuR29vZ2xlQWRhcHRlci5wcm90b3R5cGUucnVuTWVzc2FnZVRlc3QgPSBmdW5jdGlvbihjb25uZWN0aW9uRGF0YSkge1xyXG4gIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgX3RoaXMuX2NvbmZpZyA9IG5ldyBHb29nbGVNYWlsLkNvbmZpZ3VyYXRpb24oY29ubmVjdGlvbkRhdGEuY3JlZGVudGlhbHMpO1xyXG4gIHZhciBmaWx0ZXJTdGFydERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCk7XHJcbiAgdmFyIGZpbHRlckVuZERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoMSwgJ2RheXMnKS50b0RhdGUoKTtcclxuICByZXR1cm4gX3RoaXMuZ2V0QmF0Y2hEYXRhKFtfdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsXSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCAnU3ViamVjdCxCb2R5UHJldmlldyxCb2R5JylcclxuICAudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBjb25zb2xlLmxvZygncnVuTWVzc2FnZVRlc3Qgd29ya2VkJyk7XHJcbiAgICBjb25zb2xlLmxvZyhkYXRhLnJlc3VsdHNbMF0pO1xyXG4gIH0pXHJcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgY29uc29sZS5sb2coJ3J1bk1lc3NhZ2VUZXN0IEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XHJcbiAgfSk7XHJcbn07XHJcbiJdfQ==
//# sourceMappingURL=index.js.map

'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var uuid = require('node-uuid');
var crypto = require('crypto');
var rp = require('request-promise');
var util = require('util');
var BaseAdapter = require('./baseAdapter');
var Office365 = require('./office365-js.js');
var moment = require('moment');

/**
 * Office365Adapter
 *
 * @class
 * @return {Office365Adapter}
 */
var Office365Adapter = module.exports = function Office365Adapter() {
  BaseAdapter.call(this);
};

util.inherits(Office365Adapter, BaseAdapter);

/**
 * @override
 */
Office365Adapter.prototype.init = function () {
  var _this = this;
  this._config = new Office365.Configuration(this.credentials);
  this._service = new Office365.Service(this._config);
  return this._service.init().then(function () /*client*/{
    var msg = 'Successfully initialized Office365 for email: %s';
    console.log(msg, _this.credentials.email);
    return _this;
  });
};

/**
 * @override
 */
Office365Adapter.prototype.reset = function () {
  delete this._config;
  delete this._service;
};

var getUserEmails = function getUserEmails(apiVersion, email, filterStartDate, filterEndDate, additionalFields, result, token, pageToGet) {
  var recordsPerPage = 25;
  var maxPages = 20;
  pageToGet = pageToGet || 1;
  var skip = (pageToGet - 1) * recordsPerPage + 1;
  var emailRequestOptions = {
    method: 'GET',
    uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/messages?$top=' + recordsPerPage + '&$skip=' + skip + '&$filter=IsDraft eq false and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + ' and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '&$select=Id,Categories,DateTimeCreated,Subject,Importance,HasAttachments,ParentFolderId,From,Sender,ToRecipients,CcRecipients,BccRecipients,ReplyTo,ConversationId,DateTimeReceived,DateTimeSent,IsDeliveryReceiptRequested,IsReadReceiptRequested,IsRead' + additionalFields,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };
  return rp(emailRequestOptions).then(function (body) {
    result.success = true;
    var parsedBody = JSON.parse(body);

    if (parsedBody && pageToGet === 1) {
      result.data = parsedBody;
    } else if (parsedBody.value && pageToGet > 1) {
      result.data.value = result.data.value.concat(parsedBody.value);
    }

    if (parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages) {
      return getUserEmails(apiVersion, email, filterStartDate, filterEndDate, additionalFields, result, token, pageToGet + 1);
    } else {
      return true;
    }
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

var getAccessToken = function getAccessToken(apiVersion, clientId, tenantId, certThumbprint, privateKey) {
  var tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=' + apiVersion;

  var jwtHeader = {
    'alg': 'RS256',
    'x5t': certThumbprint
  };

  var jwtPayload = {
    'aud': tokenRequestUrl,
    'exp': new Date().getTime() / 1000 + 360000, // add X hours
    'iss': clientId,
    'jti': uuid.v4(),
    'nbf': new Date().getTime() / 1000 - 360000, // add -X hours
    'sub': clientId
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
    client_id: clientId,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    grant_type: 'client_credentials',
    resource: 'https://outlook.office365.com/',
    client_assertion: clientAssertion
  };

  var tokenRequestOptions = {
    method: 'POST',
    port: 443,
    uri: tokenRequestUrl,
    formData: tokenRequestFormData
  };

  return rp(tokenRequestOptions).then(function (body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      var accessToken = tokenData.access_token;
      return accessToken;
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

var extractDataFromEmailMessage = function extractDataFromEmailMessage(emailMessage, mapping) {
  if (mapping === '') {
    return '';
  } else if (mapping.indexOf('.') === -1) {
    return emailMessage[mapping];
  } else {
    //drill into object to grab the value we need
    var nestedPropertyArray = mapping.split('.');
    var returnVal = emailMessage[nestedPropertyArray[0]];
    if (returnVal) {
      for (var i = 1; i < nestedPropertyArray.length; i++) {
        returnVal = returnVal[nestedPropertyArray[i]];
        if (!returnVal) {
          return returnVal;
        }
      }
    }
    return returnVal;
  }
};

var mapEmailData = function mapEmailData(emailData) {
  var mapping = {
    'emails': 'value',
    'messageId': 'Id',
    'conversationId': 'ConversationId',
    'dateTimeSent': 'DateTimeSent',
    'dateTimeReceived': 'DateTimeReceived',
    'importance': 'Importance',
    'folderId': 'ParentFolderId',
    'folderName': '',
    'categories': 'Categories',
    'contentType': 'Body.ContentType',
    'subject': 'Subject',
    'bodyPreview': 'BodyPreview',
    'body': 'Body.Content',
    'fromAddress': 'From.EmailAddress.Address',
    'fromName': 'From.EmailAddress.Name',
    'toRecipients': 'ToRecipients',
    'toRecipientAddress': 'EmailAddress.Address',
    'toRecipientName': 'EmailAddress.Name',
    'ccRecipients': 'CcRecipients',
    'ccRecipientAddress': 'EmailAddress.Address',
    'ccRecipientName': 'EmailAddress.Name',
    'bccRecipients': 'BccRecipients',
    'bccRecipientAddress': 'EmailAddress.Address',
    'bccRecipientName': 'EmailAddress.Name',
    'isDeliveryReceiptRequested': 'IsDeliveryReceiptRequested',
    'isReadReceiptRequested': 'IsReadReceiptRequested',
    'hasAttachments': 'HasAttachments',
    'isDraft': 'IsDraft',
    'isRead': 'IsRead'
  };

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
      for (var i = 0; i < emailData[userIter].data[mapping.emails].length; i++) {
        var originalEmailMessage = emailData[userIter].data[mapping.emails][i];
        var mappedEmailMessage = {};

        //get top-level scalars
        mappedEmailMessage.messageId = extractDataFromEmailMessage(originalEmailMessage, mapping.messageId);
        mappedEmailMessage.conversationId = extractDataFromEmailMessage(originalEmailMessage, mapping.conversationId);
        mappedEmailMessage.dateTimeSent = new Date(extractDataFromEmailMessage(originalEmailMessage, mapping.dateTimeSent));
        mappedEmailMessage.dateTimeReceived = new Date(extractDataFromEmailMessage(originalEmailMessage, mapping.dateTimeReceived));
        mappedEmailMessage.importance = extractDataFromEmailMessage(originalEmailMessage, mapping.importance);
        mappedEmailMessage.folderId = extractDataFromEmailMessage(originalEmailMessage, mapping.folderId);
        //mappedEmailMessage.folderName = extractDataFromEmailMessage(originalEmailMessage, mapping.folderName);
        mappedEmailMessage.categories = extractDataFromEmailMessage(originalEmailMessage, mapping.categories);
        mappedEmailMessage.contentType = extractDataFromEmailMessage(originalEmailMessage, mapping.contentType);
        mappedEmailMessage.subject = extractDataFromEmailMessage(originalEmailMessage, mapping.subject);
        mappedEmailMessage.bodyPreview = extractDataFromEmailMessage(originalEmailMessage, mapping.bodyPreview);
        mappedEmailMessage.body = extractDataFromEmailMessage(originalEmailMessage, mapping.body);
        mappedEmailMessage.isDeliveryReceiptRequested = extractDataFromEmailMessage(originalEmailMessage, mapping.isDeliveryReceiptRequested);
        mappedEmailMessage.isReadReceiptRequested = extractDataFromEmailMessage(originalEmailMessage, mapping.isReadReceiptRequested);
        mappedEmailMessage.hasAttachments = extractDataFromEmailMessage(originalEmailMessage, mapping.hasAttachments);
        mappedEmailMessage.isDraft = extractDataFromEmailMessage(originalEmailMessage, mapping.isDraft);
        mappedEmailMessage.isRead = extractDataFromEmailMessage(originalEmailMessage, mapping.isRead);

        mappedEmailMessage.fromAddress = extractDataFromEmailMessage(originalEmailMessage, mapping.fromAddress);
        mappedEmailMessage.fromName = extractDataFromEmailMessage(originalEmailMessage, mapping.fromName);

        //get arrays
        var j = 0;

        //to
        mappedEmailMessage.toRecipients = [];
        for (j = 0; j < originalEmailMessage[mapping.toRecipients].length; j++) {
          mappedEmailMessage.toRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[mapping.toRecipients][j], mapping.toRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[mapping.toRecipients][j], mapping.toRecipientName)
          });
        }

        //cc
        mappedEmailMessage.ccRecipients = [];
        for (j = 0; j < originalEmailMessage[mapping.ccRecipients].length; j++) {
          mappedEmailMessage.ccRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[mapping.ccRecipients][j], mapping.ccRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[mapping.ccRecipients][j], mapping.ccRecipientName)
          });
        }

        //bcc
        mappedEmailMessage.bccRecipients = [];
        for (j = 0; j < originalEmailMessage[mapping.bccRecipients].length; j++) {
          mappedEmailMessage.bccRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[mapping.bccRecipients][j], mapping.bccRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[mapping.bccRecipients][j], mapping.bccRecipientName)
          });
        }

        mappedUser.data.push(mappedEmailMessage);
      }
    }
    mappedData.push(mappedUser);
  }

  return mappedData;
};

var getEmailData = function getEmailData(apiVersion, emails, filterStartDate, filterEndDate, additionalFields, clientId, tenantId, certThumbprint, privateKey) {
  return getAccessToken(apiVersion, clientId, tenantId, certThumbprint, privateKey).then(function (accessToken) {
    var emailResults = [];
    var emailResultPromises = [];
    var emailIter = 0;
    for (emailIter = 0; emailIter < emails.length; emailIter++) {
      emailResults[emailIter] = { email: emails[emailIter], filterStartDate: filterStartDate, filterEndDate: filterEndDate };
      emailResultPromises.push(getUserEmails(apiVersion, emails[emailIter], filterStartDate, filterEndDate, additionalFields, emailResults[emailIter], accessToken));
    }

    return _Promise.all(emailResultPromises).then(function () {
      return emailResults;
    });
  });
};

Office365Adapter.prototype.getBatchData = function (emails, filterStartDate, filterEndDate, additionalFields) {
  var clientId = this._config.credentials.clientId;
  var tenantId = this._config.credentials.tenantId;
  var certThumbprint = this._config.credentials.certificateThumbprint;
  var privateKey = this._config.credentials.certificate;
  var apiVersion = this._config.options.apiVersion;

  var dataAdapterRunStats = {
    success: true,
    runDate: moment().utc().toDate(),
    filterStartDate: filterStartDate,
    filterEndDate: filterEndDate,
    emails: emails
  };

  return getEmailData(apiVersion, emails, filterStartDate, filterEndDate, additionalFields, clientId, tenantId, certThumbprint, privateKey).then(function (emailData) {
    return mapEmailData(emailData);
  }).then(function (mappedEmailData) {
    dataAdapterRunStats.results = mappedEmailData;
    return dataAdapterRunStats;
  })['catch'](function (err) {
    dataAdapterRunStats.success = false;
    dataAdapterRunStats.errorMessage = err;
    console.log('Office365 GetBatchData Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

Office365Adapter.prototype.runConnectionTest = function (connectionData) {
  var _this = this;
  _this._config = new Office365.Configuration(connectionData.credentials);
  var filterStartDate = moment().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = moment().utc().startOf('day').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, '').then(function (data) {
    if (data.success && data.results[0]) {
      //to see if it really worked, we need to pass in the first result
      return data.results[0];
    } else {
      return data;
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1QWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7QUFFYixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3BDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDM0MsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0MsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7OztBQVEvQixJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxnQkFBZ0IsR0FBRztBQUNsRSxhQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3hCLENBQUM7O0FBRUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQzs7Ozs7QUFLN0MsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFXO0FBQzNDLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0QsTUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BELFNBQU8sSUFBSSxDQUFDLFFBQVEsQ0FDakIsSUFBSSxFQUFFLENBQ04sSUFBSSxDQUFDLHNCQUF1QjtBQUMzQixRQUFJ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ZGFwdGVycy9vZmZpY2UzNjVBZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXVpZCA9IHJlcXVpcmUoJ25vZGUtdXVpZCcpO1xudmFyIGNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xudmFyIHJwID0gcmVxdWlyZSgncmVxdWVzdC1wcm9taXNlJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBCYXNlQWRhcHRlciA9IHJlcXVpcmUoJy4vYmFzZUFkYXB0ZXInKTtcbnZhciBPZmZpY2UzNjUgPSByZXF1aXJlKCcuL29mZmljZTM2NS1qcy5qcycpO1xudmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuXG4vKipcbiAqIE9mZmljZTM2NUFkYXB0ZXJcbiAqXG4gKiBAY2xhc3NcbiAqIEByZXR1cm4ge09mZmljZTM2NUFkYXB0ZXJ9XG4gKi9cbnZhciBPZmZpY2UzNjVBZGFwdGVyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBPZmZpY2UzNjVBZGFwdGVyKCkge1xuICBCYXNlQWRhcHRlci5jYWxsKHRoaXMpO1xufTtcblxudXRpbC5pbmhlcml0cyhPZmZpY2UzNjVBZGFwdGVyLCBCYXNlQWRhcHRlcik7XG5cbi8qKlxuICogQG92ZXJyaWRlXG4gKi9cbk9mZmljZTM2NUFkYXB0ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5fY29uZmlnID0gbmV3IE9mZmljZTM2NS5Db25maWd1cmF0aW9uKHRoaXMuY3JlZGVudGlhbHMpO1xuICB0aGlzLl9zZXJ2aWNlID0gbmV3IE9mZmljZTM2NS5TZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG4gIHJldHVybiB0aGlzLl9zZXJ2aWNlXG4gICAgLmluaXQoKVxuICAgIC50aGVuKGZ1bmN0aW9uKCAvKmNsaWVudCovICkge1xuICAgICAgdmFyIG1zZyA9ICdTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgT2ZmaWNlMzY1IGZvciBlbWFpbDogJXMnO1xuICAgICAgY29uc29sZS5sb2cobXNnLCBfdGhpcy5jcmVkZW50aWFscy5lbWFpbCk7XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEBvdmVycmlkZVxuICovXG5PZmZpY2UzNjVBZGFwdGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fY29uZmlnO1xuICBkZWxldGUgdGhpcy5fc2VydmljZTtcbn07XG5cbnZhciBnZXRVc2VyRW1haWxzID0gZnVuY3Rpb24oYXBpVmVyc2lvbiwgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgcmVzdWx0LCB0b2tlbiwgcGFnZVRvR2V0KSB7XG4gIHZhciByZWNvcmRzUGVyUGFnZSA9IDI1O1xuICB2YXIgbWF4UGFnZXMgPSAyMDtcbiAgcGFnZVRvR2V0ID0gcGFnZVRvR2V0IHx8IDE7XG4gIHZhciBza2lwID0gKChwYWdlVG9HZXQgLTEpICogcmVjb3Jkc1BlclBhZ2UpICsgMTtcbiAgdmFyIGVtYWlsUmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmk6ICdodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS9hcGkvdicgKyBhcGlWZXJzaW9uICsgJy91c2VycyhcXCcnICsgZW1haWwgKyAnXFwnKS9tZXNzYWdlcz8kdG9wPScgKyByZWNvcmRzUGVyUGFnZSArICcmJHNraXA9JyArIHNraXAgKyAnJiRmaWx0ZXI9SXNEcmFmdCBlcSBmYWxzZSBhbmQgRGF0ZVRpbWVTZW50IGdlICcgKyBmaWx0ZXJTdGFydERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApICsgJyBhbmQgRGF0ZVRpbWVTZW50IGx0ICcgKyBmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKSArICcmJHNlbGVjdD1JZCxDYXRlZ29yaWVzLERhdGVUaW1lQ3JlYXRlZCxTdWJqZWN0LEltcG9ydGFuY2UsSGFzQXR0YWNobWVudHMsUGFyZW50Rm9sZGVySWQsRnJvbSxTZW5kZXIsVG9SZWNpcGllbnRzLENjUmVjaXBpZW50cyxCY2NSZWNpcGllbnRzLFJlcGx5VG8sQ29udmVyc2F0aW9uSWQsRGF0ZVRpbWVSZWNlaXZlZCxEYXRlVGltZVNlbnQsSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQsSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCxJc1JlYWQnICsgYWRkaXRpb25hbEZpZWxkcyxcbiAgICBoZWFkZXJzIDoge1xuICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW4sXG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXG4gICAgfVxuICB9O1xuICByZXR1cm4gcnAoZW1haWxSZXF1ZXN0T3B0aW9ucylcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xuICAgIHJlc3VsdC5zdWNjZXNzID0gdHJ1ZTtcbiAgICB2YXIgcGFyc2VkQm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG5cbiAgICBpZiAocGFyc2VkQm9keSAmJiBwYWdlVG9HZXQgPT09IDEpIHtcbiAgICAgIHJlc3VsdC5kYXRhID0gcGFyc2VkQm9keTtcbiAgICB9IGVsc2UgaWYgKHBhcnNlZEJvZHkudmFsdWUgJiYgcGFnZVRvR2V0ID4gMSkge1xuICAgICAgcmVzdWx0LmRhdGEudmFsdWUgPSByZXN1bHQuZGF0YS52YWx1ZS5jb25jYXQocGFyc2VkQm9keS52YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFyc2VkQm9keS52YWx1ZS5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xuICAgICAgcmV0dXJuIGdldFVzZXJFbWFpbHMoYXBpVmVyc2lvbiwgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgcmVzdWx0LCB0b2tlbiwgcGFnZVRvR2V0ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIHJlc3VsdC5zdWNjZXNzID0gZmFsc2U7XG4gICAgaWYgKGVyci5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgdmFyIGVudGlyZU1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgIHZhciBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XG4gICAgICB2YXIgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gbWVzc2FnZURhdGEuZXJyb3IubWVzc2FnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LmVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn07XG5cbnZhciBnZXRBY2Nlc3NUb2tlbiA9IGZ1bmN0aW9uKGFwaVZlcnNpb24sIGNsaWVudElkLCB0ZW5hbnRJZCwgY2VydFRodW1icHJpbnQsIHByaXZhdGVLZXkpIHtcbiAgdmFyIHRva2VuUmVxdWVzdFVybCA9ICdodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vJyArIHRlbmFudElkICsgJy9vYXV0aDIvdG9rZW4/YXBpLXZlcnNpb249JyArIGFwaVZlcnNpb247XG5cbiAgdmFyIGp3dEhlYWRlciA9IHtcbiAgICAnYWxnJzogJ1JTMjU2JyxcbiAgICAneDV0JzogY2VydFRodW1icHJpbnRcbiAgfTtcblxuICB2YXIgand0UGF5bG9hZCA9IHtcbiAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICdleHAnOiAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApICsgMzYwMDAwLCAvLyBhZGQgWCBob3Vyc1xuICAgICdpc3MnOiBjbGllbnRJZCxcbiAgICAnanRpJzogdXVpZC52NCgpLFxuICAgICduYmYnOiAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApIC0gMzYwMDAwLCAvLyBhZGQgLVggaG91cnNcbiAgICAnc3ViJzogY2xpZW50SWRcbiAgfTtcblxuICB2YXIgZW5jb2RlZEp3dEhlYWRlciA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0SGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICB2YXIgZW5jb2RlZEp3dFBheWxvYWQgPSBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGp3dFBheWxvYWQpKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gIHZhciBzdHJpbmdUb1NpZ24gPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQ7XG5cbiAgLy9zaWduIGl0IVxuICB2YXIgc2lnbmVyID0gY3J5cHRvLmNyZWF0ZVNpZ24oJ1JTQS1TSEEyNTYnKTtcbiAgc2lnbmVyLnVwZGF0ZShzdHJpbmdUb1NpZ24pO1xuICB2YXIgZW5jb2RlZFNpZ25lZEp3dEluZm8gPSBzaWduZXIuc2lnbihwcml2YXRlS2V5LCAnYmFzZTY0Jyk7XG5cbiAgLy9kZWZpbmUgYXNzZXJ0aW9uXG4gIHZhciBjbGllbnRBc3NlcnRpb24gPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mbztcblxuICB2YXIgdG9rZW5SZXF1ZXN0Rm9ybURhdGEgPSB7XG4gICAgY2xpZW50X2lkOiBjbGllbnRJZCxcbiAgICBjbGllbnRfYXNzZXJ0aW9uX3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXInLFxuICAgIGdyYW50X3R5cGU6ICdjbGllbnRfY3JlZGVudGlhbHMnLFxuICAgIHJlc291cmNlOiAnaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vJyxcbiAgICBjbGllbnRfYXNzZXJ0aW9uOiBjbGllbnRBc3NlcnRpb25cbiAgfTtcblxuICB2YXIgdG9rZW5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBwb3J0OiA0NDMsXG4gICAgdXJpOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgZm9ybURhdGE6IHRva2VuUmVxdWVzdEZvcm1EYXRhLFxuICB9O1xuXG4gIHJldHVybiBycCh0b2tlblJlcXVlc3RPcHRpb25zKVxuICAudGhlbihmdW5jdGlvbihib2R5KSB7XG4gICAgdmFyIHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgaWYgKHRva2VuRGF0YSAmJiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuKSB7XG4gICAgICB2YXIgYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgcmV0dXJuIGFjY2Vzc1Rva2VuO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xuICAgIH1cbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIHZhciB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVycikpO1xuICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcbiAgICAgIHZhciBlbnRpcmVNZXNzYWdlID0gdG9rZW5EYXRhLm1lc3NhZ2U7XG4gICAgICB2YXIgbWVzc2FnZUpzb24gPSBlbnRpcmVNZXNzYWdlLnJlcGxhY2UodG9rZW5EYXRhLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpO1xuICAgICAgdmFyIG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlSnNvbi5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxcIicsICdnJyksJ1wiJykpO1xuICAgICAgLy9jb25zb2xlLmxvZygnLS0tLS0nKTtcbiAgICAgIC8vY29uc29sZS5sb2cobWVzc2FnZURhdGEpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1lc3NhZ2VEYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2UgPSBmdW5jdGlvbihlbWFpbE1lc3NhZ2UsIG1hcHBpbmcpIHtcbiAgaWYgKG1hcHBpbmcgPT09ICcnKSB7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKG1hcHBpbmcuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIHJldHVybiBlbWFpbE1lc3NhZ2VbbWFwcGluZ107XG4gIH0gZWxzZSB7XG4gICAgLy9kcmlsbCBpbnRvIG9iamVjdCB0byBncmFiIHRoZSB2YWx1ZSB3ZSBuZWVkXG4gICAgdmFyIG5lc3RlZFByb3BlcnR5QXJyYXkgPSBtYXBwaW5nLnNwbGl0KCcuJyk7XG4gICAgdmFyIHJldHVyblZhbCA9IGVtYWlsTWVzc2FnZVtuZXN0ZWRQcm9wZXJ0eUFycmF5WzBdXTtcbiAgICBpZiAocmV0dXJuVmFsKSB7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG5lc3RlZFByb3BlcnR5QXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmV0dXJuVmFsID0gcmV0dXJuVmFsW25lc3RlZFByb3BlcnR5QXJyYXlbaV1dO1xuICAgICAgICBpZiAoIXJldHVyblZhbCkge1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVyblZhbDtcbiAgfVxufTtcblxudmFyIG1hcEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xuICB2YXIgbWFwcGluZyA9IHtcbiAgICAnZW1haWxzJzogJ3ZhbHVlJyxcbiAgICAnbWVzc2FnZUlkJzogJ0lkJyxcbiAgICAnY29udmVyc2F0aW9uSWQnOiAnQ29udmVyc2F0aW9uSWQnLFxuICAgICdkYXRlVGltZVNlbnQnOiAnRGF0ZVRpbWVTZW50JyxcbiAgICAnZGF0ZVRpbWVSZWNlaXZlZCc6ICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgICAnaW1wb3J0YW5jZSc6ICdJbXBvcnRhbmNlJyxcbiAgICAnZm9sZGVySWQnOiAnUGFyZW50Rm9sZGVySWQnLFxuICAgICdmb2xkZXJOYW1lJzogJycsXG4gICAgJ2NhdGVnb3JpZXMnOiAnQ2F0ZWdvcmllcycsXG4gICAgJ2NvbnRlbnRUeXBlJzogJ0JvZHkuQ29udGVudFR5cGUnLFxuICAgICdzdWJqZWN0JzogJ1N1YmplY3QnLFxuICAgICdib2R5UHJldmlldyc6ICdCb2R5UHJldmlldycsXG4gICAgJ2JvZHknOiAnQm9keS5Db250ZW50JyxcbiAgICAnZnJvbUFkZHJlc3MnOiAnRnJvbS5FbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2Zyb21OYW1lJzogJ0Zyb20uRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICd0b1JlY2lwaWVudHMnOiAnVG9SZWNpcGllbnRzJyxcbiAgICAndG9SZWNpcGllbnRBZGRyZXNzJzogJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAndG9SZWNpcGllbnROYW1lJzogJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnY2NSZWNpcGllbnRzJzogJ0NjUmVjaXBpZW50cycsXG4gICAgJ2NjUmVjaXBpZW50QWRkcmVzcyc6ICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2NjUmVjaXBpZW50TmFtZSc6ICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2JjY1JlY2lwaWVudHMnOiAnQmNjUmVjaXBpZW50cycsXG4gICAgJ2JjY1JlY2lwaWVudEFkZHJlc3MnOiAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdiY2NSZWNpcGllbnROYW1lJzogJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnOiAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdpc1JlYWRSZWNlaXB0UmVxdWVzdGVkJzogJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdoYXNBdHRhY2htZW50cyc6ICdIYXNBdHRhY2htZW50cycsXG4gICAgJ2lzRHJhZnQnOiAnSXNEcmFmdCcsXG4gICAgJ2lzUmVhZCc6ICdJc1JlYWQnXG4gIH07XG5cbiAgdmFyIG1hcHBlZERhdGEgPSBbXTtcblxuICBmb3IgKHZhciB1c2VySXRlciA9IDA7IHVzZXJJdGVyIDwgZW1haWxEYXRhLmxlbmd0aDsgdXNlckl0ZXIrKykge1xuICAgIHZhciBtYXBwZWRVc2VyID0ge1xuICAgICAgZW1haWw6IGVtYWlsRGF0YVt1c2VySXRlcl0uZW1haWwsXG4gICAgICBmaWx0ZXJTdGFydERhdGU6IGVtYWlsRGF0YVt1c2VySXRlcl0uZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZTogZW1haWxEYXRhW3VzZXJJdGVyXS5maWx0ZXJFbmREYXRlLFxuICAgICAgZGF0YTogW10sXG4gICAgICBzdWNjZXNzOiBlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MsXG4gICAgICBlcnJvck1lc3NhZ2U6IGVtYWlsRGF0YVt1c2VySXRlcl0uZXJyb3JNZXNzYWdlXG4gICAgfTtcblxuICAgIGlmIChlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW1haWxEYXRhW3VzZXJJdGVyXS5kYXRhW21hcHBpbmcuZW1haWxzXS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb3JpZ2luYWxFbWFpbE1lc3NhZ2UgPSBlbWFpbERhdGFbdXNlckl0ZXJdLmRhdGFbbWFwcGluZy5lbWFpbHNdW2ldO1xuICAgICAgICB2YXIgbWFwcGVkRW1haWxNZXNzYWdlID0ge307XG5cbiAgICAgICAgLy9nZXQgdG9wLWxldmVsIHNjYWxhcnNcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLm1lc3NhZ2VJZCA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5tZXNzYWdlSWQpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY29udmVyc2F0aW9uSWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuY29udmVyc2F0aW9uSWQpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZGF0ZVRpbWVTZW50ID0gbmV3IERhdGUoZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmRhdGVUaW1lU2VudCkpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZGF0ZVRpbWVSZWNlaXZlZCA9IG5ldyBEYXRlKGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5kYXRlVGltZVJlY2VpdmVkKSk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pbXBvcnRhbmNlID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmltcG9ydGFuY2UpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVySWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuZm9sZGVySWQpO1xuICAgICAgICAvL21hcHBlZEVtYWlsTWVzc2FnZS5mb2xkZXJOYW1lID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmZvbGRlck5hbWUpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY2F0ZWdvcmllcyA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5jYXRlZ29yaWVzKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNvbnRlbnRUeXBlID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmNvbnRlbnRUeXBlKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLnN1YmplY3QgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuc3ViamVjdCk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5ib2R5UHJldmlldyA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5ib2R5UHJldmlldyk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5ib2R5ID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmJvZHkpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5pc1JlYWRSZWNlaXB0UmVxdWVzdGVkKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmhhc0F0dGFjaG1lbnRzID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmhhc0F0dGFjaG1lbnRzKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzRHJhZnQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuaXNEcmFmdCk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc1JlYWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuaXNSZWFkKTtcblxuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZnJvbUFkZHJlc3MgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuZnJvbUFkZHJlc3MpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuZnJvbU5hbWUgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuZnJvbU5hbWUpO1xuXG4gICAgICAgIC8vZ2V0IGFycmF5c1xuICAgICAgICB2YXIgaiA9IDA7XG5cbiAgICAgICAgLy90b1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UudG9SZWNpcGllbnRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLnRvUmVjaXBpZW50c10ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UudG9SZWNpcGllbnRzLnB1c2goe1xuICAgICAgICAgICAgYWRkcmVzczogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcudG9SZWNpcGllbnRzXVtqXSwgbWFwcGluZy50b1JlY2lwaWVudEFkZHJlc3MpLFxuICAgICAgICAgICAgbmFtZTogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcudG9SZWNpcGllbnRzXVtqXSwgbWFwcGluZy50b1JlY2lwaWVudE5hbWUpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NjXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5jY1JlY2lwaWVudHMgPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcuY2NSZWNpcGllbnRzXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5jY1JlY2lwaWVudHMucHVzaCh7XG4gICAgICAgICAgICBhZGRyZXNzOiBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy5jY1JlY2lwaWVudHNdW2pdLCBtYXBwaW5nLmNjUmVjaXBpZW50QWRkcmVzcyksXG4gICAgICAgICAgICBuYW1lOiBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy5jY1JlY2lwaWVudHNdW2pdLCBtYXBwaW5nLmNjUmVjaXBpZW50TmFtZSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vYmNjXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLmJjY1JlY2lwaWVudHNdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmJjY1JlY2lwaWVudHMucHVzaCh7XG4gICAgICAgICAgICBhZGRyZXNzOiBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy5iY2NSZWNpcGllbnRzXVtqXSwgbWFwcGluZy5iY2NSZWNpcGllbnRBZGRyZXNzKSxcbiAgICAgICAgICAgIG5hbWU6IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLmJjY1JlY2lwaWVudHNdW2pdLCBtYXBwaW5nLmJjY1JlY2lwaWVudE5hbWUpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXBwZWRVc2VyLmRhdGEucHVzaChtYXBwZWRFbWFpbE1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBtYXBwZWREYXRhLnB1c2gobWFwcGVkVXNlcik7XG4gIH1cblxuICByZXR1cm4gbWFwcGVkRGF0YTtcbn07XG5cbnZhciBnZXRFbWFpbERhdGEgPSBmdW5jdGlvbihhcGlWZXJzaW9uLCBlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgY2xpZW50SWQsIHRlbmFudElkLCBjZXJ0VGh1bWJwcmludCwgcHJpdmF0ZUtleSkge1xuICByZXR1cm4gZ2V0QWNjZXNzVG9rZW4oYXBpVmVyc2lvbiwgY2xpZW50SWQsIHRlbmFudElkLCBjZXJ0VGh1bWJwcmludCwgcHJpdmF0ZUtleSlcbiAgLnRoZW4oZnVuY3Rpb24oYWNjZXNzVG9rZW4pIHtcbiAgICB2YXIgZW1haWxSZXN1bHRzID0gW107XG4gICAgdmFyIGVtYWlsUmVzdWx0UHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgZW1haWxJdGVyID0gMDtcbiAgICBmb3IgKGVtYWlsSXRlciA9IDA7IGVtYWlsSXRlciA8IGVtYWlscy5sZW5ndGg7IGVtYWlsSXRlcisrKSB7XG4gICAgICBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSA9IHtlbWFpbDogZW1haWxzW2VtYWlsSXRlcl0sIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlOiBmaWx0ZXJFbmREYXRlfTtcbiAgICAgIGVtYWlsUmVzdWx0UHJvbWlzZXMucHVzaChnZXRVc2VyRW1haWxzKGFwaVZlcnNpb24sIGVtYWlsc1tlbWFpbEl0ZXJdLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGVtYWlsUmVzdWx0c1tlbWFpbEl0ZXJdLCBhY2Nlc3NUb2tlbikpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLmFsbChlbWFpbFJlc3VsdFByb21pc2VzKVxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGVtYWlsUmVzdWx0cztcbiAgICB9KTtcbiAgfSk7XG59O1xuXG5PZmZpY2UzNjVBZGFwdGVyLnByb3RvdHlwZS5nZXRCYXRjaERhdGEgPSBmdW5jdGlvbihlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuICB2YXIgY2xpZW50SWQgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuY2xpZW50SWQ7XG4gIHZhciB0ZW5hbnRJZCA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy50ZW5hbnRJZDtcbiAgdmFyIGNlcnRUaHVtYnByaW50ID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmNlcnRpZmljYXRlVGh1bWJwcmludDtcbiAgdmFyIHByaXZhdGVLZXkgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuY2VydGlmaWNhdGU7XG4gIHZhciBhcGlWZXJzaW9uID0gdGhpcy5fY29uZmlnLm9wdGlvbnMuYXBpVmVyc2lvbjtcblxuICB2YXIgZGF0YUFkYXB0ZXJSdW5TdGF0cyA9IHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpLFxuICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxuICAgIGZpbHRlckVuZERhdGU6IGZpbHRlckVuZERhdGUsXG4gICAgZW1haWxzOiBlbWFpbHNcbiAgfTtcblxuICByZXR1cm4gZ2V0RW1haWxEYXRhKGFwaVZlcnNpb24sIGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBjbGllbnRJZCwgdGVuYW50SWQsIGNlcnRUaHVtYnByaW50LCBwcml2YXRlS2V5KVxuICAudGhlbihmdW5jdGlvbihlbWFpbERhdGEpIHtcbiAgICByZXR1cm4gbWFwRW1haWxEYXRhKGVtYWlsRGF0YSk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKG1hcHBlZEVtYWlsRGF0YSkge1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMucmVzdWx0cyA9IG1hcHBlZEVtYWlsRGF0YTtcbiAgICByZXR1cm4gZGF0YUFkYXB0ZXJSdW5TdGF0cztcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMuc3VjY2VzcyA9IGZhbHNlO1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMuZXJyb3JNZXNzYWdlID0gZXJyO1xuICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG4gICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XG4gIH0pO1xufTtcblxuT2ZmaWNlMzY1QWRhcHRlci5wcm90b3R5cGUucnVuQ29ubmVjdGlvblRlc3QgPSBmdW5jdGlvbihjb25uZWN0aW9uRGF0YSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBfdGhpcy5fY29uZmlnID0gbmV3IE9mZmljZTM2NS5Db25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcbiAgdmFyIGZpbHRlclN0YXJ0RGF0ZSA9IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKTtcbiAgdmFyIGZpbHRlckVuZERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS50b0RhdGUoKTtcbiAgcmV0dXJuIF90aGlzLmdldEJhdGNoRGF0YShbX3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbF0sIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgJycpXG4gIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5zdWNjZXNzICYmIGRhdGEucmVzdWx0c1swXSkge1xuICAgICAgLy90byBzZWUgaWYgaXQgcmVhbGx5IHdvcmtlZCwgd2UgbmVlZCB0byBwYXNzIGluIHRoZSBmaXJzdCByZXN1bHRcbiAgICAgIHJldHVybiBkYXRhLnJlc3VsdHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgfSk7XG59O1xuIl19
//# sourceMappingURL=../clAdapters/office365Adapter.js.map
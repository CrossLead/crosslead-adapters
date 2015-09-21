'use strict';

var uuid = require('node-uuid');
var crypto = require('crypto');
var rp = require('request-promise');
var util = require('util');
var BaseAdapter = require('../base/Adapter');
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
Office365Adapter.prototype.init = function() {
  var _this = this;
  this._config = new Office365.Configuration(this.credentials);
  this._service = new Office365.Service(this._config);
  return this._service
    .init()
    .then(function( /*client*/ ) {
      var msg = 'Successfully initialized Office365 for email: %s';
      console.log(msg, _this.credentials.email);
      return _this;
    });
};

/**
 * @override
 */
Office365Adapter.prototype.reset = function() {
  delete this._config;
  delete this._service;
};

var getUserEmails = function(apiVersion, email, filterStartDate, filterEndDate, additionalFields, result, token, pageToGet) {
  var recordsPerPage = 25;
  var maxPages = 20;
  pageToGet = pageToGet || 1;
  var skip = ((pageToGet -1) * recordsPerPage) + 1;
  var emailRequestOptions = {
    method: 'GET',
    uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/messages?$top=' + recordsPerPage + '&$skip=' + skip + '&$filter=IsDraft eq false and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + ' and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '&$select=Id,Categories,DateTimeCreated,Subject,Importance,HasAttachments,ParentFolderId,From,Sender,ToRecipients,CcRecipients,BccRecipients,ReplyTo,ConversationId,DateTimeReceived,DateTimeSent,IsDeliveryReceiptRequested,IsReadReceiptRequested,IsRead' + additionalFields,
    headers : {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };
  return rp(emailRequestOptions)
  .then(function(body) {
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

var getAccessToken = function(apiVersion, clientId, tenantId, certThumbprint, privateKey) {
  var tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=' + apiVersion;

  var jwtHeader = {
    'alg': 'RS256',
    'x5t': certThumbprint
  };

  var jwtPayload = {
    'aud': tokenRequestUrl,
    'exp': ((new Date()).getTime() / 1000) + 360000, // add X hours
    'iss': clientId,
    'jti': uuid.v4(),
    'nbf': ((new Date()).getTime() / 1000) - 360000, // add -X hours
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
    formData: tokenRequestFormData,
  };

  return rp(tokenRequestOptions)
  .then(function(body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      var accessToken = tokenData.access_token;
      return accessToken;
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

var extractDataFromEmailMessage = function(emailMessage, mapping) {
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

var mapEmailData = function(emailData) {
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

var getEmailData = function(apiVersion, emails, filterStartDate, filterEndDate, additionalFields, clientId, tenantId, certThumbprint, privateKey) {
  return getAccessToken(apiVersion, clientId, tenantId, certThumbprint, privateKey)
  .then(function(accessToken) {
    var emailResults = [];
    var emailResultPromises = [];
    var emailIter = 0;
    for (emailIter = 0; emailIter < emails.length; emailIter++) {
      emailResults[emailIter] = {email: emails[emailIter], filterStartDate: filterStartDate, filterEndDate: filterEndDate};
      emailResultPromises.push(getUserEmails(apiVersion, emails[emailIter], filterStartDate, filterEndDate, additionalFields, emailResults[emailIter], accessToken));
    }

    return Promise.all(emailResultPromises)
    .then(function() {
      return emailResults;
    });
  });
};

Office365Adapter.prototype.getBatchData = function(emails, filterStartDate, filterEndDate, additionalFields) {
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

  return getEmailData(apiVersion, emails, filterStartDate, filterEndDate, additionalFields, clientId, tenantId, certThumbprint, privateKey)
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
    console.log('Office365 GetBatchData Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

Office365Adapter.prototype.runConnectionTest = function(connectionData) {
  var _this = this;
  _this._config = new Office365.Configuration(connectionData.credentials);
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

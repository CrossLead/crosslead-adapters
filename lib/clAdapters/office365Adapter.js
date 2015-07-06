'use strict';

var Q = require('q');
var guid = require('guid');
var crypto = require('crypto');
var rp = require('request-promise');

var util = require('util'),
  BaseAdapter = require('./baseAdapter'),
  Office365 = require('./office365-js.js');

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

var getUserEmails = function(email, emailDate, additionalFields, result, token) {
  var emailRequestOptions = {
    method: 'GET',
    uri: 'https://outlook.office365.com/api/v1.0/users(\'' + email + '\')/messages?$filter=IsDraft eq false and DateTimeSent gt ' + emailDate.toISOString().substring(0, 10) + '&$select=Id,Categories,DateTimeCreated,Subject,Importance,HasAttachments,ParentFolderId,From,Sender,ToRecipients,CcRecipients,BccRecipients,ReplyTo,ConversationId,DateTimeReceived,DateTimeSent,IsDeliveryReceiptRequested,IsReadReceiptRequested,IsRead' + additionalFields,
    headers : {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };

  return rp(emailRequestOptions)
  .then(function(body) {
    result.success = true;
    result.data = JSON.parse(body);
    return true;
  })
  .catch(function(err) {
    result.success = false;
    result.errorMessage = JSON.stringify(err);
    return true;
  });
};

var getAccessToken = function(clientId, tenantId, certThumbprint, privateKey) {
  var tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=1.0';

  var jwtHeader = {
    'alg': 'RS256',
    'x5t': certThumbprint
  };

  var jwtPayload = {
    'aud': tokenRequestUrl,
    'exp': ((new Date()).getTime() / 1000) + 360000, // add X hours
    'iss': clientId,
    'jti': guid.create(),
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
    uri: 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=1.0',
    formData: tokenRequestFormData,
  };

  return rp(tokenRequestOptions)
  .then(function(body) {
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      var accessToken = tokenData.access_token;
      return accessToken;
    } else {
      return Q.reject('Could not get access token.');
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
      return Q.reject(messageData);
    } else {
      return Q.reject(err);
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
    for (var i = 1; i < nestedPropertyArray.length; i++) {
      returnVal = returnVal[nestedPropertyArray[i]];
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
    var mappedUser = {email: emailData[userIter].email, emailDate: emailData[userIter].emailDate, data: []};

    for (var i = 0; i < emailData[userIter].data[mapping.emails].length; i++) {
      var originalEmailMessage = emailData[userIter].data[mapping.emails][i];
      var mappedEmailMessage = {};

      //get top-level scalars
      mappedEmailMessage.messageId = extractDataFromEmailMessage(originalEmailMessage, mapping.messageId);
      mappedEmailMessage.conversationId = extractDataFromEmailMessage(originalEmailMessage, mapping.conversationId);
      mappedEmailMessage.dateTimeSent = extractDataFromEmailMessage(originalEmailMessage, mapping.dateTimeSent);
      mappedEmailMessage.dateTimeReceived = extractDataFromEmailMessage(originalEmailMessage, mapping.dateTimeReceived);
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
    mappedData.push(mappedUser);
  }

  return mappedData;
};

var getEmailData = function(emails, emailDate, additionalFields, clientId, tenantId, certThumbprint, privateKey) {
  return getAccessToken(clientId, tenantId, certThumbprint, privateKey)
  .then(function(accessToken) {
    var emailResults = [];
    var emailResultPromises = [];
    var emailIter = 0;
    for (emailIter = 0; emailIter < emails.length; emailIter++) {
      emailResults[emailIter] = {email: emails[emailIter], emailDate: emailDate};
      emailResultPromises.push(getUserEmails(emails[emailIter], emailDate, additionalFields, emailResults[emailIter], accessToken));
    }

    return Q.all(emailResultPromises)
    .then(function() {
      return emailResults;
    });
  });
};

Office365Adapter.prototype.getBatchData = function(emails, emailDate, additionalFields) {
  var clientId = this._config.credentials.clientId;
  var tenantId = this._config.credentials.tenantId;
  var certThumbprint = this._config.credentials.certificateThumbprint;
  var privateKey = this._config.credentials.certificate;

  var dataAdapterRunStats = {
    success: true,
    runDate: new Date(),
    emailDate: emailDate,
    emails: emails
  };

  return getEmailData(emails, emailDate, additionalFields, clientId, tenantId, certThumbprint, privateKey)
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
    console.log('Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

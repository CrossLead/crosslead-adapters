'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base = require('../base/');

var Office365CalendarAdapter = (function (_Adapter) {
  _inherits(Office365CalendarAdapter, _Adapter);

  function Office365CalendarAdapter() {
    _classCallCheck(this, Office365CalendarAdapter);

    _get(Object.getPrototypeOf(Office365CalendarAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365CalendarAdapter, [{
    key: 'init',
    value: function init() {
      var msg;
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _base.Configuration(this.credentials);
            this._service = new _base.Service(this._config);
            this._config.options.apiVersion = this._config.options.apiVersion || '1.0';
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(this._service.init());

          case 5:
            msg = 'Successfully initialized Office365 for email: %s';

            console.log(msg, this.credentials.email);
            return context$2$0.abrupt('return', this);

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }]);

  return Office365CalendarAdapter;
})(_base.Adapter);

exports['default'] = Office365CalendarAdapter;

var getUserEmails = function getUserEmails(apiVersion, email, filterStartDate, filterEndDate, additionalFields, result, token, pageToGet) {
  var recordsPerPage = 25;
  var maxPages = 20;
  pageToGet = pageToGet || 1;
  var skip = (pageToGet - 1) * recordsPerPage + 1;
  var emailRequestOptions = {
    method: 'GET',
    uri: 'https://outlook.office365.com/api/v1.0/users(\'' + email + '\')/messages?$top=' + recordsPerPage + '&$skip=' + skip + '&$filter=IsDraft eq false and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + ' and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '&$select=Id,Categories,DateTimeCreated,Subject,Importance,HasAttachments,ParentFolderId,From,Sender,ToRecipients,CcRecipients,BccRecipients,ReplyTo,ConversationId,DateTimeReceived,DateTimeSent,IsDeliveryReceiptRequested,IsReadReceiptRequested,IsRead' + additionalFields,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json;odata.metadata=none'
    }
  };

  console.log(emailRequestOptions);

  return (0, _requestPromise2['default'])(emailRequestOptions).then(function (body) {
    console.log('email request body: ', body);
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
    console.log('request error: ', err.name, err.stack || err);
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
    'jti': _nodeUuid2['default'].v4(),
    'nbf': new Date().getTime() / 1000 - 360000, // add -X hours
    'sub': clientId
  };

  var encodedJwtHeader = new Buffer(JSON.stringify(jwtHeader)).toString('base64');
  var encodedJwtPayload = new Buffer(JSON.stringify(jwtPayload)).toString('base64');
  var stringToSign = encodedJwtHeader + '.' + encodedJwtPayload;

  //sign it!
  var signer = _crypto2['default'].createSign('RSA-SHA256');
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

  return (0, _requestPromise2['default'])(tokenRequestOptions).then(function (body) {
    //console.log('token body:', body)
    var tokenData = JSON.parse(body);
    if (tokenData && tokenData.access_token) {
      var accessToken = tokenData.access_token;
      return accessToken;
    } else {
      return _Promise.reject('Could not get access token.');
    }
  })['catch'](function (err) {
    console.log('authentication error: ', err.stack || err);
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

Office365CalendarAdapter.prototype.getBatchData = function (emails, filterStartDate, filterEndDate, additionalFields) {
  var clientId = this._config.credentials.clientId;
  var tenantId = this._config.credentials.tenantId;
  var certThumbprint = this._config.credentials.certificateThumbprint;
  var privateKey = this._config.credentials.certificate;
  var apiVersion = this._config.options.apiVersion;

  var dataAdapterRunStats = {
    success: true,
    runDate: (0, _moment2['default'])().utc().toDate(),
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
    console.log(err.stack || err);
    dataAdapterRunStats.success = false;
    dataAdapterRunStats.errorMessage = err;
    console.log('Office365 GetBatchData Error: ' + JSON.stringify(err));
    return dataAdapterRunStats;
  });
};

Office365CalendarAdapter.prototype.runConnectionTest = function (connectionData) {
  var _this = this;
  _this._config = new _base.Configuration(connectionData.credentials);
  var filterStartDate = (0, _moment2['default'])().utc().startOf('day').add(-1, 'days').toDate();
  var filterEndDate = (0, _moment2['default'])().utc().startOf('day').toDate();
  return _this.getBatchData([_this._config.credentials.email], filterStartDate, filterEndDate, '').then(function (data) {
    if (data.success && data.results[0]) {
      //to see if it really worked, we need to pass in the first result
      return data.results[0];
    } else {
      return data;
    }
  });
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1LWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUErQixXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O29CQUlSLFVBQVU7O0lBRXBCLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQUVqQztVQUtKLEdBQUc7Ozs7QUFKUCxnQkFBSSxDQUFDLE9BQU8sR0FBRyx3QkFBa0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELGdCQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7OzZDQUNyRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTs7O0FBQ3RCLGVBQUcsR0FBRyxrREFBa0Q7O0FBQzVELG1CQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dEQUNsQyxJQUFJOzs7Ozs7O0tBQ1o7OztXQUVJLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7U0FoQmtCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0I7O0FBcUI3QyxJQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQVksVUFBVSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUs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Q0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEUsV0FBTyxtQkFBbUIsQ0FBQztHQUM1QixDQUFDLENBQUM7Q0FDSixDQUFDOztBQUVGLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxVQUFTLGNBQWMsRUFBRTtBQUM5RSxNQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSyxDQUFDLE9BQU8sR0FBRyx3QkFBa0IsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzlELE1BQUksZUFBZSxHQUFHLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM3RSxNQUFJLGFBQWEsR0FBRywwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzRCxTQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUMvRixJQUFJLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDbkIsUUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0FBRW5DLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4QixNQUFNO0FBQ0wsYUFBTyxJQUFJLENBQUM7S0FDYjtHQUNGLENBQUMsQ0FBQztDQUNKLENBQUMiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUtY2FsZW5kYXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXVpZCAgICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XG5pbXBvcnQgY3J5cHRvICAgICAgICAgICAgIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQgcnAgICAgICAgICAgICAgICAgIGZyb20gJ3JlcXVlc3QtcHJvbWlzZSc7XG5pbXBvcnQgbW9tZW50ICAgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5cbmltcG9ydCB7IEFkYXB0ZXIsXG4gICAgICAgICBDb25maWd1cmF0aW9uLFxuICAgICAgICAgU2VydmljZSB9ICAgICAgICBmcm9tICcuLi9iYXNlLyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9mZmljZTM2NUNhbGVuZGFyQWRhcHRlciBleHRlbmRzIEFkYXB0ZXIge1xuXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IENvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBTZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG4gICAgdGhpcy5fY29uZmlnLm9wdGlvbnMuYXBpVmVyc2lvbiA9IHRoaXMuX2NvbmZpZy5vcHRpb25zLmFwaVZlcnNpb24gfHwgJzEuMCc7XG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XG4gICAgdmFyIG1zZyA9ICdTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgT2ZmaWNlMzY1IGZvciBlbWFpbDogJXMnO1xuICAgIGNvbnNvbGUubG9nKG1zZywgdGhpcy5jcmVkZW50aWFscy5lbWFpbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBkZWxldGUgdGhpcy5fY29uZmlnO1xuICAgIGRlbGV0ZSB0aGlzLl9zZXJ2aWNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cblxuXG52YXIgZ2V0VXNlckVtYWlscyA9IGZ1bmN0aW9uKGFwaVZlcnNpb24sIGVtYWlsLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdCwgdG9rZW4sIHBhZ2VUb0dldCkge1xuICB2YXIgcmVjb3Jkc1BlclBhZ2UgPSAyNTtcbiAgdmFyIG1heFBhZ2VzID0gMjA7XG4gIHBhZ2VUb0dldCA9IHBhZ2VUb0dldCB8fCAxO1xuICB2YXIgc2tpcCA9ICgocGFnZVRvR2V0IC0xKSAqIHJlY29yZHNQZXJQYWdlKSArIDE7XG4gIHZhciBlbWFpbFJlcXVlc3RPcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJpOiAnaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vYXBpL3YxLjAvdXNlcnMoXFwnJyArIGVtYWlsICsgJ1xcJykvbWVzc2FnZXM/JHRvcD0nICsgcmVjb3Jkc1BlclBhZ2UgKyAnJiRza2lwPScgKyBza2lwICsgJyYkZmlsdGVyPUlzRHJhZnQgZXEgZmFsc2UgYW5kIERhdGVUaW1lU2VudCBnZSAnICsgZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKSArICcgYW5kIERhdGVUaW1lU2VudCBsdCAnICsgZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCkgKyAnJiRzZWxlY3Q9SWQsQ2F0ZWdvcmllcyxEYXRlVGltZUNyZWF0ZWQsU3ViamVjdCxJbXBvcnRhbmNlLEhhc0F0dGFjaG1lbnRzLFBhcmVudEZvbGRlcklkLEZyb20sU2VuZGVyLFRvUmVjaXBpZW50cyxDY1JlY2lwaWVudHMsQmNjUmVjaXBpZW50cyxSZXBseVRvLENvbnZlcnNhdGlvbklkLERhdGVUaW1lUmVjZWl2ZWQsRGF0ZVRpbWVTZW50LElzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkLElzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQsSXNSZWFkJyArIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgaGVhZGVycyA6IHtcbiAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuLFxuICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgIH1cbiAgfTtcblxuICBjb25zb2xlLmxvZyhlbWFpbFJlcXVlc3RPcHRpb25zKTtcblxuICByZXR1cm4gcnAoZW1haWxSZXF1ZXN0T3B0aW9ucylcbiAgLnRoZW4oZnVuY3Rpb24oYm9keSkge1xuICAgIGNvbnNvbGUubG9nKCdlbWFpbCByZXF1ZXN0IGJvZHk6ICcsIGJvZHkpO1xuICAgIHJlc3VsdC5zdWNjZXNzID0gdHJ1ZTtcbiAgICB2YXIgcGFyc2VkQm9keSA9IEpTT04ucGFyc2UoYm9keSk7XG5cbiAgICBpZiAocGFyc2VkQm9keSAmJiBwYWdlVG9HZXQgPT09IDEpIHtcbiAgICAgIHJlc3VsdC5kYXRhID0gcGFyc2VkQm9keTtcbiAgICB9IGVsc2UgaWYgKHBhcnNlZEJvZHkudmFsdWUgJiYgcGFnZVRvR2V0ID4gMSkge1xuICAgICAgcmVzdWx0LmRhdGEudmFsdWUgPSByZXN1bHQuZGF0YS52YWx1ZS5jb25jYXQocGFyc2VkQm9keS52YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFyc2VkQm9keS52YWx1ZS5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xuICAgICAgcmV0dXJuIGdldFVzZXJFbWFpbHMoYXBpVmVyc2lvbiwgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgcmVzdWx0LCB0b2tlbiwgcGFnZVRvR2V0ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUubG9nKCdyZXF1ZXN0IGVycm9yOiAnLCBlcnIubmFtZSwgZXJyLnN0YWNrIHx8IGVycik7XG4gICAgcmVzdWx0LnN1Y2Nlc3MgPSBmYWxzZTtcbiAgICBpZiAoZXJyLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICB2YXIgZW50aXJlTWVzc2FnZSA9IGVyci5tZXNzYWdlO1xuICAgICAgdmFyIG1lc3NhZ2VKc29uID0gZW50aXJlTWVzc2FnZS5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKTtcbiAgICAgIHZhciBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZUpzb24ucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXCInLCAnZycpLCdcIicpKTtcbiAgICAgIHJlc3VsdC5lcnJvck1lc3NhZ2UgPSBtZXNzYWdlRGF0YS5lcnJvci5tZXNzYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufTtcblxudmFyIGdldEFjY2Vzc1Rva2VuID0gZnVuY3Rpb24oYXBpVmVyc2lvbiwgY2xpZW50SWQsIHRlbmFudElkLCBjZXJ0VGh1bWJwcmludCwgcHJpdmF0ZUtleSkge1xuICB2YXIgdG9rZW5SZXF1ZXN0VXJsID0gJ2h0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS8nICsgdGVuYW50SWQgKyAnL29hdXRoMi90b2tlbj9hcGktdmVyc2lvbj0nICsgYXBpVmVyc2lvbjtcblxuICB2YXIgand0SGVhZGVyID0ge1xuICAgICdhbGcnOiAnUlMyNTYnLFxuICAgICd4NXQnOiBjZXJ0VGh1bWJwcmludFxuICB9O1xuXG4gIHZhciBqd3RQYXlsb2FkID0ge1xuICAgICdhdWQnOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgJ2V4cCc6ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMCkgKyAzNjAwMDAsIC8vIGFkZCBYIGhvdXJzXG4gICAgJ2lzcyc6IGNsaWVudElkLFxuICAgICdqdGknOiB1dWlkLnY0KCksXG4gICAgJ25iZic6ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMCkgLSAzNjAwMDAsIC8vIGFkZCAtWCBob3Vyc1xuICAgICdzdWInOiBjbGllbnRJZFxuICB9O1xuXG4gIHZhciBlbmNvZGVkSnd0SGVhZGVyID0gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShqd3RIZWFkZXIpKS50b1N0cmluZygnYmFzZTY0Jyk7XG4gIHZhciBlbmNvZGVkSnd0UGF5bG9hZCA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0UGF5bG9hZCkpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgdmFyIHN0cmluZ1RvU2lnbiA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZDtcblxuICAvL3NpZ24gaXQhXG4gIHZhciBzaWduZXIgPSBjcnlwdG8uY3JlYXRlU2lnbignUlNBLVNIQTI1NicpO1xuICBzaWduZXIudXBkYXRlKHN0cmluZ1RvU2lnbik7XG4gIHZhciBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IHNpZ25lci5zaWduKHByaXZhdGVLZXksICdiYXNlNjQnKTtcblxuICAvL2RlZmluZSBhc3NlcnRpb25cbiAgdmFyIGNsaWVudEFzc2VydGlvbiA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCArICcuJyArIGVuY29kZWRTaWduZWRKd3RJbmZvO1xuXG4gIHZhciB0b2tlblJlcXVlc3RGb3JtRGF0YSA9IHtcbiAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgIGNsaWVudF9hc3NlcnRpb25fdHlwZTogJ3VybjppZXRmOnBhcmFtczpvYXV0aDpjbGllbnQtYXNzZXJ0aW9uLXR5cGU6and0LWJlYXJlcicsXG4gICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXG4gICAgcmVzb3VyY2U6ICdodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS8nLFxuICAgIGNsaWVudF9hc3NlcnRpb246IGNsaWVudEFzc2VydGlvblxuICB9O1xuXG4gIHZhciB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHBvcnQ6IDQ0MyxcbiAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcbiAgICBmb3JtRGF0YTogdG9rZW5SZXF1ZXN0Rm9ybURhdGEsXG4gIH07XG5cbiAgcmV0dXJuIHJwKHRva2VuUmVxdWVzdE9wdGlvbnMpXG4gIC50aGVuKGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAvL2NvbnNvbGUubG9nKCd0b2tlbiBib2R5OicsIGJvZHkpXG4gICAgdmFyIHRva2VuRGF0YSA9IEpTT04ucGFyc2UoYm9keSk7XG4gICAgaWYgKHRva2VuRGF0YSAmJiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuKSB7XG4gICAgICB2YXIgYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgcmV0dXJuIGFjY2Vzc1Rva2VuO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xuICAgIH1cbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUubG9nKCdhdXRoZW50aWNhdGlvbiBlcnJvcjogJywgZXJyLnN0YWNrIHx8IGVycilcbiAgICB2YXIgdG9rZW5EYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgICBpZiAodG9rZW5EYXRhLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICB2YXIgZW50aXJlTWVzc2FnZSA9IHRva2VuRGF0YS5tZXNzYWdlO1xuICAgICAgdmFyIG1lc3NhZ2VKc29uID0gZW50aXJlTWVzc2FnZS5yZXBsYWNlKHRva2VuRGF0YS5zdGF0dXNDb2RlICsgJyAtICcsICcnKTtcbiAgICAgIHZhciBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZUpzb24ucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXCInLCAnZycpLCdcIicpKTtcbiAgICAgIC8vY29uc29sZS5sb2coJy0tLS0tJyk7XG4gICAgICAvL2NvbnNvbGUubG9nKG1lc3NhZ2VEYXRhKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtZXNzYWdlRGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlID0gZnVuY3Rpb24oZW1haWxNZXNzYWdlLCBtYXBwaW5nKSB7XG4gIGlmIChtYXBwaW5nID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfSBlbHNlIGlmIChtYXBwaW5nLmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gZW1haWxNZXNzYWdlW21hcHBpbmddO1xuICB9IGVsc2Uge1xuICAgIC8vZHJpbGwgaW50byBvYmplY3QgdG8gZ3JhYiB0aGUgdmFsdWUgd2UgbmVlZFxuICAgIHZhciBuZXN0ZWRQcm9wZXJ0eUFycmF5ID0gbWFwcGluZy5zcGxpdCgnLicpO1xuICAgIHZhciByZXR1cm5WYWwgPSBlbWFpbE1lc3NhZ2VbbmVzdGVkUHJvcGVydHlBcnJheVswXV07XG4gICAgaWYgKHJldHVyblZhbCkge1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBuZXN0ZWRQcm9wZXJ0eUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJldHVyblZhbCA9IHJldHVyblZhbFtuZXN0ZWRQcm9wZXJ0eUFycmF5W2ldXTtcbiAgICAgICAgaWYgKCFyZXR1cm5WYWwpIHtcbiAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWw7XG4gIH1cbn07XG5cbnZhciBtYXBFbWFpbERhdGEgPSBmdW5jdGlvbihlbWFpbERhdGEpIHtcbiAgdmFyIG1hcHBpbmcgPSB7XG4gICAgJ2VtYWlscyc6ICd2YWx1ZScsXG4gICAgJ21lc3NhZ2VJZCc6ICdJZCcsXG4gICAgJ2NvbnZlcnNhdGlvbklkJzogJ0NvbnZlcnNhdGlvbklkJyxcbiAgICAnZGF0ZVRpbWVTZW50JzogJ0RhdGVUaW1lU2VudCcsXG4gICAgJ2RhdGVUaW1lUmVjZWl2ZWQnOiAnRGF0ZVRpbWVSZWNlaXZlZCcsXG4gICAgJ2ltcG9ydGFuY2UnOiAnSW1wb3J0YW5jZScsXG4gICAgJ2ZvbGRlcklkJzogJ1BhcmVudEZvbGRlcklkJyxcbiAgICAnZm9sZGVyTmFtZSc6ICcnLFxuICAgICdjYXRlZ29yaWVzJzogJ0NhdGVnb3JpZXMnLFxuICAgICdjb250ZW50VHlwZSc6ICdCb2R5LkNvbnRlbnRUeXBlJyxcbiAgICAnc3ViamVjdCc6ICdTdWJqZWN0JyxcbiAgICAnYm9keVByZXZpZXcnOiAnQm9keVByZXZpZXcnLFxuICAgICdib2R5JzogJ0JvZHkuQ29udGVudCcsXG4gICAgJ2Zyb21BZGRyZXNzJzogJ0Zyb20uRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdmcm9tTmFtZSc6ICdGcm9tLkVtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAndG9SZWNpcGllbnRzJzogJ1RvUmVjaXBpZW50cycsXG4gICAgJ3RvUmVjaXBpZW50QWRkcmVzcyc6ICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ3RvUmVjaXBpZW50TmFtZSc6ICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2NjUmVjaXBpZW50cyc6ICdDY1JlY2lwaWVudHMnLFxuICAgICdjY1JlY2lwaWVudEFkZHJlc3MnOiAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAgICdjY1JlY2lwaWVudE5hbWUnOiAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdiY2NSZWNpcGllbnRzJzogJ0JjY1JlY2lwaWVudHMnLFxuICAgICdiY2NSZWNpcGllbnRBZGRyZXNzJzogJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYmNjUmVjaXBpZW50TmFtZSc6ICdFbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ2lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJzogJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCc6ICdJc1JlYWRSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnaGFzQXR0YWNobWVudHMnOiAnSGFzQXR0YWNobWVudHMnLFxuICAgICdpc0RyYWZ0JzogJ0lzRHJhZnQnLFxuICAgICdpc1JlYWQnOiAnSXNSZWFkJ1xuICB9O1xuXG4gIHZhciBtYXBwZWREYXRhID0gW107XG5cbiAgZm9yICh2YXIgdXNlckl0ZXIgPSAwOyB1c2VySXRlciA8IGVtYWlsRGF0YS5sZW5ndGg7IHVzZXJJdGVyKyspIHtcbiAgICB2YXIgbWFwcGVkVXNlciA9IHtcbiAgICAgIGVtYWlsOiBlbWFpbERhdGFbdXNlckl0ZXJdLmVtYWlsLFxuICAgICAgZmlsdGVyU3RhcnREYXRlOiBlbWFpbERhdGFbdXNlckl0ZXJdLmZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGU6IGVtYWlsRGF0YVt1c2VySXRlcl0uZmlsdGVyRW5kRGF0ZSxcbiAgICAgIGRhdGE6IFtdLFxuICAgICAgc3VjY2VzczogZW1haWxEYXRhW3VzZXJJdGVyXS5zdWNjZXNzLFxuICAgICAgZXJyb3JNZXNzYWdlOiBlbWFpbERhdGFbdXNlckl0ZXJdLmVycm9yTWVzc2FnZVxuICAgIH07XG5cbiAgICBpZiAoZW1haWxEYXRhW3VzZXJJdGVyXS5zdWNjZXNzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVtYWlsRGF0YVt1c2VySXRlcl0uZGF0YVttYXBwaW5nLmVtYWlsc10ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRW1haWxNZXNzYWdlID0gZW1haWxEYXRhW3VzZXJJdGVyXS5kYXRhW21hcHBpbmcuZW1haWxzXVtpXTtcbiAgICAgICAgdmFyIG1hcHBlZEVtYWlsTWVzc2FnZSA9IHt9O1xuXG4gICAgICAgIC8vZ2V0IHRvcC1sZXZlbCBzY2FsYXJzXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5tZXNzYWdlSWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcubWVzc2FnZUlkKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNvbnZlcnNhdGlvbklkID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmNvbnZlcnNhdGlvbklkKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmRhdGVUaW1lU2VudCA9IG5ldyBEYXRlKGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5kYXRlVGltZVNlbnQpKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmRhdGVUaW1lUmVjZWl2ZWQgPSBuZXcgRGF0ZShleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuZGF0ZVRpbWVSZWNlaXZlZCkpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaW1wb3J0YW5jZSA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5pbXBvcnRhbmNlKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZvbGRlcklkID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmZvbGRlcklkKTtcbiAgICAgICAgLy9tYXBwZWRFbWFpbE1lc3NhZ2UuZm9sZGVyTmFtZSA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5mb2xkZXJOYW1lKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNhdGVnb3JpZXMgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuY2F0ZWdvcmllcyk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5jb250ZW50VHlwZSA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5jb250ZW50VHlwZSk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5zdWJqZWN0ID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLnN1YmplY3QpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYm9keVByZXZpZXcgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuYm9keVByZXZpZXcpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYm9keSA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5ib2R5KTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmlzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmlzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIG1hcHBpbmcuaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5oYXNBdHRhY2htZW50cyA9IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZSwgbWFwcGluZy5oYXNBdHRhY2htZW50cyk7XG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5pc0RyYWZ0ID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmlzRHJhZnQpO1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuaXNSZWFkID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmlzUmVhZCk7XG5cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZyb21BZGRyZXNzID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmZyb21BZGRyZXNzKTtcbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmZyb21OYW1lID0gZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlLCBtYXBwaW5nLmZyb21OYW1lKTtcblxuICAgICAgICAvL2dldCBhcnJheXNcbiAgICAgICAgdmFyIGogPSAwO1xuXG4gICAgICAgIC8vdG9cbiAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLnRvUmVjaXBpZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgb3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy50b1JlY2lwaWVudHNdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLnRvUmVjaXBpZW50cy5wdXNoKHtcbiAgICAgICAgICAgIGFkZHJlc3M6IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLnRvUmVjaXBpZW50c11bal0sIG1hcHBpbmcudG9SZWNpcGllbnRBZGRyZXNzKSxcbiAgICAgICAgICAgIG5hbWU6IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLnRvUmVjaXBpZW50c11bal0sIG1hcHBpbmcudG9SZWNpcGllbnROYW1lKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jY1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY2NSZWNpcGllbnRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbEVtYWlsTWVzc2FnZVttYXBwaW5nLmNjUmVjaXBpZW50c10ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY2NSZWNpcGllbnRzLnB1c2goe1xuICAgICAgICAgICAgYWRkcmVzczogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcuY2NSZWNpcGllbnRzXVtqXSwgbWFwcGluZy5jY1JlY2lwaWVudEFkZHJlc3MpLFxuICAgICAgICAgICAgbmFtZTogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcuY2NSZWNpcGllbnRzXVtqXSwgbWFwcGluZy5jY1JlY2lwaWVudE5hbWUpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2JjY1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuYmNjUmVjaXBpZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgb3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy5iY2NSZWNpcGllbnRzXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzLnB1c2goe1xuICAgICAgICAgICAgYWRkcmVzczogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW21hcHBpbmcuYmNjUmVjaXBpZW50c11bal0sIG1hcHBpbmcuYmNjUmVjaXBpZW50QWRkcmVzcyksXG4gICAgICAgICAgICBuYW1lOiBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2VbbWFwcGluZy5iY2NSZWNpcGllbnRzXVtqXSwgbWFwcGluZy5iY2NSZWNpcGllbnROYW1lKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWFwcGVkVXNlci5kYXRhLnB1c2gobWFwcGVkRW1haWxNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWFwcGVkRGF0YS5wdXNoKG1hcHBlZFVzZXIpO1xuICB9XG5cbiAgcmV0dXJuIG1hcHBlZERhdGE7XG59O1xuXG52YXIgZ2V0RW1haWxEYXRhID0gZnVuY3Rpb24oYXBpVmVyc2lvbiwgZW1haWxzLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGNsaWVudElkLCB0ZW5hbnRJZCwgY2VydFRodW1icHJpbnQsIHByaXZhdGVLZXkpIHtcbiAgcmV0dXJuIGdldEFjY2Vzc1Rva2VuKGFwaVZlcnNpb24sIGNsaWVudElkLCB0ZW5hbnRJZCwgY2VydFRodW1icHJpbnQsIHByaXZhdGVLZXkpXG4gIC50aGVuKGZ1bmN0aW9uKGFjY2Vzc1Rva2VuKSB7XG4gICAgdmFyIGVtYWlsUmVzdWx0cyA9IFtdO1xuICAgIHZhciBlbWFpbFJlc3VsdFByb21pc2VzID0gW107XG4gICAgdmFyIGVtYWlsSXRlciA9IDA7XG4gICAgZm9yIChlbWFpbEl0ZXIgPSAwOyBlbWFpbEl0ZXIgPCBlbWFpbHMubGVuZ3RoOyBlbWFpbEl0ZXIrKykge1xuICAgICAgZW1haWxSZXN1bHRzW2VtYWlsSXRlcl0gPSB7ZW1haWw6IGVtYWlsc1tlbWFpbEl0ZXJdLCBmaWx0ZXJTdGFydERhdGU6IGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZTogZmlsdGVyRW5kRGF0ZX07XG4gICAgICBlbWFpbFJlc3VsdFByb21pc2VzLnB1c2goZ2V0VXNlckVtYWlscyhhcGlWZXJzaW9uLCBlbWFpbHNbZW1haWxJdGVyXSwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbFJlc3VsdHNbZW1haWxJdGVyXSwgYWNjZXNzVG9rZW4pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoZW1haWxSZXN1bHRQcm9taXNlcylcbiAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBlbWFpbFJlc3VsdHM7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuT2ZmaWNlMzY1Q2FsZW5kYXJBZGFwdGVyLnByb3RvdHlwZS5nZXRCYXRjaERhdGEgPSBmdW5jdGlvbihlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuICB2YXIgY2xpZW50SWQgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuY2xpZW50SWQ7XG4gIHZhciB0ZW5hbnRJZCA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscy50ZW5hbnRJZDtcbiAgdmFyIGNlcnRUaHVtYnByaW50ID0gdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmNlcnRpZmljYXRlVGh1bWJwcmludDtcbiAgdmFyIHByaXZhdGVLZXkgPSB0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuY2VydGlmaWNhdGU7XG4gIHZhciBhcGlWZXJzaW9uID0gdGhpcy5fY29uZmlnLm9wdGlvbnMuYXBpVmVyc2lvbjtcblxuICB2YXIgZGF0YUFkYXB0ZXJSdW5TdGF0cyA9IHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpLFxuICAgIGZpbHRlclN0YXJ0RGF0ZTogZmlsdGVyU3RhcnREYXRlLFxuICAgIGZpbHRlckVuZERhdGU6IGZpbHRlckVuZERhdGUsXG4gICAgZW1haWxzOiBlbWFpbHNcbiAgfTtcblxuICByZXR1cm4gZ2V0RW1haWxEYXRhKGFwaVZlcnNpb24sIGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBjbGllbnRJZCwgdGVuYW50SWQsIGNlcnRUaHVtYnByaW50LCBwcml2YXRlS2V5KVxuICAudGhlbihmdW5jdGlvbihlbWFpbERhdGEpIHtcbiAgICByZXR1cm4gbWFwRW1haWxEYXRhKGVtYWlsRGF0YSk7XG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKG1hcHBlZEVtYWlsRGF0YSkge1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMucmVzdWx0cyA9IG1hcHBlZEVtYWlsRGF0YTtcbiAgICByZXR1cm4gZGF0YUFkYXB0ZXJSdW5TdGF0cztcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUubG9nKGVyci5zdGFjayB8fCBlcnIpO1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMuc3VjY2VzcyA9IGZhbHNlO1xuICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMuZXJyb3JNZXNzYWdlID0gZXJyO1xuICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG4gICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XG4gIH0pO1xufTtcblxuT2ZmaWNlMzY1Q2FsZW5kYXJBZGFwdGVyLnByb3RvdHlwZS5ydW5Db25uZWN0aW9uVGVzdCA9IGZ1bmN0aW9uKGNvbm5lY3Rpb25EYXRhKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIF90aGlzLl9jb25maWcgPSBuZXcgQ29uZmlndXJhdGlvbihjb25uZWN0aW9uRGF0YS5jcmVkZW50aWFscyk7XG4gIHZhciBmaWx0ZXJTdGFydERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCk7XG4gIHZhciBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykudG9EYXRlKCk7XG4gIHJldHVybiBfdGhpcy5nZXRCYXRjaERhdGEoW190aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWxdLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsICcnKVxuICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0pIHtcbiAgICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgICByZXR1cm4gZGF0YS5yZXN1bHRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH0pO1xufTtcbiJdfQ==
//# sourceMappingURL=../../clAdapters/office365-calendar/index.js.map
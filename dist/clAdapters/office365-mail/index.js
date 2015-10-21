'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _base = require('../base/');

var today = function today() {
  return (0, _moment2['default'])().utc().startOf('day');
};

// collect these fields always...
var baseFields = ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'];

// convert the names of the api response data
var emailFieldNameMap = {
  // Desired...                 // Given...
  'emails': 'value',
  'messageId': 'Id',
  'conversationId': 'ConversationId',
  'dateTimeSent': 'DateTimeSent',
  'dateTimeReceived': 'DateTimeReceived',
  'importance': 'Importance',
  'folderId': 'ParentFolderId',
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

/**
 * Office365Adapter
 *
 * @class
 * @return {Office365Adapter}
 */

var Office365Adapter = (function (_Adapter) {
  _inherits(Office365Adapter, _Adapter);

  function Office365Adapter() {
    _classCallCheck(this, Office365Adapter);

    _get(Object.getPrototypeOf(Office365Adapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365Adapter, [{
    key: 'init',
    value: function init() {
      var msg;
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:

            this._config = new _base.Configuration(this.credentials, { apiVersion: '1.0' });
            this._service = new _base.Service(this._config);
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this._service.init());

          case 4:
            msg = 'Successfully initialized Office365 for email: %s';

            console.log(msg, this.credentials.email);
            return context$2$0.abrupt('return', this);

          case 7:
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
  }, {
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
      var dataAdapterRunStats;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            dataAdapterRunStats = {
              emails: emails,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 1;
            context$2$0.t0 = {};
            context$2$0.t1 = dataAdapterRunStats;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.getEmailData(emails, filterStartDate, filterEndDate, additionalFields));

          case 6:
            context$2$0.t2 = context$2$0.sent;
            context$2$0.t3 = mapEmailData(context$2$0.t2);
            context$2$0.t4 = {
              success: true,
              results: context$2$0.t3
            };
            return context$2$0.abrupt('return', _extends(context$2$0.t0, context$2$0.t1, context$2$0.t4));

          case 12:
            context$2$0.prev = 12;
            context$2$0.t5 = context$2$0['catch'](1);

            console.log(context$2$0.t5.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t5));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t5 }));

          case 17:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[1, 12]]);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest(connectionData) {
      var filterStartDate, filterEndDate, data;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _base.Configuration(connectionData.credentials);

            filterStartDate = today().add(-1, 'days').toDate();
            filterEndDate = today().toDate();
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(this.getBatchData([this._config.credentials.email], filterStartDate, filterEndDate, ''));

          case 5:
            data = context$2$0.sent;
            return context$2$0.abrupt('return', data.success && data.results[0] ? data.results[0] : data);

          case 7:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encodedJwtHeader, encodedJwtPayload, stringToSign, signer, encodedSignedJwtInfo, clientAssertion, tokenRequestFormData, tokenRequestOptions, tokenData, _tokenData, entireMessage, messageJson, messageData;

      return _regeneratorRuntime.async(function getAccessToken$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this.accessToken && this.accessTokenExpires > new Date())) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken);

          case 2:
            _config = this._config;
            _config$credentials = _config.credentials;
            clientId = _config$credentials.clientId;
            tenantId = _config$credentials.tenantId;
            certificate = _config$credentials.certificate;
            certificateThumbprint = _config$credentials.certificateThumbprint;
            apiVersion = _config.options.apiVersion;
            tokenRequestUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token?api-version=' + apiVersion;
            jwtHeader = {
              'alg': 'RS256',
              'x5t': certificateThumbprint
            };
            accessTokenExpires = (new Date().getTime() + 360000) / 1000;

            // grab new access token 10 seconds before expiration
            this.accessTokenExpires = new Date(accessTokenExpires * 1000 - 10000);

            jwtPayload = {
              'aud': tokenRequestUrl,
              'exp': accessTokenExpires,
              'iss': clientId,
              'jti': _nodeUuid2['default'].v4(),
              'nbf': accessTokenExpires - 2 * 3600, // one hour before now
              'sub': clientId
            };
            encodedJwtHeader = new Buffer(JSON.stringify(jwtHeader)).toString('base64');
            encodedJwtPayload = new Buffer(JSON.stringify(jwtPayload)).toString('base64');
            stringToSign = encodedJwtHeader + '.' + encodedJwtPayload;
            signer = _crypto2['default'].createSign('RSA-SHA256');

            signer.update(stringToSign);
            encodedSignedJwtInfo = signer.sign(certificate, 'base64');
            clientAssertion = encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo;
            tokenRequestFormData = {
              client_id: clientId,
              client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
              grant_type: 'client_credentials',
              resource: 'https://outlook.office365.com/',
              client_assertion: clientAssertion
            };
            tokenRequestOptions = {
              method: 'POST',
              port: 443,
              uri: tokenRequestUrl,
              formData: tokenRequestFormData
            };
            context$2$0.prev = 23;
            context$2$0.t0 = JSON;
            context$2$0.next = 27;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(tokenRequestOptions));

          case 27:
            context$2$0.t1 = context$2$0.sent;
            tokenData = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (!(tokenData && tokenData.access_token)) {
              context$2$0.next = 33;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken = tokenData.access_token);

          case 33:
            throw new Error('Could not get access token.');

          case 34:
            context$2$0.next = 47;
            break;

          case 36:
            context$2$0.prev = 36;
            context$2$0.t2 = context$2$0['catch'](23);
            _tokenData = JSON.parse(JSON.stringify(context$2$0.t2));

            if (!(_tokenData.name === 'StatusCodeError')) {
              context$2$0.next = 46;
              break;
            }

            entireMessage = _tokenData.message;
            messageJson = entireMessage.replace(_tokenData.statusCode + ' - ', '');
            messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
            throw new Error(messageData);

          case 46:
            throw new Error(context$2$0.t2);

          case 47:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[23, 36]]);
    }
  }, {
    key: 'getEmailData',
    value: function getEmailData(emails, filterStartDate, filterEndDate, additionalFields) {
      return _regeneratorRuntime.async(function getEmailData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function (email) {
              return _this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields);
            })));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getEmailsForUser',
    value: function getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData) {
      var pageToGet = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
      var accessToken, apiVersion, recordsPerPage, maxPages, skip, params, urlParams, emailRequestOptions, parsedBody, entireMessage, messageJson, messageData;
      return _regeneratorRuntime.async(function getEmailsForUser$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            // accumulation of data
            emailData = emailData || { email: email, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.getAccessToken());

          case 3:
            accessToken = context$2$0.sent;
            apiVersion = this._config.options.apiVersion;
            recordsPerPage = 25;
            maxPages = 20;
            skip = (pageToGet - 1) * recordsPerPage + 1;
            params = {
              $top: recordsPerPage,
              $skip: skip,
              $select: baseFields.join(',') + additionalFields,
              $filter: ('\n              IsDraft eq false\n                and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n            ').replace(/\s+/g, ' ').trim()
            };
            urlParams = (0, _lodash2['default'])(params).map(function (value, key) {
              return key + '=' + value;
            }).join('&');
            emailRequestOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/messages?' + urlParams,
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.prev = 11;

            emailData.success = true;
            context$2$0.t0 = JSON;
            context$2$0.next = 16;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(emailRequestOptions));

          case 16:
            context$2$0.t1 = context$2$0.sent;
            parsedBody = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (parsedBody && pageToGet === 1) {
              emailData.data = parsedBody;
            } else if (parsedBody.value && pageToGet > 1) {
              emailData.data.value = emailData.data.value.concat(parsedBody.value);
            }

            if (!(parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 23;
              break;
            }

            return context$2$0.abrupt('return', this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields, emailData, pageToGet + 1));

          case 23:
            return context$2$0.abrupt('return', emailData);

          case 24:
            context$2$0.next = 31;
            break;

          case 26:
            context$2$0.prev = 26;
            context$2$0.t2 = context$2$0['catch'](11);

            emailData.success = false;
            if (context$2$0.t2.name === 'StatusCodeError') {
              entireMessage = context$2$0.t2.message, messageJson = entireMessage.replace(context$2$0.t2.statusCode + ' - ', ''), messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));

              emailData.errorMessage = messageData.error.message;
            } else {
              emailData.errorMessage = JSON.stringify(context$2$0.t2);
            }
            return context$2$0.abrupt('return', true);

          case 31:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[11, 26]]);
    }
  }]);

  return Office365Adapter;
})(_base.Adapter);

exports['default'] = Office365Adapter;

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
      var _loop = function () {

        var originalEmailMessage = emailData[userIter].data[emailFieldNameMap.emails][i],
            mappedEmailMessage = {};

        // change to desired names
        (0, _lodash2['default'])(emailFieldNameMap).omit(['emails']).each(function (have, want) {
          var mapped = extractDataFromEmailMessage(originalEmailMessage, have);
          mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
        });

        //get arrays
        j = 0;

        //to
        mappedEmailMessage.toRecipients = [];
        for (j = 0; j < originalEmailMessage[emailFieldNameMap.toRecipients].length; j++) {
          mappedEmailMessage.toRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.toRecipients][j], emailFieldNameMap.toRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.toRecipients][j], emailFieldNameMap.toRecipientName)
          });
        }

        //cc
        mappedEmailMessage.ccRecipients = [];
        for (j = 0; j < originalEmailMessage[emailFieldNameMap.ccRecipients].length; j++) {
          mappedEmailMessage.ccRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.ccRecipients][j], emailFieldNameMap.ccRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.ccRecipients][j], emailFieldNameMap.ccRecipientName)
          });
        }

        //bcc
        mappedEmailMessage.bccRecipients = [];
        for (j = 0; j < originalEmailMessage[emailFieldNameMap.bccRecipients].length; j++) {
          mappedEmailMessage.bccRecipients.push({
            address: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.bccRecipients][j], emailFieldNameMap.bccRecipientAddress),
            name: extractDataFromEmailMessage(originalEmailMessage[emailFieldNameMap.bccRecipients][j], emailFieldNameMap.bccRecipientName)
          });
        }

        mappedUser.data.push(mappedEmailMessage);
      };

      for (var i = 0; i < emailData[userIter].data[emailFieldNameMap.emails].length; i++) {
        var j;

        _loop();
      }
    }
    mappedData.push(mappedUser);
  }

  return mappedData;
};
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour

//sign it!

//define assertion

//console.log('-----');
//console.log(messageData);

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1LW1haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBeUIsV0FBVzs7OztzQkFDWCxRQUFROzs7OzhCQUNSLGlCQUFpQjs7OztzQkFDakIsUUFBUTs7OztzQkFDUixRQUFROzs7O29CQUlKLFVBQVU7O0FBRXZDLElBQU0sS0FBSyxHQUFHLFNBQVIsS0FBSztTQUFTLDBCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztDQUFBLENBQUM7OztBQUdsRCxJQUFNLFVBQVUsR0FBRyxDQUNqQixJQUFJLEVBQ0osWUFBWSxFQUNaLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsTUFBTSxFQUNOLFFBQVEsRUFDUixjQUFjLEVBQ2QsY0FBYyxFQUNkLGVBQWUsRUFDZixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQixjQUFjLEVBQ2QsNEJBQTRCLEVBQzVCLHdCQUF3QixFQUN4QixRQUFRLENBQ1QsQ0FBQzs7O0FBR0YsSUFBTSxpQkFBaUIsR0FBRzs7QUFFeEIsVUFBUSxFQUFzQixPQUFPO0FBQ3JDLGFBQVcsRUFBbUIsSUFBSTtBQUNsQyxrQkFBZ0IsRUFBYyxnQkFBZ0I7QUFDOUMsZ0JBQWMsRUFBZ0IsY0FBYztBQUM1QyxvQkFBa0IsRUFBWSxrQkFBa0I7QUFDaEQsY0FBWSxFQUFrQixZQUFZO0FBQzFDLFlBQVUsRUFBb0IsZ0JBQWdCO0FBQzlDLGNBQVksRUFBa0IsWUFBWTtBQUMxQyxlQUFhLEVBQWlCLGtCQUFrQjtBQUNoRCxXQUFTLEVBQXFCLFNBQVM7QUFDdkMsZUFBYSxFQUFpQixhQUFhO0FBQzNDLFFBQU0sRUFBd0IsY0FBYztBQUM1QyxlQUFhLEVBQWlCLDJCQUEyQjtBQUN6RCxZQUFVLEVBQW9CLHdCQUF3QjtBQUN0RCxnQkFBYyxFQUFnQixjQUFj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Q0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQztBQUNySSxnQkFBSSxFQUFFLDJCQUEyQixDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDO1dBQ2hJLENBQUMsQ0FBQztTQUNKOztBQUVELGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzs7QUEzQzNDLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQWM5RSxDQUFDOzs7T0E4Qk47S0FDRjtBQUNELGNBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDN0I7O0FBRUQsU0FBTyxVQUFVLENBQUM7Q0FDbkIsQ0FBQyIsImZpbGUiOiJjbEFkYXB0ZXJzL29mZmljZTM2NS1tYWlsL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHV1aWQgICAgICAgICBmcm9tICdub2RlLXV1aWQnO1xuaW1wb3J0IGNyeXB0byAgICAgICBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHJwICAgICAgICAgICBmcm9tICdyZXF1ZXN0LXByb21pc2UnO1xuaW1wb3J0IG1vbWVudCAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IF8gICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuXG5pbXBvcnQgeyBBZGFwdGVyLFxuICAgICAgICAgQ29uZmlndXJhdGlvbixcbiAgICAgICAgIFNlcnZpY2UgfSAgICAgIGZyb20gJy4uL2Jhc2UvJztcblxuY29uc3QgdG9kYXkgPSAoKSA9PiBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKTtcblxuLy8gY29sbGVjdCB0aGVzZSBmaWVsZHMgYWx3YXlzLi4uXG5jb25zdCBiYXNlRmllbGRzID0gW1xuICAnSWQnLFxuICAnQ2F0ZWdvcmllcycsXG4gICdEYXRlVGltZUNyZWF0ZWQnLFxuICAnU3ViamVjdCcsXG4gICdJbXBvcnRhbmNlJyxcbiAgJ0hhc0F0dGFjaG1lbnRzJyxcbiAgJ1BhcmVudEZvbGRlcklkJyxcbiAgJ0Zyb20nLFxuICAnU2VuZGVyJyxcbiAgJ1RvUmVjaXBpZW50cycsXG4gICdDY1JlY2lwaWVudHMnLFxuICAnQmNjUmVjaXBpZW50cycsXG4gICdSZXBseVRvJyxcbiAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgJ0RhdGVUaW1lUmVjZWl2ZWQnLFxuICAnRGF0ZVRpbWVTZW50JyxcbiAgJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAnSXNSZWFkJ1xuXTtcblxuLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG5jb25zdCBlbWFpbEZpZWxkTmFtZU1hcCA9IHtcbiAgLy8gRGVzaXJlZC4uLiAgICAgICAgICAgICAgICAgLy8gR2l2ZW4uLi5cbiAgJ2VtYWlscyc6ICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJyxcbiAgJ21lc3NhZ2VJZCc6ICAgICAgICAgICAgICAgICAgJ0lkJyxcbiAgJ2NvbnZlcnNhdGlvbklkJzogICAgICAgICAgICAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgJ2RhdGVUaW1lU2VudCc6ICAgICAgICAgICAgICAgJ0RhdGVUaW1lU2VudCcsXG4gICdkYXRlVGltZVJlY2VpdmVkJzogICAgICAgICAgICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgJ2ltcG9ydGFuY2UnOiAgICAgICAgICAgICAgICAgJ0ltcG9ydGFuY2UnLFxuICAnZm9sZGVySWQnOiAgICAgICAgICAgICAgICAgICAnUGFyZW50Rm9sZGVySWQnLFxuICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICdjb250ZW50VHlwZSc6ICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnRUeXBlJyxcbiAgJ3N1YmplY3QnOiAgICAgICAgICAgICAgICAgICAgJ1N1YmplY3QnLFxuICAnYm9keVByZXZpZXcnOiAgICAgICAgICAgICAgICAnQm9keVByZXZpZXcnLFxuICAnYm9keSc6ICAgICAgICAgICAgICAgICAgICAgICAnQm9keS5Db250ZW50JyxcbiAgJ2Zyb21BZGRyZXNzJzogICAgICAgICAgICAgICAgJ0Zyb20uRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAnZnJvbU5hbWUnOiAgICAgICAgICAgICAgICAgICAnRnJvbS5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICd0b1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdUb1JlY2lwaWVudHMnLFxuICAndG9SZWNpcGllbnRBZGRyZXNzJzogICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAndG9SZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAnY2NSZWNpcGllbnRzJzogICAgICAgICAgICAgICAnQ2NSZWNpcGllbnRzJyxcbiAgJ2NjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgJ2NjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgJ2JjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgJ0JjY1JlY2lwaWVudHMnLFxuICAnYmNjUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAnRW1haWxBZGRyZXNzLkFkZHJlc3MnLFxuICAnYmNjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAnaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnOiAnSXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAnaXNSZWFkUmVjZWlwdFJlcXVlc3RlZCc6ICAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXG4gICdoYXNBdHRhY2htZW50cyc6ICAgICAgICAgICAgICdIYXNBdHRhY2htZW50cycsXG4gICdpc0RyYWZ0JzogICAgICAgICAgICAgICAgICAgICdJc0RyYWZ0JyxcbiAgJ2lzUmVhZCc6ICAgICAgICAgICAgICAgICAgICAgJ0lzUmVhZCdcbn07XG5cblxuLyoqXG4gKiBPZmZpY2UzNjVBZGFwdGVyXG4gKlxuICogQGNsYXNzXG4gKiBAcmV0dXJuIHtPZmZpY2UzNjVBZGFwdGVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVBZGFwdGVyIGV4dGVuZHMgQWRhcHRlciB7XG5cbiAgYXN5bmMgaW5pdCgpIHtcblxuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKHRoaXMuY3JlZGVudGlhbHMsIHsgYXBpVmVyc2lvbjogJzEuMCcgfSlcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IFNlcnZpY2UodGhpcy5fY29uZmlnKTtcbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcbiAgICBjb25zdCBtc2cgPSAnU3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkIE9mZmljZTM2NSBmb3IgZW1haWw6ICVzJztcbiAgICBjb25zb2xlLmxvZyhtc2csIHRoaXMuY3JlZGVudGlhbHMuZW1haWwpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFzeW5jIGdldEJhdGNoRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuXG4gICAgY29uc3QgZGF0YUFkYXB0ZXJSdW5TdGF0cyA9IHtcbiAgICAgIGVtYWlscyxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICByZXN1bHRzIDogbWFwRW1haWxEYXRhKGF3YWl0IHRoaXMuZ2V0RW1haWxEYXRhKFxuICAgICAgICAgIGVtYWlscyxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICBhZGRpdGlvbmFsRmllbGRzXG4gICAgICAgICkpXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yTWVzc2FnZSkge1xuICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlLnN0YWNrKTtcbiAgICAgIGNvbnNvbGUubG9nKCdPZmZpY2UzNjUgR2V0QmF0Y2hEYXRhIEVycm9yOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3JNZXNzYWdlKSk7XG4gICAgICByZXR1cm4geyAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLCBlcnJvck1lc3NhZ2UgfTtcbiAgICB9XG5cbiAgfVxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KGNvbm5lY3Rpb25EYXRhKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IENvbmZpZ3VyYXRpb24oY29ubmVjdGlvbkRhdGEuY3JlZGVudGlhbHMpO1xuXG4gICAgY29uc3QgZmlsdGVyU3RhcnREYXRlID0gdG9kYXkoKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCksXG4gICAgICAgICAgZmlsdGVyRW5kRGF0ZSAgID0gdG9kYXkoKS50b0RhdGUoKSxcbiAgICAgICAgICBkYXRhICAgICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEJhdGNoRGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgcmV0dXJuIGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0gPyBkYXRhLnJlc3VsdHNbMF06IGRhdGE7XG4gIH1cblxuICBhc3luYyBnZXRBY2Nlc3NUb2tlbigpIHtcblxuICAgIGlmICh0aGlzLmFjY2Vzc1Rva2VuICYmIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID4gbmV3IERhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgY3JlZGVudGlhbHMgOiB7XG4gICAgICAgIGNsaWVudElkLFxuICAgICAgICB0ZW5hbnRJZCxcbiAgICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnMgOiB7XG4gICAgICAgIGFwaVZlcnNpb25cbiAgICAgIH1cbiAgICB9ID0gdGhpcy5fY29uZmlnO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0VXJsID0gYGh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS8ke3RlbmFudElkfS9vYXV0aDIvdG9rZW4/YXBpLXZlcnNpb249JHthcGlWZXJzaW9ufWA7XG5cbiAgICBjb25zdCBqd3RIZWFkZXIgPSB7XG4gICAgICAnYWxnJzogJ1JTMjU2JyxcbiAgICAgICd4NXQnOiBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcbiAgICB9O1xuXG4gICAgLy8gZXhwaXJlIHRva2VuIGluIG9uZSBob3VyXG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAzNjAwMDApIC8gMTAwMDtcblxuICAgIC8vIGdyYWIgbmV3IGFjY2VzcyB0b2tlbiAxMCBzZWNvbmRzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPSBuZXcgRGF0ZShhY2Nlc3NUb2tlbkV4cGlyZXMqMTAwMCAtIDEwMDAwKTtcblxuICAgIGNvbnN0IGp3dFBheWxvYWQgPSB7XG4gICAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgJ2V4cCc6IGFjY2Vzc1Rva2VuRXhwaXJlcyxcbiAgICAgICdpc3MnOiBjbGllbnRJZCxcbiAgICAgICdqdGknOiB1dWlkLnY0KCksXG4gICAgICAnbmJmJzogYWNjZXNzVG9rZW5FeHBpcmVzIC0gMiozNjAwLCAvLyBvbmUgaG91ciBiZWZvcmUgbm93XG4gICAgICAnc3ViJzogY2xpZW50SWRcbiAgICB9O1xuXG4gICAgY29uc3QgZW5jb2RlZEp3dEhlYWRlciA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0SGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgIGNvbnN0IGVuY29kZWRKd3RQYXlsb2FkID0gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShqd3RQYXlsb2FkKSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgIGNvbnN0IHN0cmluZ1RvU2lnbiA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZDtcblxuICAgIC8vc2lnbiBpdCFcbiAgICBjb25zdCBzaWduZXIgPSBjcnlwdG8uY3JlYXRlU2lnbignUlNBLVNIQTI1NicpO1xuICAgIHNpZ25lci51cGRhdGUoc3RyaW5nVG9TaWduKTtcbiAgICBjb25zdCBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IHNpZ25lci5zaWduKGNlcnRpZmljYXRlLCAnYmFzZTY0Jyk7XG5cbiAgICAvL2RlZmluZSBhc3NlcnRpb25cbiAgICBjb25zdCBjbGllbnRBc3NlcnRpb24gPSBlbmNvZGVkSnd0SGVhZGVyICsgJy4nICsgZW5jb2RlZEp3dFBheWxvYWQgKyAnLicgKyBlbmNvZGVkU2lnbmVkSnd0SW5mbztcblxuICAgIGNvbnN0IHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xuICAgICAgY2xpZW50X2lkOiBjbGllbnRJZCxcbiAgICAgIGNsaWVudF9hc3NlcnRpb25fdHlwZTogJ3VybjppZXRmOnBhcmFtczpvYXV0aDpjbGllbnQtYXNzZXJ0aW9uLXR5cGU6and0LWJlYXJlcicsXG4gICAgICBncmFudF90eXBlOiAnY2xpZW50X2NyZWRlbnRpYWxzJyxcbiAgICAgIHJlc291cmNlOiAnaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vJyxcbiAgICAgIGNsaWVudF9hc3NlcnRpb246IGNsaWVudEFzc2VydGlvblxuICAgIH07XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBwb3J0OiA0NDMsXG4gICAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcbiAgICAgIGZvcm1EYXRhOiB0b2tlblJlcXVlc3RGb3JtRGF0YSxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHJwKHRva2VuUmVxdWVzdE9wdGlvbnMpKTtcbiAgICAgIGlmICh0b2tlbkRhdGEgJiYgdG9rZW5EYXRhLmFjY2Vzc190b2tlbikge1xuICAgICAgICByZXR1cm4gdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBnZXQgYWNjZXNzIHRva2VuLicpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgdG9rZW5EYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShlcnIpKTtcbiAgICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcbiAgICAgICAgY29uc3QgZW50aXJlTWVzc2FnZSA9IHRva2VuRGF0YS5tZXNzYWdlO1xuICAgICAgICBjb25zdCBtZXNzYWdlSnNvbiA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlSnNvbi5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFxcIicsICdnJyksJ1wiJykpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCctLS0tLScpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1lc3NhZ2VEYXRhKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2VEYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldEVtYWlsRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuICAgIHJldHVybiBhd2FpdCogZW1haWxzLm1hcChlbWFpbCA9PiB0aGlzLmdldEVtYWlsc0ZvclVzZXIoXG4gICAgICBlbWFpbCxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICBhZGRpdGlvbmFsRmllbGRzXG4gICAgKSk7XG4gIH1cblxuICBhc3luYyBnZXRFbWFpbHNGb3JVc2VyKGVtYWlsLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUsIGFkZGl0aW9uYWxGaWVsZHMsIGVtYWlsRGF0YSwgcGFnZVRvR2V0PTEpIHtcbiAgICAvLyBhY2N1bXVsYXRpb24gb2YgZGF0YVxuICAgIGVtYWlsRGF0YSA9IGVtYWlsRGF0YSB8fCB7IGVtYWlsLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUgfTtcblxuICAgIGNvbnN0IGFjY2Vzc1Rva2VuICAgICA9IGF3YWl0IHRoaXMuZ2V0QWNjZXNzVG9rZW4oKSxcbiAgICAgICAgICB7IGFwaVZlcnNpb24gfSAgPSB0aGlzLl9jb25maWcub3B0aW9ucyxcbiAgICAgICAgICByZWNvcmRzUGVyUGFnZSAgPSAyNSxcbiAgICAgICAgICBtYXhQYWdlcyAgICAgICAgPSAyMCxcbiAgICAgICAgICBza2lwICAgICAgICAgICAgPSAoKHBhZ2VUb0dldCAtMSkgKiByZWNvcmRzUGVyUGFnZSkgKyAxLFxuICAgICAgICAgIC8vIHBhcmFtZXRlcnMgdG8gcXVlcnkgZW1haWwgd2l0aC4uLlxuICAgICAgICAgIHBhcmFtcyAgICAgICAgICA9IHtcbiAgICAgICAgICAgICR0b3A6IHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6IHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiBiYXNlRmllbGRzLmpvaW4oJywnKSArIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAgICAgICAkZmlsdGVyOiBgXG4gICAgICAgICAgICAgIElzRHJhZnQgZXEgZmFsc2VcbiAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGdlICR7ZmlsdGVyU3RhcnREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cbiAgICAgICAgICAgICAgICBhbmQgRGF0ZVRpbWVTZW50IGx0ICR7ZmlsdGVyRW5kRGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgICAgICAgIC50cmltKClcbiAgICAgICAgICB9O1xuXG4gICAgLy8gZm9ybWF0IHBhcmFtZXRlcnMgZm9yIHVybFxuICAgIGNvbnN0IHVybFBhcmFtcyA9IF8ocGFyYW1zKVxuICAgICAgLm1hcCgodmFsdWUsIGtleSkgPT4gYCR7a2V5fT0ke3ZhbHVlfWApXG4gICAgICAuam9pbignJicpO1xuXG4gICAgY29uc3QgZW1haWxSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmk6IGBodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS9hcGkvdiR7YXBpVmVyc2lvbn0vdXNlcnMoJyR7ZW1haWx9JykvbWVzc2FnZXM/JHt1cmxQYXJhbXN9YCxcbiAgICAgIGhlYWRlcnMgOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthY2Nlc3NUb2tlbn1gLFxuICAgICAgICBBY2NlcHQ6ICAgICAgICAnYXBwbGljYXRpb24vanNvbjtvZGF0YS5tZXRhZGF0YT1ub25lJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgZW1haWxEYXRhLnN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgY29uc3QgcGFyc2VkQm9keSA9IEpTT04ucGFyc2UoYXdhaXQgcnAoZW1haWxSZXF1ZXN0T3B0aW9ucykpO1xuXG4gICAgICBpZiAocGFyc2VkQm9keSAmJiBwYWdlVG9HZXQgPT09IDEpIHtcbiAgICAgICAgZW1haWxEYXRhLmRhdGEgPSBwYXJzZWRCb2R5O1xuICAgICAgfSBlbHNlIGlmIChwYXJzZWRCb2R5LnZhbHVlICYmIHBhZ2VUb0dldCA+IDEpIHtcbiAgICAgICAgZW1haWxEYXRhLmRhdGEudmFsdWUgPSBlbWFpbERhdGEuZGF0YS52YWx1ZS5jb25jYXQocGFyc2VkQm9keS52YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJzZWRCb2R5ICYmIHBhcnNlZEJvZHkudmFsdWUubGVuZ3RoID09PSByZWNvcmRzUGVyUGFnZSAmJiBwYWdlVG9HZXQgPD0gbWF4UGFnZXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RW1haWxzRm9yVXNlcihlbWFpbCwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbERhdGEsIHBhZ2VUb0dldCArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVtYWlsRGF0YTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGVtYWlsRGF0YS5zdWNjZXNzID0gZmFsc2U7XG4gICAgICBpZiAoZXJyLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IGVudGlyZU1lc3NhZ2UgPSBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgICAgbWVzc2FnZUpzb24gPSBlbnRpcmVNZXNzYWdlLnJlcGxhY2UoZXJyLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpLFxuICAgICAgICAgICAgICBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZUpzb24ucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcXCInLCAnZycpLCdcIicpKTtcblxuICAgICAgICBlbWFpbERhdGEuZXJyb3JNZXNzYWdlID0gbWVzc2FnZURhdGEuZXJyb3IubWVzc2FnZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVtYWlsRGF0YS5lcnJvck1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH1cblxufVxuXG5cbnZhciBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2UgPSBmdW5jdGlvbihlbWFpbE1lc3NhZ2UsIG1hcHBpbmcpIHtcbiAgaWYgKG1hcHBpbmcgPT09ICcnKSB7XG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2UgaWYgKG1hcHBpbmcuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgIHJldHVybiBlbWFpbE1lc3NhZ2VbbWFwcGluZ107XG4gIH0gZWxzZSB7XG4gICAgLy9kcmlsbCBpbnRvIG9iamVjdCB0byBncmFiIHRoZSB2YWx1ZSB3ZSBuZWVkXG4gICAgdmFyIG5lc3RlZFByb3BlcnR5QXJyYXkgPSBtYXBwaW5nLnNwbGl0KCcuJyk7XG4gICAgdmFyIHJldHVyblZhbCA9IGVtYWlsTWVzc2FnZVtuZXN0ZWRQcm9wZXJ0eUFycmF5WzBdXTtcbiAgICBpZiAocmV0dXJuVmFsKSB7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IG5lc3RlZFByb3BlcnR5QXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmV0dXJuVmFsID0gcmV0dXJuVmFsW25lc3RlZFByb3BlcnR5QXJyYXlbaV1dO1xuICAgICAgICBpZiAoIXJldHVyblZhbCkge1xuICAgICAgICAgIHJldHVybiByZXR1cm5WYWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVyblZhbDtcbiAgfVxufTtcblxudmFyIG1hcEVtYWlsRGF0YSA9IGZ1bmN0aW9uKGVtYWlsRGF0YSkge1xuXG5cbiAgdmFyIG1hcHBlZERhdGEgPSBbXTtcblxuICBmb3IgKHZhciB1c2VySXRlciA9IDA7IHVzZXJJdGVyIDwgZW1haWxEYXRhLmxlbmd0aDsgdXNlckl0ZXIrKykge1xuICAgIHZhciBtYXBwZWRVc2VyID0ge1xuICAgICAgZW1haWw6IGVtYWlsRGF0YVt1c2VySXRlcl0uZW1haWwsXG4gICAgICBmaWx0ZXJTdGFydERhdGU6IGVtYWlsRGF0YVt1c2VySXRlcl0uZmlsdGVyU3RhcnREYXRlLFxuICAgICAgZmlsdGVyRW5kRGF0ZTogZW1haWxEYXRhW3VzZXJJdGVyXS5maWx0ZXJFbmREYXRlLFxuICAgICAgZGF0YTogW10sXG4gICAgICBzdWNjZXNzOiBlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MsXG4gICAgICBlcnJvck1lc3NhZ2U6IGVtYWlsRGF0YVt1c2VySXRlcl0uZXJyb3JNZXNzYWdlXG4gICAgfTtcblxuICAgIGlmIChlbWFpbERhdGFbdXNlckl0ZXJdLnN1Y2Nlc3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW1haWxEYXRhW3VzZXJJdGVyXS5kYXRhW2VtYWlsRmllbGROYW1lTWFwLmVtYWlsc10ubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb25zdCBvcmlnaW5hbEVtYWlsTWVzc2FnZSA9IGVtYWlsRGF0YVt1c2VySXRlcl0uZGF0YVtlbWFpbEZpZWxkTmFtZU1hcC5lbWFpbHNdW2ldLFxuICAgICAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UgICA9IHt9O1xuXG4gICAgICAgIC8vIGNoYW5nZSB0byBkZXNpcmVkIG5hbWVzXG4gICAgICAgIF8oZW1haWxGaWVsZE5hbWVNYXApXG4gICAgICAgICAgLm9taXQoWyAnZW1haWxzJyBdKVxuICAgICAgICAgIC5lYWNoKChoYXZlLCB3YW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXBwZWQgPSBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIGhhdmUpO1xuICAgICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlW3dhbnRdID0gL15kYXRlVGltZS8udGVzdCh3YW50KSA/IG5ldyBEYXRlKG1hcHBlZCkgOiBtYXBwZWQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy9nZXQgYXJyYXlzXG4gICAgICAgIHZhciBqID0gMDtcblxuICAgICAgICAvL3RvXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS50b1JlY2lwaWVudHMgPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG9yaWdpbmFsRW1haWxNZXNzYWdlW2VtYWlsRmllbGROYW1lTWFwLnRvUmVjaXBpZW50c10ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UudG9SZWNpcGllbnRzLnB1c2goe1xuICAgICAgICAgICAgYWRkcmVzczogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW2VtYWlsRmllbGROYW1lTWFwLnRvUmVjaXBpZW50c11bal0sIGVtYWlsRmllbGROYW1lTWFwLnRvUmVjaXBpZW50QWRkcmVzcyksXG4gICAgICAgICAgICBuYW1lOiBleHRyYWN0RGF0YUZyb21FbWFpbE1lc3NhZ2Uob3JpZ2luYWxFbWFpbE1lc3NhZ2VbZW1haWxGaWVsZE5hbWVNYXAudG9SZWNpcGllbnRzXVtqXSwgZW1haWxGaWVsZE5hbWVNYXAudG9SZWNpcGllbnROYW1lKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jY1xuICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2UuY2NSZWNpcGllbnRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcC5jY1JlY2lwaWVudHNdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgbWFwcGVkRW1haWxNZXNzYWdlLmNjUmVjaXBpZW50cy5wdXNoKHtcbiAgICAgICAgICAgIGFkZHJlc3M6IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcC5jY1JlY2lwaWVudHNdW2pdLCBlbWFpbEZpZWxkTmFtZU1hcC5jY1JlY2lwaWVudEFkZHJlc3MpLFxuICAgICAgICAgICAgbmFtZTogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW2VtYWlsRmllbGROYW1lTWFwLmNjUmVjaXBpZW50c11bal0sIGVtYWlsRmllbGROYW1lTWFwLmNjUmVjaXBpZW50TmFtZSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vYmNjXG4gICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcC5iY2NSZWNpcGllbnRzXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIG1hcHBlZEVtYWlsTWVzc2FnZS5iY2NSZWNpcGllbnRzLnB1c2goe1xuICAgICAgICAgICAgYWRkcmVzczogZXh0cmFjdERhdGFGcm9tRW1haWxNZXNzYWdlKG9yaWdpbmFsRW1haWxNZXNzYWdlW2VtYWlsRmllbGROYW1lTWFwLmJjY1JlY2lwaWVudHNdW2pdLCBlbWFpbEZpZWxkTmFtZU1hcC5iY2NSZWNpcGllbnRBZGRyZXNzKSxcbiAgICAgICAgICAgIG5hbWU6IGV4dHJhY3REYXRhRnJvbUVtYWlsTWVzc2FnZShvcmlnaW5hbEVtYWlsTWVzc2FnZVtlbWFpbEZpZWxkTmFtZU1hcC5iY2NSZWNpcGllbnRzXVtqXSwgZW1haWxGaWVsZE5hbWVNYXAuYmNjUmVjaXBpZW50TmFtZSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcHBlZFVzZXIuZGF0YS5wdXNoKG1hcHBlZEVtYWlsTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuICAgIG1hcHBlZERhdGEucHVzaChtYXBwZWRVc2VyKTtcbiAgfVxuXG4gIHJldHVybiBtYXBwZWREYXRhO1xufTtcbiJdfQ==
//# sourceMappingURL=../../clAdapters/office365-mail/index.js.map
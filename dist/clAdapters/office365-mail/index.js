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

var Office365Adapter = (function (_Adapter) {
  _inherits(Office365Adapter, _Adapter);

  function Office365Adapter() {
    _classCallCheck(this, Office365Adapter);

    _get(Object.getPrototypeOf(Office365Adapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365Adapter, [{
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }, {
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
    key: 'getBatchData',
    value: function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
      var emailFieldNameMap, dataAdapterRunStats, emailData, results;
      return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
        var _this = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            emailFieldNameMap = Office365Adapter.emailFieldNameMap;
            dataAdapterRunStats = {
              emails: emails,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              success: false,
              runDate: (0, _moment2['default'])().utc().toDate()
            };
            context$2$0.prev = 2;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(_Promise.all(emails.map(function (email) {
              return _this.getEmailsForUser(email, filterStartDate, filterEndDate, additionalFields);
            })));

          case 5:
            emailData = context$2$0.sent;
            results = _lodash2['default'].map(emailData, function (user) {
              var emailArray = user.success && user.data[emailFieldNameMap.emails] || [];
              return {
                email: user.email,
                filterStartDate: user.filterStartDate,
                filterEndDate: user.filterEndDate,
                success: user.success,
                errorMessage: user.errorMessage,
                // map data with desired key names...
                data: _lodash2['default'].map(emailArray, function (originalEmailMessage) {
                  var mappedEmailMessage = {};

                  // change to desired names
                  _lodash2['default'].each(emailFieldNameMap, function (have, want) {
                    var mapped = _lodash2['default'].get(originalEmailMessage, have);
                    mappedEmailMessage[want] = /^dateTime/.test(want) ? new Date(mapped) : mapped;
                  });

                  // grab info from different correspondent types...
                  // (since we're using an array literal here, 'for of' syntax will compile reasonably)
                  var _arr = ['to', 'cc', 'bcc'];

                  var _loop = function () {
                    var type = _arr[_i];
                    var key = type + 'Recipient';
                    mappedEmailMessage[key + 's'] = originalEmailMessage[emailFieldNameMap[key + 's']].map(function (recipient) {
                      return {
                        address: _lodash2['default'].get(recipient, emailFieldNameMap[key + 'Address']),
                        name: _lodash2['default'].get(recipient, emailFieldNameMap[key + 'Name'])
                      };
                    });
                  };

                  for (var _i = 0; _i < _arr.length; _i++) {
                    _loop();
                  }

                  return mappedEmailMessage;
                })
              };
            });
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, {
              results: results,
              success: true
            }));

          case 10:
            context$2$0.prev = 10;
            context$2$0.t0 = context$2$0['catch'](2);

            console.log(context$2$0.t0.stack);
            console.log('Office365 GetBatchData Error: ' + JSON.stringify(context$2$0.t0));
            return context$2$0.abrupt('return', _extends({}, dataAdapterRunStats, { errorMessage: context$2$0.t0 }));

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[2, 10]]);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest(connectionData) {
      var today, filterStartDate, filterEndDate, data;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _base.Configuration(connectionData.credentials);

            today = function today() {
              return (0, _moment2['default'])().utc().startOf('day');
            };

            filterStartDate = today().add(-1, 'days').toDate();
            filterEndDate = today().toDate();
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.getBatchData([this._config.credentials.email], filterStartDate, filterEndDate, ''));

          case 6:
            data = context$2$0.sent;
            return context$2$0.abrupt('return', data.success && data.results[0] ? data.results[0] : data);

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'getAccessToken',
    value: function getAccessToken() {
      var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, clientAssertion, tokenRequestFormData, tokenRequestOptions, tokenData, _tokenData, entireMessage, messageJson, messageData;

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
            encodedJwtHeader = new Buffer(JSON.stringify(jwtHeader)).toString('base64'), encodedJwtPayload = new Buffer(JSON.stringify(jwtPayload)).toString('base64'), stringToSign = encodedJwtHeader + '.' + encodedJwtPayload, encodedSignedJwtInfo = _crypto2['default'].createSign('RSA-SHA256').update(stringToSign).sign(certificate, 'base64');
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
            context$2$0.prev = 18;
            context$2$0.t0 = JSON;
            context$2$0.next = 22;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(tokenRequestOptions));

          case 22:
            context$2$0.t1 = context$2$0.sent;
            tokenData = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (!(tokenData && tokenData.access_token)) {
              context$2$0.next = 28;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken = tokenData.access_token);

          case 28:
            throw new Error('Could not get access token.');

          case 29:
            context$2$0.next = 40;
            break;

          case 31:
            context$2$0.prev = 31;
            context$2$0.t2 = context$2$0['catch'](18);
            _tokenData = JSON.parse(JSON.stringify(context$2$0.t2));

            if (!(_tokenData.name === 'StatusCodeError')) {
              context$2$0.next = 39;
              break;
            }

            entireMessage = _tokenData.message, messageJson = entireMessage.replace(_tokenData.statusCode + ' - ', ''), messageData = JSON.parse(messageJson.replace(new RegExp('\\"', 'g'), '"'));
            throw new Error(messageData);

          case 39:
            throw new Error(context$2$0.t2);

          case 40:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[18, 31]]);
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
              $select: Office365Adapter.baseFields.join(',') + additionalFields,
              $filter: (' IsDraft eq false\n                          and DateTimeSent ge ' + filterStartDate.toISOString().substring(0, 10) + '\n                          and DateTimeSent lt ' + filterEndDate.toISOString().substring(0, 10) + '\n                      ').replace(/\s+/g, ' ').trim()
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
  }], [{
    key: 'baseFields',

    // collect these fields always...
    value: ['Id', 'Categories', 'DateTimeCreated', 'Subject', 'Importance', 'HasAttachments', 'ParentFolderId', 'From', 'Sender', 'ToRecipients', 'CcRecipients', 'BccRecipients', 'ReplyTo', 'ConversationId', 'DateTimeReceived', 'DateTimeSent', 'IsDeliveryReceiptRequested', 'IsReadReceiptRequested', 'IsRead'],

    // convert the names of the api response data
    enumerable: true
  }, {
    key: 'emailFieldNameMap',
    value: {
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
    },
    enumerable: true
  }]);

  return Office365Adapter;
})(_base.Adapter);

exports['default'] = Office365Adapter;
module.exports = exports['default'];

// replace data keys with desired mappings...

// return results and success!

//to see if it really worked, we need to pass in the first result

// expire token in one hour

//define assertion

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1LW1haWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBNkIsV0FBVzs7OztzQkFDWCxRQUFROzs7OzhCQUNSLGlCQUFpQjs7OztzQkFDakIsUUFBUTs7OztzQkFDUixRQUFROzs7O29CQUdSLFVBQVU7O0lBSWxCLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7ZUFBaEIsZ0JBQWdCOztXQTZEOUIsaUJBQUc7QUFDTixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3JCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUdTO1VBSUYsR0FBRzs7OztBQUhULGdCQUFJLENBQUMsT0FBTyxHQUFHLHdCQUFrQixJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDekUsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsa0JBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs2Q0FDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7OztBQUNwQixlQUFHLEdBQUcsa0RBQWtEOztBQUM5RCxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnREFDbEMsSUFBSTs7Ozs7OztLQUNaOzs7V0FHaUIsc0JBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCO1VBRWpFLGlCQUFpQixFQUNuQixtQkFBbUIsRUFVakIsU0FBUyxFQVFULE9BQU87Ozs7OztBQW5CUCw2QkFBaUIsR0FBSyxnQkFBZ0IsQ0FBdEMsaUJBQWlCO0FBQ25CLCtCQUFtQixHQUFLO0FBQ3RCLG9CQUFNLEVBQU4sTUFBTTtBQUNOLDZCQUFlLEVBQWYs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QWEsbUJBQW1CO0FBQ2pELHFCQUFlLEVBQWUsZUFBZTtBQUM3QywyQkFBcUIsRUFBUyxzQkFBc0I7QUFDcEQsd0JBQWtCLEVBQVksbUJBQW1CO0FBQ2pELGtDQUE0QixFQUFFLDRCQUE0QjtBQUMxRCw4QkFBd0IsRUFBTSx3QkFBd0I7QUFDdEQsc0JBQWdCLEVBQWMsZ0JBQWdCO0FBQzlDLGVBQVMsRUFBcUIsU0FBUztBQUN2QyxjQUFRLEVBQXNCLFFBQVE7S0FDdkM7Ozs7U0ExRGtCLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0IiLCJmaWxlIjoiY2xBZGFwdGVycy9vZmZpY2UzNjUtbWFpbC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1dWlkICAgICAgICAgICAgIGZyb20gJ25vZGUtdXVpZCc7XG5pbXBvcnQgY3J5cHRvICAgICAgICAgICBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHJwICAgICAgICAgICAgICAgZnJvbSAncmVxdWVzdC1wcm9taXNlJztcbmltcG9ydCBtb21lbnQgICAgICAgICAgIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgXyAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQWRhcHRlcixcbiAgICAgICAgIENvbmZpZ3VyYXRpb24sXG4gICAgICAgICBTZXJ2aWNlIH0gICAgICBmcm9tICcuLi9iYXNlLyc7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPZmZpY2UzNjVBZGFwdGVyIGV4dGVuZHMgQWRhcHRlciB7XG5cblxuICAvLyBjb2xsZWN0IHRoZXNlIGZpZWxkcyBhbHdheXMuLi5cbiAgc3RhdGljIGJhc2VGaWVsZHMgPSBbXG4gICAgJ0lkJyxcbiAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ0RhdGVUaW1lQ3JlYXRlZCcsXG4gICAgJ1N1YmplY3QnLFxuICAgICdJbXBvcnRhbmNlJyxcbiAgICAnSGFzQXR0YWNobWVudHMnLFxuICAgICdQYXJlbnRGb2xkZXJJZCcsXG4gICAgJ0Zyb20nLFxuICAgICdTZW5kZXInLFxuICAgICdUb1JlY2lwaWVudHMnLFxuICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdCY2NSZWNpcGllbnRzJyxcbiAgICAnUmVwbHlUbycsXG4gICAgJ0NvbnZlcnNhdGlvbklkJyxcbiAgICAnRGF0ZVRpbWVSZWNlaXZlZCcsXG4gICAgJ0RhdGVUaW1lU2VudCcsXG4gICAgJ0lzRGVsaXZlcnlSZWNlaXB0UmVxdWVzdGVkJyxcbiAgICAnSXNSZWFkUmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ0lzUmVhZCdcbiAgXVxuXG5cbiAgLy8gY29udmVydCB0aGUgbmFtZXMgb2YgdGhlIGFwaSByZXNwb25zZSBkYXRhXG4gIHN0YXRpYyBlbWFpbEZpZWxkTmFtZU1hcCA9IHtcbiAgICAvLyBEZXNpcmVkLi4uICAgICAgICAgICAgICAgICAvLyBHaXZlbi4uLlxuICAgICdlbWFpbHMnOiAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScsXG4gICAgJ21lc3NhZ2VJZCc6ICAgICAgICAgICAgICAgICAgJ0lkJyxcbiAgICAnY29udmVyc2F0aW9uSWQnOiAgICAgICAgICAgICAnQ29udmVyc2F0aW9uSWQnLFxuICAgICdkYXRlVGltZVNlbnQnOiAgICAgICAgICAgICAgICdEYXRlVGltZVNlbnQnLFxuICAgICdkYXRlVGltZVJlY2VpdmVkJzogICAgICAgICAgICdEYXRlVGltZVJlY2VpdmVkJyxcbiAgICAnaW1wb3J0YW5jZSc6ICAgICAgICAgICAgICAgICAnSW1wb3J0YW5jZScsXG4gICAgJ2ZvbGRlcklkJzogICAgICAgICAgICAgICAgICAgJ1BhcmVudEZvbGRlcklkJyxcbiAgICAnY2F0ZWdvcmllcyc6ICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycsXG4gICAgJ2NvbnRlbnRUeXBlJzogICAgICAgICAgICAgICAgJ0JvZHkuQ29udGVudFR5cGUnLFxuICAgICdzdWJqZWN0JzogICAgICAgICAgICAgICAgICAgICdTdWJqZWN0JyxcbiAgICAnYm9keVByZXZpZXcnOiAgICAgICAgICAgICAgICAnQm9keVByZXZpZXcnLFxuICAgICdib2R5JzogICAgICAgICAgICAgICAgICAgICAgICdCb2R5LkNvbnRlbnQnLFxuICAgICdmcm9tQWRkcmVzcyc6ICAgICAgICAgICAgICAgICdGcm9tLkVtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnZnJvbU5hbWUnOiAgICAgICAgICAgICAgICAgICAnRnJvbS5FbWFpbEFkZHJlc3MuTmFtZScsXG4gICAgJ3RvUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAgJ1RvUmVjaXBpZW50cycsXG4gICAgJ3RvUmVjaXBpZW50QWRkcmVzcyc6ICAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAndG9SZWNpcGllbnROYW1lJzogICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdjY1JlY2lwaWVudHMnOiAgICAgICAgICAgICAgICdDY1JlY2lwaWVudHMnLFxuICAgICdjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgICdFbWFpbEFkZHJlc3MuQWRkcmVzcycsXG4gICAgJ2NjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAgJ0VtYWlsQWRkcmVzcy5OYW1lJyxcbiAgICAnYmNjUmVjaXBpZW50cyc6ICAgICAgICAgICAgICAnQmNjUmVjaXBpZW50cycsXG4gICAgJ2JjY1JlY2lwaWVudEFkZHJlc3MnOiAgICAgICAgJ0VtYWlsQWRkcmVzcy5BZGRyZXNzJyxcbiAgICAnYmNjUmVjaXBpZW50TmFtZSc6ICAgICAgICAgICAnRW1haWxBZGRyZXNzLk5hbWUnLFxuICAgICdpc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCc6ICdJc0RlbGl2ZXJ5UmVjZWlwdFJlcXVlc3RlZCcsXG4gICAgJ2lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnOiAgICAgJ0lzUmVhZFJlY2VpcHRSZXF1ZXN0ZWQnLFxuICAgICdoYXNBdHRhY2htZW50cyc6ICAgICAgICAgICAgICdIYXNBdHRhY2htZW50cycsXG4gICAgJ2lzRHJhZnQnOiAgICAgICAgICAgICAgICAgICAgJ0lzRHJhZnQnLFxuICAgICdpc1JlYWQnOiAgICAgICAgICAgICAgICAgICAgICdJc1JlYWQnXG4gIH1cblxuXG4gIHJlc2V0KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jb25maWc7XG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IENvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscywgeyBhcGlWZXJzaW9uOiAnMS4wJyB9KVxuICAgIHRoaXMuX3NlcnZpY2UgPSBuZXcgU2VydmljZSh0aGlzLl9jb25maWcpO1xuICAgIGF3YWl0IHRoaXMuX3NlcnZpY2UuaW5pdCgpO1xuICAgIGNvbnN0IG1zZyA9ICdTdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQgT2ZmaWNlMzY1IGZvciBlbWFpbDogJXMnO1xuICAgIGNvbnNvbGUubG9nKG1zZywgdGhpcy5jcmVkZW50aWFscy5lbWFpbCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIGFzeW5jIGdldEJhdGNoRGF0YShlbWFpbHMsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcykge1xuXG4gICAgY29uc3QgeyBlbWFpbEZpZWxkTmFtZU1hcCB9ID0gT2ZmaWNlMzY1QWRhcHRlcixcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzICAgPSB7XG4gICAgICAgICAgICBlbWFpbHMsXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBydW5EYXRlOiBtb21lbnQoKS51dGMoKS50b0RhdGUoKVxuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuXG4gICAgICBjb25zdCBlbWFpbERhdGEgPSBhd2FpdCogZW1haWxzLm1hcChlbWFpbCA9PiB0aGlzLmdldEVtYWlsc0ZvclVzZXIoXG4gICAgICAgIGVtYWlsLFxuICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgIGFkZGl0aW9uYWxGaWVsZHNcbiAgICAgICkpO1xuXG4gICAgICAvLyByZXBsYWNlIGRhdGEga2V5cyB3aXRoIGRlc2lyZWQgbWFwcGluZ3MuLi5cbiAgICAgIGNvbnN0IHJlc3VsdHMgPSBfLm1hcChlbWFpbERhdGEsIHVzZXIgPT4ge1xuICAgICAgICBjb25zdCBlbWFpbEFycmF5ID0gKHVzZXIuc3VjY2VzcyAmJiB1c2VyLmRhdGFbZW1haWxGaWVsZE5hbWVNYXAuZW1haWxzXSkgfHwgW107XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZW1haWw6ICAgICAgICAgICAgdXNlci5lbWFpbCxcbiAgICAgICAgICBmaWx0ZXJTdGFydERhdGU6ICB1c2VyLmZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlOiAgICB1c2VyLmZpbHRlckVuZERhdGUsXG4gICAgICAgICAgc3VjY2VzczogICAgICAgICAgdXNlci5zdWNjZXNzLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogICAgIHVzZXIuZXJyb3JNZXNzYWdlLFxuICAgICAgICAgIC8vIG1hcCBkYXRhIHdpdGggZGVzaXJlZCBrZXkgbmFtZXMuLi5cbiAgICAgICAgICBkYXRhOiBfLm1hcChlbWFpbEFycmF5LCBvcmlnaW5hbEVtYWlsTWVzc2FnZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYXBwZWRFbWFpbE1lc3NhZ2UgPSB7fTtcblxuICAgICAgICAgICAgLy8gY2hhbmdlIHRvIGRlc2lyZWQgbmFtZXNcbiAgICAgICAgICAgIF8uZWFjaChlbWFpbEZpZWxkTmFtZU1hcCwgKGhhdmUsIHdhbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkID0gXy5nZXQob3JpZ2luYWxFbWFpbE1lc3NhZ2UsIGhhdmUpO1xuICAgICAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2Vbd2FudF0gPSAvXmRhdGVUaW1lLy50ZXN0KHdhbnQpID8gbmV3IERhdGUobWFwcGVkKSA6IG1hcHBlZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBncmFiIGluZm8gZnJvbSBkaWZmZXJlbnQgY29ycmVzcG9uZGVudCB0eXBlcy4uLlxuICAgICAgICAgICAgLy8gKHNpbmNlIHdlJ3JlIHVzaW5nIGFuIGFycmF5IGxpdGVyYWwgaGVyZSwgJ2ZvciBvZicgc3ludGF4IHdpbGwgY29tcGlsZSByZWFzb25hYmx5KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIFsndG8nLCAnY2MnLCAnYmNjJ10pIHtcbiAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7dHlwZX1SZWNpcGllbnRgO1xuICAgICAgICAgICAgICBtYXBwZWRFbWFpbE1lc3NhZ2VbYCR7a2V5fXNgXSA9IG9yaWdpbmFsRW1haWxNZXNzYWdlW2VtYWlsRmllbGROYW1lTWFwW2Ake2tleX1zYF1dXG4gICAgICAgICAgICAgICAgLm1hcChyZWNpcGllbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogXy5nZXQocmVjaXBpZW50LCBlbWFpbEZpZWxkTmFtZU1hcFtgJHtrZXl9QWRkcmVzc2BdKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogICAgXy5nZXQocmVjaXBpZW50LCBlbWFpbEZpZWxkTmFtZU1hcFtgJHtrZXl9TmFtZWBdKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWFwcGVkRW1haWxNZXNzYWdlO1xuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgLy8gcmV0dXJuIHJlc3VsdHMgYW5kIHN1Y2Nlc3MhXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kYXRhQWRhcHRlclJ1blN0YXRzLFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICB9O1xuXG4gICAgfSBjYXRjaCAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2Uuc3RhY2spO1xuICAgICAgY29uc29sZS5sb2coJ09mZmljZTM2NSBHZXRCYXRjaERhdGEgRXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvck1lc3NhZ2UpKTtcbiAgICAgIHJldHVybiB7IC4uLmRhdGFBZGFwdGVyUnVuU3RhdHMsIGVycm9yTWVzc2FnZSB9O1xuICAgIH1cblxuICB9XG5cblxuICBhc3luYyBydW5Db25uZWN0aW9uVGVzdChjb25uZWN0aW9uRGF0YSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcblxuICAgIGNvbnN0IHRvZGF5ICAgICAgICAgICA9ICgpID0+IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLFxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSA9IHRvZGF5KCkuYWRkKC0xLCAnZGF5cycpLnRvRGF0ZSgpLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUgICA9IHRvZGF5KCkudG9EYXRlKCksXG4gICAgICAgICAgZGF0YSAgICAgICAgICAgID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAvL3RvIHNlZSBpZiBpdCByZWFsbHkgd29ya2VkLCB3ZSBuZWVkIHRvIHBhc3MgaW4gdGhlIGZpcnN0IHJlc3VsdFxuICAgIHJldHVybiBkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5yZXN1bHRzWzBdID8gZGF0YS5yZXN1bHRzWzBdOiBkYXRhO1xuICB9XG5cblxuICBhc3luYyBnZXRBY2Nlc3NUb2tlbigpIHtcblxuICAgIGlmICh0aGlzLmFjY2Vzc1Rva2VuICYmIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID4gbmV3IERhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgY3JlZGVudGlhbHMgOiB7XG4gICAgICAgIGNsaWVudElkLFxuICAgICAgICB0ZW5hbnRJZCxcbiAgICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnMgOiB7XG4gICAgICAgIGFwaVZlcnNpb25cbiAgICAgIH1cbiAgICB9ID0gdGhpcy5fY29uZmlnO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0VXJsID0gYGh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS8ke3RlbmFudElkfS9vYXV0aDIvdG9rZW4/YXBpLXZlcnNpb249JHthcGlWZXJzaW9ufWA7XG5cbiAgICBjb25zdCBqd3RIZWFkZXIgPSB7XG4gICAgICAnYWxnJzogJ1JTMjU2JyxcbiAgICAgICd4NXQnOiBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcbiAgICB9O1xuXG4gICAgLy8gZXhwaXJlIHRva2VuIGluIG9uZSBob3VyXG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAzNjAwMDApIC8gMTAwMDtcblxuICAgIC8vIGdyYWIgbmV3IGFjY2VzcyB0b2tlbiAxMCBzZWNvbmRzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPSBuZXcgRGF0ZShhY2Nlc3NUb2tlbkV4cGlyZXMqMTAwMCAtIDEwMDAwKTtcblxuICAgIGNvbnN0IGp3dFBheWxvYWQgPSB7XG4gICAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgJ2V4cCc6IGFjY2Vzc1Rva2VuRXhwaXJlcyxcbiAgICAgICdpc3MnOiBjbGllbnRJZCxcbiAgICAgICdqdGknOiB1dWlkLnY0KCksXG4gICAgICAnbmJmJzogYWNjZXNzVG9rZW5FeHBpcmVzIC0gMiozNjAwLCAvLyBvbmUgaG91ciBiZWZvcmUgbm93XG4gICAgICAnc3ViJzogY2xpZW50SWRcbiAgICB9O1xuXG4gICAgY29uc3QgZW5jb2RlZEp3dEhlYWRlciAgICAgPSBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KGp3dEhlYWRlcikpLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgICAgICBlbmNvZGVkSnd0UGF5bG9hZCAgICA9IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoand0UGF5bG9hZCkpLnRvU3RyaW5nKCdiYXNlNjQnKSxcbiAgICAgICAgICBzdHJpbmdUb1NpZ24gICAgICAgICA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCxcbiAgICAgICAgICBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IGNyeXB0b1xuICAgICAgICAgICAgLmNyZWF0ZVNpZ24oJ1JTQS1TSEEyNTYnKVxuICAgICAgICAgICAgLnVwZGF0ZShzdHJpbmdUb1NpZ24pXG4gICAgICAgICAgICAuc2lnbihjZXJ0aWZpY2F0ZSwgJ2Jhc2U2NCcpO1xuXG4gICAgLy9kZWZpbmUgYXNzZXJ0aW9uXG4gICAgY29uc3QgY2xpZW50QXNzZXJ0aW9uID0gZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkICsgJy4nICsgZW5jb2RlZFNpZ25lZEp3dEluZm87XG5cbiAgICBjb25zdCB0b2tlblJlcXVlc3RGb3JtRGF0YSA9IHtcbiAgICAgIGNsaWVudF9pZDogY2xpZW50SWQsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uX3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXInLFxuICAgICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXG4gICAgICByZXNvdXJjZTogJ2h0dHBzOi8vb3V0bG9vay5vZmZpY2UzNjUuY29tLycsXG4gICAgICBjbGllbnRfYXNzZXJ0aW9uOiBjbGllbnRBc3NlcnRpb25cbiAgICB9O1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgcG9ydDogNDQzLFxuICAgICAgdXJpOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgICBmb3JtRGF0YTogdG9rZW5SZXF1ZXN0Rm9ybURhdGEsXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgdG9rZW5EYXRhID0gSlNPTi5wYXJzZShhd2FpdCBycCh0b2tlblJlcXVlc3RPcHRpb25zKSk7XG4gICAgICBpZiAodG9rZW5EYXRhICYmIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW4gPSB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZ2V0IGFjY2VzcyB0b2tlbi4nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IHRva2VuRGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXJyKSk7XG4gICAgICBpZiAodG9rZW5EYXRhLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IGVudGlyZU1lc3NhZ2UgPSB0b2tlbkRhdGEubWVzc2FnZSxcbiAgICAgICAgICAgICAgbWVzc2FnZUpzb24gICA9IGVudGlyZU1lc3NhZ2UucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJyksXG4gICAgICAgICAgICAgIG1lc3NhZ2VEYXRhICAgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2VEYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgZ2V0RW1haWxzRm9yVXNlcihlbWFpbCwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzLCBlbWFpbERhdGEsIHBhZ2VUb0dldD0xKSB7XG4gICAgLy8gYWNjdW11bGF0aW9uIG9mIGRhdGFcbiAgICBlbWFpbERhdGEgPSBlbWFpbERhdGEgfHwgeyBlbWFpbCwgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlIH07XG5cbiAgICBjb25zdCBhY2Nlc3NUb2tlbiAgICAgPSBhd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKCksXG4gICAgICAgICAgeyBhcGlWZXJzaW9uIH0gID0gdGhpcy5fY29uZmlnLm9wdGlvbnMsXG4gICAgICAgICAgcmVjb3Jkc1BlclBhZ2UgID0gMjUsXG4gICAgICAgICAgbWF4UGFnZXMgICAgICAgID0gMjAsXG4gICAgICAgICAgc2tpcCAgICAgICAgICAgID0gKChwYWdlVG9HZXQgLTEpICogcmVjb3Jkc1BlclBhZ2UpICsgMSxcbiAgICAgICAgICAvLyBwYXJhbWV0ZXJzIHRvIHF1ZXJ5IGVtYWlsIHdpdGguLi5cbiAgICAgICAgICBwYXJhbXMgICAgICAgICAgPSB7XG4gICAgICAgICAgICAkdG9wOiAgICAgcmVjb3Jkc1BlclBhZ2UsXG4gICAgICAgICAgICAkc2tpcDogICAgc2tpcCxcbiAgICAgICAgICAgICRzZWxlY3Q6ICBPZmZpY2UzNjVBZGFwdGVyLmJhc2VGaWVsZHMuam9pbignLCcpICsgYWRkaXRpb25hbEZpZWxkcyxcbiAgICAgICAgICAgICRmaWx0ZXI6ICBgIElzRHJhZnQgZXEgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIERhdGVUaW1lU2VudCBnZSAke2ZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFuZCBEYXRlVGltZVNlbnQgbHQgJHtmaWx0ZXJFbmREYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyaW5nKDAsIDEwKX1cbiAgICAgICAgICAgICAgICAgICAgICBgLnJlcGxhY2UoL1xccysvZywgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgfTtcblxuICAgIC8vIGZvcm1hdCBwYXJhbWV0ZXJzIGZvciB1cmxcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBfKHBhcmFtcylcbiAgICAgIC5tYXAoKHZhbHVlLCBrZXkpID0+IGAke2tleX09JHt2YWx1ZX1gKVxuICAgICAgLmpvaW4oJyYnKTtcblxuICAgIGNvbnN0IGVtYWlsUmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJpOiBgaHR0cHM6Ly9vdXRsb29rLm9mZmljZTM2NS5jb20vYXBpL3Yke2FwaVZlcnNpb259L3VzZXJzKCcke2VtYWlsfScpL21lc3NhZ2VzPyR7dXJsUGFyYW1zfWAsXG4gICAgICBoZWFkZXJzIDoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7YWNjZXNzVG9rZW59YCxcbiAgICAgICAgQWNjZXB0OiAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIGVtYWlsRGF0YS5zdWNjZXNzID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHBhcnNlZEJvZHkgPSBKU09OLnBhcnNlKGF3YWl0IHJwKGVtYWlsUmVxdWVzdE9wdGlvbnMpKTtcblxuICAgICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFnZVRvR2V0ID09PSAxKSB7XG4gICAgICAgIGVtYWlsRGF0YS5kYXRhID0gcGFyc2VkQm9keTtcbiAgICAgIH0gZWxzZSBpZiAocGFyc2VkQm9keS52YWx1ZSAmJiBwYWdlVG9HZXQgPiAxKSB7XG4gICAgICAgIGVtYWlsRGF0YS5kYXRhLnZhbHVlID0gZW1haWxEYXRhLmRhdGEudmFsdWUuY29uY2F0KHBhcnNlZEJvZHkudmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyc2VkQm9keSAmJiBwYXJzZWRCb2R5LnZhbHVlLmxlbmd0aCA9PT0gcmVjb3Jkc1BlclBhZ2UgJiYgcGFnZVRvR2V0IDw9IG1heFBhZ2VzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVtYWlsc0ZvclVzZXIoZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSwgYWRkaXRpb25hbEZpZWxkcywgZW1haWxEYXRhLCBwYWdlVG9HZXQgKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBlbWFpbERhdGE7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBlbWFpbERhdGEuc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgaWYgKGVyci5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgICBjb25zdCBlbnRpcmVNZXNzYWdlID0gZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgIG1lc3NhZ2VKc29uID0gZW50aXJlTWVzc2FnZS5yZXBsYWNlKGVyci5zdGF0dXNDb2RlICsgJyAtICcsICcnKSxcbiAgICAgICAgICAgICAgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXFwiJywgJ2cnKSwnXCInKSk7XG5cbiAgICAgICAgZW1haWxEYXRhLmVycm9yTWVzc2FnZSA9IG1lc3NhZ2VEYXRhLmVycm9yLm1lc3NhZ2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbWFpbERhdGEuZXJyb3JNZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9XG5cblxufVxuIl19
//# sourceMappingURL=../../clAdapters/office365-mail/index.js.map
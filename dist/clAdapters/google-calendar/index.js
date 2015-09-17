'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _baseAdapter = require('./baseAdapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

var _Service = require('./Service');

var _Service2 = _interopRequireDefault(_Service);

var GoogleCalendarAdapter = (function (_BaseAdapter) {
  _inherits(GoogleCalendarAdapter, _BaseAdapter);

  function GoogleCalendarAdapter() {
    _classCallCheck(this, GoogleCalendarAdapter);

    _BaseAdapter.apply(this, arguments);
  }

  // no constructor necessary if no new logic...

  GoogleCalendarAdapter.prototype.init = function init() {
    return _regeneratorRuntime.async(function init$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          this._config = new _Configuration2['default'](this.credentials);
          this._service = new _Service2['default'](this._config);

          context$2$0.next = 4;
          return _regeneratorRuntime.awrap(this._service.init());

        case 4:

          console.log('Successfully initialized gmail adapter for email: %s', this.credentials.email);

          return context$2$0.abrupt('return', this);

        case 6:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  };

  GoogleCalendarAdapter.prototype.reset = function reset() {
    delete this._config;
    delete this._service;
  };

  GoogleCalendarAdapter.prototype.getBatchData = function getBatchData(emails, filterStartDate, filterEndDate, additionalFields) {
    var _config$credentials, clientId, email, serviceEmail, certificate, apiVersion, dataAdapterRunStats;

    return _regeneratorRuntime.async(function getBatchData$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          _config$credentials = this._config.credentials;
          clientId = _config$credentials.clientId;
          email = _config$credentials.email;
          serviceEmail = _config$credentials.serviceEmail;
          certificate = _config$credentials.certificate;
          apiVersion = this.options.apiVersion;
          dataAdapterRunStats = {
            success: true,
            runDate: _moment2['default']().utc().toDate(),
            filterStartDate: filterStartDate,
            filterEndDate: filterEndDate,
            emails: emails
          };
          context$2$0.prev = 7;
          context$2$0.next = 10;
          return _regeneratorRuntime.awrap(getAccessToken(clientId, serviceEmail, email, certificate));

        case 10:
          context$2$0.next = 12;
          return _regeneratorRuntime.awrap(_Promise.all(_lodash2['default'].map(emails, function (email) {
            return getUserEmails({
              clientId: clientId,
              serviceEmail: serviceEmail,
              apiVersion: apiVersion,
              filterStartDate: filterStartDate,
              filterEndDate: filterEndDate,
              additionalFields: additionalFields,
              privateKey: certificate,
              userEmail: email,
              result: { email: email, filterStartDate: filterStartDate, filterEndDate: filterEndDate }
            });
          })));

        case 12:
          context$2$0.t0 = context$2$0.sent;
          dataAdapterRunStats.results = mapEmailData(context$2$0.t0);
          return context$2$0.abrupt('return', dataAdapterRunStats);

        case 17:
          context$2$0.prev = 17;
          context$2$0.t1 = context$2$0['catch'](7);

          dataAdapterRunStats.success = false;
          dataAdapterRunStats.errorMessage = context$2$0.t1;
          console.log('GoogleMail GetBatchData Error: ' + JSON.stringify(context$2$0.t1));
          return context$2$0.abrupt('return', dataAdapterRunStats);

        case 23:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this, [[7, 17]]);
  };

  GoogleCalendarAdapter.prototype.runConnectionTest = function runConnectionTest(connectionData) {
    var filterStartDate, filterEndDate, data;
    return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          this._config = new _Configuration2['default'](connectionData.credentials);

          filterStartDate = _moment2['default']().utc().startOf('day').add(-1, 'days').toDate();
          filterEndDate = _moment2['default']().utc().startOf('day').toDate();
          context$2$0.next = 5;
          return _regeneratorRuntime.awrap(this.getBatchData([this._config.credentials.email], filterStartDate, filterEndDate, ''));

        case 5:
          data = context$2$0.sent;

          if (!(data.success && data.results[0])) {
            context$2$0.next = 10;
            break;
          }

          return context$2$0.abrupt('return', data.results[0]);

        case 10:
          return context$2$0.abrupt('return', data);

        case 11:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  };

  GoogleCalendarAdapter.prototype.runMessageTest = function runMessageTest(connectionData) {
    var filterStartDate, filterEndDate, data;
    return _regeneratorRuntime.async(function runMessageTest$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          this._config = new _Configuration2['default'](connectionData.credentials);

          context$2$0.prev = 1;
          filterStartDate = _moment2['default']().utc().startOf('day').add(-1, 'days').toDate();
          filterEndDate = _moment2['default']().utc().startOf('day').toDate();
          context$2$0.next = 6;
          return _regeneratorRuntime.awrap(this.getBatchData([this._config.credentials.email], filterStartDate, filterEndDate, 'Subject,BodyPreview,Body'));

        case 6:
          data = context$2$0.sent;

          console.log('runMessageTest worked', data.results[0]);
          context$2$0.next = 13;
          break;

        case 10:
          context$2$0.prev = 10;
          context$2$0.t0 = context$2$0['catch'](1);

          console.log('runMessageTest Error: ' + JSON.stringify(context$2$0.t0));

        case 13:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this, [[1, 10]]);
  };

  return GoogleCalendarAdapter;
})(_baseAdapter2['default']);

exports['default'] = GoogleCalendarAdapter;

function getSingleMessageDetails(messageId, userEmail, token, apiVersion, additionalFields, result) {
  var fields, subjectHeader;
  return _regeneratorRuntime.async(function getSingleMessageDetails$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        fields = additionalFields.replace('BodyPreview', 'snippet').replace('Body', 'payload(parts)').replace('Subject', 'payload(parts)');
        context$1$0.t0 = JSON;
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(_requestPromise2['default']({
          method: 'GET',
          uri: 'https://www.googleapis.com/gmail/' + 'v' + apiVersion + '/users/' + userEmail + '/messages/' + messageId + '?fields=id,threadId,labelIds,payload(headers)' + (fields ? ',' + fields : ''),
          headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json;odata.metadata=none'
          }
        }));

      case 4:
        context$1$0.t1 = context$1$0.sent;
        result.messageData = context$1$0.t0.parse.call(context$1$0.t0, context$1$0.t1);

        //remove subject header
        if (!/Subject/.test(additionalFields)) {
          subjectHeader = _lodash2['default'].find(_lodash2['default'].get(result, 'messageData.payload.headers'), { name: 'Subject' });

          if (subjectHeader) {
            subjectHeader.value = '';
          }
        }

        return context$1$0.abrupt('return', true);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

function getAccessToken(clientId, adminEmail, userEmail, privateKey) {
  var tokenRequestUrl, unixEpochTime, jwtHeader, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, signer, encodedSignedJwtInfo, clientAssertion, tokenRequestFormData, requestData, requestDataLength, tokenData, entireMessage, messageJson, messageData;
  return _regeneratorRuntime.async(function getAccessToken$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        tokenRequestUrl = 'https://www.googleapis.com/oauth2/v3/token', unixEpochTime = Math.floor(new Date().getTime() / 1000), jwtHeader = {
          alg: 'RS256',
          typ: 'JWT'
        }, jwtPayload = {
          iss: adminEmail,
          scope: 'https://www.googleapis.com/auth/gmail.readonly',
          aud: tokenRequestUrl,
          exp: unixEpochTime + 3600,
          iat: unixEpochTime,
          sub: userEmail
        };
        encode = function encode(header) {
          return new Buffer(JSON.stringify(header)).toString('base64');
        }, encodedJwtHeader = encode(jwtHeader), encodedJwtPayload = encode(jwtPayload), stringToSign = [encodedJwtHeader, encodedJwtPayload].join('.'), signer = _crypto2['default'].createSign('RSA-SHA256');

        signer.update(stringToSign);

        encodedSignedJwtInfo = signer.sign(privateKey, 'base64'), clientAssertion = [encodedJwtHeader, encodedJwtPayload, encodedSignedJwtInfo].join('.'), tokenRequestFormData = {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: clientAssertion
        };
        requestData = _querystring2['default'].stringify(tokenRequestFormData), requestDataLength = requestData.length;
        context$1$0.prev = 5;
        context$1$0.t0 = JSON;
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(_requestPromise2['default']({
          method: 'POST',
          port: 443,
          uri: tokenRequestUrl,
          body: requestData,
          multipart: false,
          headers: {
            'Content-Length': requestDataLength,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }));

      case 9:
        context$1$0.t1 = context$1$0.sent;
        tokenData = context$1$0.t0.parse.call(context$1$0.t0, context$1$0.t1);

        if (!(tokenData && tokenData.access_token)) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', tokenData.access_token);

      case 15:
        return context$1$0.abrupt('return', _Promise.reject('Could not get access token.'));

      case 16:
        context$1$0.next = 27;
        break;

      case 18:
        context$1$0.prev = 18;
        context$1$0.t2 = context$1$0['catch'](5);
        tokenData = JSON.parse(JSON.stringify(context$1$0.t2));

        if (!(tokenData.name === 'StatusCodeError')) {
          context$1$0.next = 26;
          break;
        }

        entireMessage = tokenData.message, messageJson = entireMessage.replace(tokenData.statusCode + ' - ', ''), messageData = JSON.parse(messageJson.replace(/\"/g, '"'));
        return context$1$0.abrupt('return', _Promise.reject(messageData));

      case 26:
        return context$1$0.abrupt('return', _Promise.reject(context$1$0.t2));

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[5, 18]]);
};

function getUserEmails(opts) {
  var clientId, serviceEmail, userEmail, privateKey, apiVersion, filterStartDate, filterEndDate, additionalFields, result, _ret, entireMessage, messageJson, messageData;

  return _regeneratorRuntime.async(function getUserEmails$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        clientId = opts.clientId;
        serviceEmail = opts.serviceEmail;
        userEmail = opts.userEmail;
        privateKey = opts.privateKey;
        apiVersion = opts.apiVersion;
        filterStartDate = opts.filterStartDate;
        filterEndDate = opts.filterEndDate;
        additionalFields = opts.additionalFields;
        result = opts.result;
        context$1$0.prev = 9;
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap((function callee$1$0() {
          var token, emailRequestOptions;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.next = 2;
                return _regeneratorRuntime.awrap(getAccessToken(clientId, serviceEmail, userEmail, privateKey));

              case 2:
                token = context$2$0.sent;
                emailRequestOptions = {
                  method: 'GET',
                  uri: 'https://www.googleapis.com/gmail/' + 'v' + apiVersion + '/users/' + userEmail + '/messages?q=after:' + filterStartDate.toISOString().substring(0, 10) + ' AND before: ' + filterEndDate.toISOString().substring(0, 10),
                  headers: {
                    Authorization: 'Bearer ' + token,
                    Accept: 'application/json;odata.metadata=none'
                  }
                };

                result.success = true;

                context$2$0.t0 = JSON;
                context$2$0.next = 8;
                return _regeneratorRuntime.awrap(_requestPromise2['default'](emailRequestOptions));

              case 8:
                context$2$0.t1 = context$2$0.sent;
                context$2$0.t2 = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);
                context$2$0.t3 = [];
                result.data = {
                  messageList: context$2$0.t2,
                  messages: context$2$0.t3
                };
                context$2$0.next = 14;
                return _regeneratorRuntime.awrap(_Promise.all(_lodash2['default'].map(result.data.messageList.messages, function (message) {
                  result.data.messages.push({ messageId: message.id });
                  return getSingleMessageDetails(message.id, userEmail, token, apiVersion, additionalFields, message);
                })));

              case 14:
                context$2$0.t4 = context$2$0.sent;
                return context$2$0.abrupt('return', {
                  v: context$2$0.t4
                });

              case 16:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        })());

      case 12:
        _ret = context$1$0.sent;

        if (!(typeof _ret === 'object')) {
          context$1$0.next = 15;
          break;
        }

        return context$1$0.abrupt('return', _ret.v);

      case 15:
        context$1$0.next = 22;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](9);

        result.success = false;
        if (context$1$0.t0.name === 'StatusCodeError') {
          entireMessage = context$1$0.t0.message, messageJson = entireMessage.replace(context$1$0.t0.statusCode + ' - ', ''), messageData = JSON.parse(messageJson.replace(/\"/g, '"'));

          result.errorMessage = messageData.error.message;
        } else {
          result.errorMessage = JSON.stringify(context$1$0.t0);
        }
        return context$1$0.abrupt('return', true);

      case 22:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[9, 17]]);
}

function getHeaderValue(message, headerName) {
  var headerValues = _lodash2['default'](message.payload.headers).filter(function (header) {
    return header.name === headerName;
  }).pluck('value').value();
  if (headerValues.length > 0) {
    return headerValues[0];
  } else {
    return null;
  }
}

// TODO: try to check if there is actually an email address?
function getEmailAddressObjectFromString(value) {
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

var hasLabel = function hasLabel(message, labelValue) {
  return message.labelIds.indexOf(labelValue) >= 0;
};

function mapEmailData(emailData) {
  return emailData.map(function (user) {
    return {
      email: user.email,
      filterStartDate: user.filterStartDate,
      filterEndDate: user.filterEndDate,
      success: user.success,
      errorMessage: user.errorMessage,
      data: !user.success ? [] : user.data.messages.map(cleanMessage)
    };
  });
}

function cleanMessage(message) {

  var messageData = message.messageData,
      dateReceived = getHeaderValue(messageData, 'Received');

  if (dateReceived) {
    var datePartOfValue = dateReceived.split(';')[1];
    message.dateTimeReceived = _moment2['default'](new Date(datePartOfValue)).utc().toDate();
  }

  message.importance = 'Normal';
  if (hasLabel(messageData, 'IMPORTANT')) {
    message.importance = 'Important';
  }

  if (hasLabel(messageData, 'SENT')) {
    message.folderId = message.folderName = 'Sent Items';
  } else {
    message.folderId = message.folderName = 'Inbox';
  }

  if (_lodash2['default'].get(messageData, 'payload.parts.length')) {
    message.contentType = messageData.payload.parts[0].mimeType;
    message.body = new Buffer(messageData.payload.parts[0].body.data, 'base64').toString();
  }

  var addresses = function addresses(field) {
    return getHeaderValue(messageData, field).split(',').map(getEmailAddressObjectFromString);
  };

  return _lodash2['default'].extend(message, {
    conversationId: messageData.threadId,
    dateTimeSent: _moment2['default'](new Date(getHeaderValue(messageData, 'Date'))).utc().toDate(),
    categories: messageData.labelIds,
    subject: getHeaderValue(messageData, 'Subject'),
    bodyPreview: messageData.snippet,
    isDeliveryReceiptRequested: null,
    isReadReceiptRequested: null,
    hasAttachments: null,
    isDraft: null,
    isRead: hasLabel(messageData, 'READ'),
    fromAddress: getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).address,
    fromName: getEmailAddressObjectFromString(getHeaderValue(messageData, 'From')).name,
    toRecipients: addresses('To'),
    ccRecipients: addresses('Cc'),
    bccRecipients: addresses('Bcc')
  });
}
module.exports = exports['default'];

//first try to get token for the admin - if that fails, then all will fail

//to see if it really worked, we need to pass in the first result

//define assertion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUEyQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7c0JBQ1IsUUFBUTs7Ozs4QkFDUixpQkFBaUI7Ozs7MkJBQ2pCLGFBQWE7Ozs7MkJBQ2IsZUFBZTs7Ozs2QkFDZixpQkFBaUI7Ozs7dUJBQ2pCLFdBQVc7Ozs7SUFHakIscUJBQXFCO1lBQXJCLHFCQUFxQjs7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7Ozs7Ozs7QUFBckIsdUJBQXFCLFdBSWxDLElBQUksR0FBQTs7OztBQUNSLGNBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQWtCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuRCxjQUFJLENBQUMsUUFBUSxHQUFHLHlCQUFZLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7OzJDQUVwQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTs7OztBQUUxQixpQkFBTyxDQUFDLEdBQUcsQ0FDVCxzREFBc0QsRUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQ3ZCLENBQUM7OzhDQUVLLElBQUk7Ozs7Ozs7R0FDWjs7QUFoQmtCLHVCQUFxQixXQW1CeEMsS0FBSyxHQUFBLGlCQUFHO0FBQ04sV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUN0Qjs7QUF0QmtCLHVCQUFxQixXQXlCbEMsWUFBWSxHQUFBLHNCQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLGdCQUFnQjs2QkFFakUsUUFBUSxFQUNSLEtBQUssRUFDTCxZQUFZLEVBQ1osV0FBVyxFQUVYLFVBQVUsRUFDWixtQkFBbUI7Ozs7O2dDQUZmLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVztBQUoxQixrQkFBUSx1QkFBUixRQUFRO0FBQ1IsZUFBSyx1QkFBTCxLQUFLO0FBQ0wsc0JBQVks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QUN2QixrQkFBYyxFQUFnQixXQUFXLENBQUMsUUFBUTtBQUNsRCxnQkFBWSxFQUFrQixvQkFBTyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUU7QUFDbEcsY0FBVSxFQUFvQixXQUFXLENBQUMsUUFBUTtBQUNsRCxXQUFPLEVBQXVCLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDO0FBQ3BFLGVBQVcsRUFBbUIsV0FBVyxDQUFDLE9BQU87QUFDakQsOEJBQTBCLEVBQUksSUFBSTtBQUNsQywwQkFBc0IsRUFBUSxJQUFJO0FBQ2xDLGtCQUFjLEVBQWdCLElBQUk7QUFDbEMsV0FBTyxFQUF1QixJQUFJO0FBQ2xDLFVBQU0sRUFBd0IsUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7QUFDM0QsZUFBVyxFQUFtQiwrQkFBK0IsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTztBQUMxRyxZQUFRLEVBQXNCLCtCQUErQixDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3ZHLGdCQUFZLEVBQWtCLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDN0MsZ0JBQVksRUFBa0IsU0FBUyxDQUFDLElBQUksQ0FBQztBQUM3QyxpQkFBYSxFQUFpQixTQUFTLENBQUMsS0FBSyxDQUFDO0dBQy9DLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6ImNsQWRhcHRlcnMvZ29vZ2xlLWNhbGVuZGFyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gICAgICAgICAgICAgIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgY3J5cHRvICAgICAgICAgZnJvbSAnY3J5cHRvJztcbmltcG9ydCBtb21lbnQgICAgICAgICBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHJlcXVlc3QgICAgICAgIGZyb20gJ3JlcXVlc3QtcHJvbWlzZSc7XG5pbXBvcnQgcXVlcnlzdHJpbmcgICAgZnJvbSAncXVlcnlzdHJpbmcnO1xuaW1wb3J0IEJhc2VBZGFwdGVyICAgIGZyb20gJy4vYmFzZUFkYXB0ZXInO1xuaW1wb3J0IENvbmZpZ3VyYXRpb24gIGZyb20gJy4vQ29uZmlndXJhdGlvbic7XG5pbXBvcnQgU2VydmljZSAgICAgICAgZnJvbSAnLi9TZXJ2aWNlJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb29nbGVDYWxlbmRhckFkYXB0ZXIgZXh0ZW5kcyBCYXNlQWRhcHRlciB7XG4gIC8vIG5vIGNvbnN0cnVjdG9yIG5lY2Vzc2FyeSBpZiBubyBuZXcgbG9naWMuLi5cblxuXG4gIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IENvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscyk7XG4gICAgdGhpcy5fc2VydmljZSA9IG5ldyBTZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG5cbiAgICBhd2FpdCB0aGlzLl9zZXJ2aWNlLmluaXQoKTtcblxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgJ1N1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCBnbWFpbCBhZGFwdGVyIGZvciBlbWFpbDogJXMnLFxuICAgICAgdGhpcy5jcmVkZW50aWFscy5lbWFpbFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG5cbiAgcmVzZXQoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NvbmZpZztcbiAgICBkZWxldGUgdGhpcy5fc2VydmljZTtcbiAgfVxuXG5cbiAgYXN5bmMgZ2V0QmF0Y2hEYXRhKGVtYWlscywgZmlsdGVyU3RhcnREYXRlLCBmaWx0ZXJFbmREYXRlLCBhZGRpdGlvbmFsRmllbGRzKSB7XG4gICAgY29uc3Qge1xuICAgICAgICAgICAgY2xpZW50SWQsXG4gICAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICAgIHNlcnZpY2VFbWFpbCxcbiAgICAgICAgICAgIGNlcnRpZmljYXRlXG4gICAgICAgICAgfSA9IHRoaXMuX2NvbmZpZy5jcmVkZW50aWFscyxcbiAgICAgICAgICB7IGFwaVZlcnNpb24gfSA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBkYXRhQWRhcHRlclJ1blN0YXRzID0ge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIHJ1bkRhdGU6IG1vbWVudCgpLnV0YygpLnRvRGF0ZSgpLFxuICAgICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgICAgZmlsdGVyRW5kRGF0ZSxcbiAgICAgICAgICAgIGVtYWlsc1xuICAgICAgICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgLy9maXJzdCB0cnkgdG8gZ2V0IHRva2VuIGZvciB0aGUgYWRtaW4gLSBpZiB0aGF0IGZhaWxzLCB0aGVuIGFsbCB3aWxsIGZhaWxcbiAgICAgIGF3YWl0IGdldEFjY2Vzc1Rva2VuKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIGVtYWlsLCBjZXJ0aWZpY2F0ZSk7XG5cbiAgICAgIGRhdGFBZGFwdGVyUnVuU3RhdHMucmVzdWx0cyA9IG1hcEVtYWlsRGF0YShcbiAgICAgICAgYXdhaXQqIF8ubWFwKGVtYWlscywgZW1haWwgPT4gZ2V0VXNlckVtYWlscyh7XG4gICAgICAgICAgY2xpZW50SWQsXG4gICAgICAgICAgc2VydmljZUVtYWlsLFxuICAgICAgICAgIGFwaVZlcnNpb24sXG4gICAgICAgICAgZmlsdGVyU3RhcnREYXRlLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgYWRkaXRpb25hbEZpZWxkcyxcbiAgICAgICAgICBwcml2YXRlS2V5ICA6IGNlcnRpZmljYXRlLFxuICAgICAgICAgIHVzZXJFbWFpbCAgIDogZW1haWwsXG4gICAgICAgICAgcmVzdWx0ICAgICAgOiB7IGVtYWlsLCBmaWx0ZXJTdGFydERhdGUsIGZpbHRlckVuZERhdGUgfVxuICAgICAgICB9KSlcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkYXRhQWRhcHRlclJ1blN0YXRzO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZGF0YUFkYXB0ZXJSdW5TdGF0cy5zdWNjZXNzID0gZmFsc2U7XG4gICAgICBkYXRhQWRhcHRlclJ1blN0YXRzLmVycm9yTWVzc2FnZSA9IGVycjtcbiAgICAgIGNvbnNvbGUubG9nKCdHb29nbGVNYWlsIEdldEJhdGNoRGF0YSBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xuICAgICAgcmV0dXJuIGRhdGFBZGFwdGVyUnVuU3RhdHM7XG4gICAgfVxuXG4gIH1cblxuICBhc3luYyBydW5Db25uZWN0aW9uVGVzdChjb25uZWN0aW9uRGF0YSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcblxuICAgIGNvbnN0IGZpbHRlclN0YXJ0RGF0ZSA9IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLmFkZCgtMSwgJ2RheXMnKS50b0RhdGUoKSxcbiAgICAgICAgICBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykudG9EYXRlKCksXG4gICAgICAgICAgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0QmF0Y2hEYXRhKFxuICAgICAgICAgICAgW3RoaXMuX2NvbmZpZy5jcmVkZW50aWFscy5lbWFpbF0sXG4gICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlLFxuICAgICAgICAgICAgJydcbiAgICAgICAgICApO1xuXG4gICAgaWYgKGRhdGEuc3VjY2VzcyAmJiBkYXRhLnJlc3VsdHNbMF0pIHtcbiAgICAgIC8vdG8gc2VlIGlmIGl0IHJlYWxseSB3b3JrZWQsIHdlIG5lZWQgdG8gcGFzcyBpbiB0aGUgZmlyc3QgcmVzdWx0XG4gICAgICByZXR1cm4gZGF0YS5yZXN1bHRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBydW5NZXNzYWdlVGVzdChjb25uZWN0aW9uRGF0YSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWx0ZXJTdGFydERhdGUgPSBtb21lbnQoKS51dGMoKS5zdGFydE9mKCdkYXknKS5hZGQoLTEsICdkYXlzJykudG9EYXRlKCksXG4gICAgICAgICAgICBmaWx0ZXJFbmREYXRlID0gbW9tZW50KCkudXRjKCkuc3RhcnRPZignZGF5JykudG9EYXRlKCksXG4gICAgICAgICAgICBkYXRhID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgICAgICAgIFt0aGlzLl9jb25maWcuY3JlZGVudGlhbHMuZW1haWxdLFxuICAgICAgICAgICAgICBmaWx0ZXJTdGFydERhdGUsXG4gICAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgICAgICdTdWJqZWN0LEJvZHlQcmV2aWV3LEJvZHknXG4gICAgICAgICAgICApO1xuXG4gICAgICBjb25zb2xlLmxvZygncnVuTWVzc2FnZVRlc3Qgd29ya2VkJywgZGF0YS5yZXN1bHRzWzBdKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdydW5NZXNzYWdlVGVzdCBFcnJvcjogJyArIEpTT04uc3RyaW5naWZ5KGVycikpO1xuICAgIH1cblxuICB9XG5cbn1cblxuXG5hc3luYyBmdW5jdGlvbiBnZXRTaW5nbGVNZXNzYWdlRGV0YWlscyhtZXNzYWdlSWQsIHVzZXJFbWFpbCwgdG9rZW4sIGFwaVZlcnNpb24sIGFkZGl0aW9uYWxGaWVsZHMsIHJlc3VsdCkge1xuICBjb25zdCBmaWVsZHMgPSBhZGRpdGlvbmFsRmllbGRzXG4gICAgLnJlcGxhY2UoJ0JvZHlQcmV2aWV3JywgJ3NuaXBwZXQnKVxuICAgIC5yZXBsYWNlKCdCb2R5JywgICAgICAgICdwYXlsb2FkKHBhcnRzKScpXG4gICAgLnJlcGxhY2UoJ1N1YmplY3QnLCAgICAgJ3BheWxvYWQocGFydHMpJyk7XG5cbiAgcmVzdWx0Lm1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShhd2FpdCByZXF1ZXN0KHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVyaTogKFxuICAgICAgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2dtYWlsLycgK1xuICAgICAgICAndicgICAgICAgICAgICsgYXBpVmVyc2lvbiArXG4gICAgICAgICcvdXNlcnMvJyAgICAgKyB1c2VyRW1haWwgK1xuICAgICAgICAnL21lc3NhZ2VzLycgICsgbWVzc2FnZUlkICtcbiAgICAgICAgJz9maWVsZHM9aWQsdGhyZWFkSWQsbGFiZWxJZHMscGF5bG9hZChoZWFkZXJzKScgKyAoZmllbGRzID8gYCwke2ZpZWxkc31gIDogJycpXG4gICAgKSxcbiAgICBoZWFkZXJzIDoge1xuICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW4sXG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXG4gICAgfVxuICB9KSk7XG5cbiAgLy9yZW1vdmUgc3ViamVjdCBoZWFkZXJcbiAgaWYgKCEvU3ViamVjdC8udGVzdChhZGRpdGlvbmFsRmllbGRzKSkge1xuICAgIGNvbnN0IHN1YmplY3RIZWFkZXIgPSBfLmZpbmQoXG4gICAgICBfLmdldChyZXN1bHQsICdtZXNzYWdlRGF0YS5wYXlsb2FkLmhlYWRlcnMnKSxcbiAgICAgIHsgbmFtZSA6ICdTdWJqZWN0JyB9XG4gICAgKTtcblxuICAgIGlmIChzdWJqZWN0SGVhZGVyKSB7XG4gICAgICBzdWJqZWN0SGVhZGVyLnZhbHVlID0gJyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRBY2Nlc3NUb2tlbihjbGllbnRJZCwgYWRtaW5FbWFpbCwgdXNlckVtYWlsLCBwcml2YXRlS2V5KSB7XG4gIGNvbnN0IHRva2VuUmVxdWVzdFVybCA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvdjMvdG9rZW4nLFxuICAgICAgICB1bml4RXBvY2hUaW1lID0gTWF0aC5mbG9vcigobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMCksXG4gICAgICAgIGp3dEhlYWRlciA9IHtcbiAgICAgICAgICBhbGc6ICdSUzI1NicsXG4gICAgICAgICAgdHlwOiAnSldUJ1xuICAgICAgICB9LFxuICAgICAgICBqd3RQYXlsb2FkID0ge1xuICAgICAgICAgIGlzczogYWRtaW5FbWFpbCxcbiAgICAgICAgICBzY29wZTogJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvZ21haWwucmVhZG9ubHknLFxuICAgICAgICAgIGF1ZDogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgICAgIGV4cDogdW5peEVwb2NoVGltZSArIDM2MDAsXG4gICAgICAgICAgaWF0OiB1bml4RXBvY2hUaW1lLFxuICAgICAgICAgIHN1YjogdXNlckVtYWlsXG4gICAgICAgIH07XG5cbiAgY29uc3QgZW5jb2RlID0gaGVhZGVyID0+IG5ldyBCdWZmZXIoSlNPTi5zdHJpbmdpZnkoaGVhZGVyKSkudG9TdHJpbmcoJ2Jhc2U2NCcpLFxuICAgICAgICBlbmNvZGVkSnd0SGVhZGVyID0gZW5jb2RlKGp3dEhlYWRlciksXG4gICAgICAgIGVuY29kZWRKd3RQYXlsb2FkID0gZW5jb2RlKGp3dFBheWxvYWQpLFxuICAgICAgICBzdHJpbmdUb1NpZ24gPSBbZW5jb2RlZEp3dEhlYWRlciwgZW5jb2RlZEp3dFBheWxvYWRdLmpvaW4oJy4nKSxcbiAgICAgICAgc2lnbmVyID0gY3J5cHRvLmNyZWF0ZVNpZ24oJ1JTQS1TSEEyNTYnKTtcblxuICBzaWduZXIudXBkYXRlKHN0cmluZ1RvU2lnbik7XG5cbiAgY29uc3QgZW5jb2RlZFNpZ25lZEp3dEluZm8gPSBzaWduZXIuc2lnbihwcml2YXRlS2V5LCAnYmFzZTY0JyksXG4gICAgICAgIC8vZGVmaW5lIGFzc2VydGlvblxuICAgICAgICBjbGllbnRBc3NlcnRpb24gPSBbZW5jb2RlZEp3dEhlYWRlciwgZW5jb2RlZEp3dFBheWxvYWQsIGVuY29kZWRTaWduZWRKd3RJbmZvXS5qb2luKCcuJyksXG4gICAgICAgIHRva2VuUmVxdWVzdEZvcm1EYXRhID0ge1xuICAgICAgICAgIGdyYW50X3R5cGU6ICd1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Z3JhbnQtdHlwZTpqd3QtYmVhcmVyJyxcbiAgICAgICAgICBhc3NlcnRpb246IGNsaWVudEFzc2VydGlvblxuICAgICAgICB9O1xuXG4gIGNvbnN0IHJlcXVlc3REYXRhID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRva2VuUmVxdWVzdEZvcm1EYXRhKSxcbiAgICAgICAgcmVxdWVzdERhdGFMZW5ndGggPSByZXF1ZXN0RGF0YS5sZW5ndGg7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBwb3J0OiA0NDMsXG4gICAgICB1cmk6IHRva2VuUmVxdWVzdFVybCxcbiAgICAgIGJvZHk6IHJlcXVlc3REYXRhLFxuICAgICAgbXVsdGlwYXJ0OiBmYWxzZSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogcmVxdWVzdERhdGFMZW5ndGgsXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGlmICh0b2tlbkRhdGEgJiYgdG9rZW5EYXRhLmFjY2Vzc190b2tlbikge1xuICAgICAgcmV0dXJuIHRva2VuRGF0YS5hY2Nlc3NfdG9rZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnQ291bGQgbm90IGdldCBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zdCB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVycikpO1xuICAgIGlmICh0b2tlbkRhdGEubmFtZSA9PT0gJ1N0YXR1c0NvZGVFcnJvcicpIHtcbiAgICAgIGNvbnN0IGVudGlyZU1lc3NhZ2UgPSB0b2tlbkRhdGEubWVzc2FnZSxcbiAgICAgICAgICAgIG1lc3NhZ2VKc29uID0gZW50aXJlTWVzc2FnZS5yZXBsYWNlKHRva2VuRGF0YS5zdGF0dXNDb2RlICsgJyAtICcsICcnKSxcbiAgICAgICAgICAgIG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlSnNvbi5yZXBsYWNlKC9cXFwiL2csJ1wiJykpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWVzc2FnZURhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH1cblxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0VXNlckVtYWlscyhvcHRzKSB7XG5cbiAgY29uc3Qge1xuICAgIGNsaWVudElkLFxuICAgIHNlcnZpY2VFbWFpbCxcbiAgICB1c2VyRW1haWwsXG4gICAgcHJpdmF0ZUtleSxcbiAgICBhcGlWZXJzaW9uLFxuICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICBmaWx0ZXJFbmREYXRlLFxuICAgIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgcmVzdWx0XG4gIH0gPSBvcHRzO1xuXG4gIHRyeSB7XG5cbiAgICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldEFjY2Vzc1Rva2VuKGNsaWVudElkLCBzZXJ2aWNlRW1haWwsIHVzZXJFbWFpbCwgcHJpdmF0ZUtleSksXG4gICAgICAgICAgZW1haWxSZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICB1cmk6IChcbiAgICAgICAgICAgICAgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2dtYWlsLycgK1xuICAgICAgICAgICAgICAgICAgJ3YnICsgYXBpVmVyc2lvbiArXG4gICAgICAgICAgICAgICAgICAnL3VzZXJzLycgKyB1c2VyRW1haWwgK1xuICAgICAgICAgICAgICAgICAgJy9tZXNzYWdlcz9xPWFmdGVyOicgICArIGZpbHRlclN0YXJ0RGF0ZS50b0lTT1N0cmluZygpLnN1YnN0cmluZygwLCAxMCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICcgQU5EIGJlZm9yZTogJyArIGZpbHRlckVuZERhdGUudG9JU09TdHJpbmcoKS5zdWJzdHJpbmcoMCwgMTApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW4sXG4gICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb247b2RhdGEubWV0YWRhdGE9bm9uZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgcmVzdWx0LmRhdGEgPSB7XG4gICAgICBtZXNzYWdlTGlzdDogSlNPTi5wYXJzZShhd2FpdCByZXF1ZXN0KGVtYWlsUmVxdWVzdE9wdGlvbnMpKSxcbiAgICAgIG1lc3NhZ2VzOiBbXVxuICAgIH07XG5cbiAgICByZXR1cm4gYXdhaXQqIF8ubWFwKHJlc3VsdC5kYXRhLm1lc3NhZ2VMaXN0Lm1lc3NhZ2VzLCBtZXNzYWdlID0+IHtcbiAgICAgIHJlc3VsdC5kYXRhLm1lc3NhZ2VzLnB1c2goeyBtZXNzYWdlSWQ6IG1lc3NhZ2UuaWQgfSk7XG4gICAgICByZXR1cm4gZ2V0U2luZ2xlTWVzc2FnZURldGFpbHMoXG4gICAgICAgIG1lc3NhZ2UuaWQsXG4gICAgICAgIHVzZXJFbWFpbCxcbiAgICAgICAgdG9rZW4sXG4gICAgICAgIGFwaVZlcnNpb24sXG4gICAgICAgIGFkZGl0aW9uYWxGaWVsZHMsXG4gICAgICAgIG1lc3NhZ2VcbiAgICAgICk7XG4gICAgfSlcblxuICB9IGNhdGNoIChlcnIpIHtcblxuICAgIHJlc3VsdC5zdWNjZXNzID0gZmFsc2U7XG4gICAgaWYgKGVyci5uYW1lID09PSAnU3RhdHVzQ29kZUVycm9yJykge1xuICAgICAgY29uc3QgZW50aXJlTWVzc2FnZSA9IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgbWVzc2FnZUpzb24gPSBlbnRpcmVNZXNzYWdlLnJlcGxhY2UoZXJyLnN0YXR1c0NvZGUgKyAnIC0gJywgJycpLFxuICAgICAgICAgICAgbWVzc2FnZURhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2VKc29uLnJlcGxhY2UoL1xcXCIvZywnXCInKSk7XG4gICAgICByZXN1bHQuZXJyb3JNZXNzYWdlID0gbWVzc2FnZURhdGEuZXJyb3IubWVzc2FnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LmVycm9yTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuXG4gIH1cblxufVxuXG5mdW5jdGlvbiBnZXRIZWFkZXJWYWx1ZShtZXNzYWdlLCBoZWFkZXJOYW1lKSB7XG4gIGNvbnN0IGhlYWRlclZhbHVlcyA9IF8obWVzc2FnZS5wYXlsb2FkLmhlYWRlcnMpXG4gICAgICAgICAgLmZpbHRlcihoZWFkZXIgPT4gaGVhZGVyLm5hbWUgPT09IGhlYWRlck5hbWUpXG4gICAgICAgICAgLnBsdWNrKCd2YWx1ZScpXG4gICAgICAgICAgLnZhbHVlKCk7XG4gIGlmIChoZWFkZXJWYWx1ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBoZWFkZXJWYWx1ZXNbMF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gVE9ETzogdHJ5IHRvIGNoZWNrIGlmIHRoZXJlIGlzIGFjdHVhbGx5IGFuIGVtYWlsIGFkZHJlc3M/XG5mdW5jdGlvbiBnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nKHZhbHVlKSB7XG4gIHZhciByZXR1cm5PYmplY3QgPSB7XG4gICAgbmFtZTogdmFsdWUsXG4gICAgYWRkcmVzczogdmFsdWVcbiAgfTtcblxuICBpZiAodmFsdWUgJiYgdmFsdWUuaW5kZXhPZignPicpID4gMCkge1xuICAgIHZhciB2YWx1ZUFycmF5ID0gdmFsdWUuc3BsaXQoJyAnKTtcbiAgICByZXR1cm5PYmplY3QuYWRkcmVzcyA9IHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGggLSAxXS5yZXBsYWNlKCc8JywgJycpLnJlcGxhY2UoJz4nLCAnJyk7XG4gICAgcmV0dXJuT2JqZWN0Lm5hbWUgPSB2YWx1ZS5yZXBsYWNlKCcgJyArIHZhbHVlQXJyYXlbdmFsdWVBcnJheS5sZW5ndGggLSAxXSwgJycpO1xuICB9XG5cbiAgcmV0dXJuIHJldHVybk9iamVjdDtcbn07XG5cbnZhciBoYXNMYWJlbCA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGxhYmVsVmFsdWUpIHtcbiAgcmV0dXJuIG1lc3NhZ2UubGFiZWxJZHMuaW5kZXhPZihsYWJlbFZhbHVlKSA+PSAwO1xufTtcblxuXG5mdW5jdGlvbiBtYXBFbWFpbERhdGEoZW1haWxEYXRhKSB7XG4gIHJldHVybiBlbWFpbERhdGEubWFwKHVzZXIgPT4gKHtcbiAgICBlbWFpbDogICAgICAgICAgICB1c2VyLmVtYWlsLFxuICAgIGZpbHRlclN0YXJ0RGF0ZTogIHVzZXIuZmlsdGVyU3RhcnREYXRlLFxuICAgIGZpbHRlckVuZERhdGU6ICAgIHVzZXIuZmlsdGVyRW5kRGF0ZSxcbiAgICBzdWNjZXNzOiAgICAgICAgICB1c2VyLnN1Y2Nlc3MsXG4gICAgZXJyb3JNZXNzYWdlOiAgICAgdXNlci5lcnJvck1lc3NhZ2UsXG4gICAgZGF0YTogICAgICAgICAgICAgIXVzZXIuc3VjY2VzcyA/IFtdIDogdXNlci5kYXRhLm1lc3NhZ2VzLm1hcChjbGVhbk1lc3NhZ2UpXG4gIH0pKTtcbn1cblxuXG5mdW5jdGlvbiBjbGVhbk1lc3NhZ2UobWVzc2FnZSkge1xuXG4gIGNvbnN0IG1lc3NhZ2VEYXRhID0gbWVzc2FnZS5tZXNzYWdlRGF0YSxcbiAgICAgICAgZGF0ZVJlY2VpdmVkID0gZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdSZWNlaXZlZCcpO1xuXG4gIGlmIChkYXRlUmVjZWl2ZWQpIHtcbiAgICB2YXIgZGF0ZVBhcnRPZlZhbHVlID0gZGF0ZVJlY2VpdmVkLnNwbGl0KCc7JylbMV07XG4gICAgbWVzc2FnZS5kYXRlVGltZVJlY2VpdmVkID0gbW9tZW50KG5ldyBEYXRlKGRhdGVQYXJ0T2ZWYWx1ZSkpLnV0YygpLnRvRGF0ZSgpO1xuICB9XG5cbiAgbWVzc2FnZS5pbXBvcnRhbmNlID0gJ05vcm1hbCc7XG4gIGlmIChoYXNMYWJlbChtZXNzYWdlRGF0YSwgJ0lNUE9SVEFOVCcpKSB7XG4gICAgbWVzc2FnZS5pbXBvcnRhbmNlID0gJ0ltcG9ydGFudCc7XG4gIH1cblxuICBpZiAoaGFzTGFiZWwobWVzc2FnZURhdGEsICdTRU5UJykpIHtcbiAgICBtZXNzYWdlLmZvbGRlcklkID0gbWVzc2FnZS5mb2xkZXJOYW1lID0gJ1NlbnQgSXRlbXMnO1xuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2UuZm9sZGVySWQgPSBtZXNzYWdlLmZvbGRlck5hbWUgPSAnSW5ib3gnO1xuICB9XG5cbiAgaWYgKF8uZ2V0KG1lc3NhZ2VEYXRhLCAncGF5bG9hZC5wYXJ0cy5sZW5ndGgnKSkge1xuICAgIG1lc3NhZ2UuY29udGVudFR5cGUgPSBtZXNzYWdlRGF0YS5wYXlsb2FkLnBhcnRzWzBdLm1pbWVUeXBlO1xuICAgIG1lc3NhZ2UuYm9keSA9IG5ldyBCdWZmZXIobWVzc2FnZURhdGEucGF5bG9hZC5wYXJ0c1swXS5ib2R5LmRhdGEsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICB9XG5cbiAgY29uc3QgYWRkcmVzc2VzID0gZmllbGQgPT4gZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsIGZpZWxkKVxuICAgIC5zcGxpdCgnLCcpXG4gICAgLm1hcChnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nKTtcblxuICByZXR1cm4gXy5leHRlbmQobWVzc2FnZSwge1xuICAgIGNvbnZlcnNhdGlvbklkOiAgICAgICAgICAgICAgIG1lc3NhZ2VEYXRhLnRocmVhZElkLFxuICAgIGRhdGVUaW1lU2VudDogICAgICAgICAgICAgICAgIG1vbWVudChuZXcgRGF0ZShnZXRIZWFkZXJWYWx1ZShtZXNzYWdlRGF0YSwgJ0RhdGUnKSkpLnV0YygpLnRvRGF0ZSgpLFxuICAgIGNhdGVnb3JpZXM6ICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VEYXRhLmxhYmVsSWRzLFxuICAgIHN1YmplY3Q6ICAgICAgICAgICAgICAgICAgICAgIGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnU3ViamVjdCcpLFxuICAgIGJvZHlQcmV2aWV3OiAgICAgICAgICAgICAgICAgIG1lc3NhZ2VEYXRhLnNuaXBwZXQsXG4gICAgaXNEZWxpdmVyeVJlY2VpcHRSZXF1ZXN0ZWQ6ICAgbnVsbCxcbiAgICBpc1JlYWRSZWNlaXB0UmVxdWVzdGVkOiAgICAgICBudWxsLFxuICAgIGhhc0F0dGFjaG1lbnRzOiAgICAgICAgICAgICAgIG51bGwsXG4gICAgaXNEcmFmdDogICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICBpc1JlYWQ6ICAgICAgICAgICAgICAgICAgICAgICBoYXNMYWJlbChtZXNzYWdlRGF0YSwgJ1JFQUQnKSxcbiAgICBmcm9tQWRkcmVzczogICAgICAgICAgICAgICAgICBnZXRFbWFpbEFkZHJlc3NPYmplY3RGcm9tU3RyaW5nKGdldEhlYWRlclZhbHVlKG1lc3NhZ2VEYXRhLCAnRnJvbScpKS5hZGRyZXNzLFxuICAgIGZyb21OYW1lOiAgICAgICAgICAgICAgICAgICAgIGdldEVtYWlsQWRkcmVzc09iamVjdEZyb21TdHJpbmcoZ2V0SGVhZGVyVmFsdWUobWVzc2FnZURhdGEsICdGcm9tJykpLm5hbWUsXG4gICAgdG9SZWNpcGllbnRzOiAgICAgICAgICAgICAgICAgYWRkcmVzc2VzKCdUbycpLFxuICAgIGNjUmVjaXBpZW50czogICAgICAgICAgICAgICAgIGFkZHJlc3NlcygnQ2MnKSxcbiAgICBiY2NSZWNpcGllbnRzOiAgICAgICAgICAgICAgICBhZGRyZXNzZXMoJ0JjYycpXG4gIH0pO1xufVxuIl19
//# sourceMappingURL=../../clAdapters/google-calendar/index.js.map
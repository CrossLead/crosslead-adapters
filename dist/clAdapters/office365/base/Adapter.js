'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

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

var _baseAdapter = require('../../base/Adapter');

var _baseAdapter2 = _interopRequireDefault(_baseAdapter);

var _Service = require('./Service');

var _Service2 = _interopRequireDefault(_Service);

var _Configuration = require('./Configuration');

var _Configuration2 = _interopRequireDefault(_Configuration);

/**
 * Common reset, runConnectionTest, and getAccessToken methods...
 */

var Office365BaseAdapter = (function (_Adapter) {
  _inherits(Office365BaseAdapter, _Adapter);

  function Office365BaseAdapter() {
    _classCallCheck(this, Office365BaseAdapter);

    _get(Object.getPrototypeOf(Office365BaseAdapter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Office365BaseAdapter, [{
    key: 'reset',
    value: function reset() {
      delete this._config;
      delete this._service;
      return this;
    }
  }, {
    key: 'init',
    value: function init() {
      return _regeneratorRuntime.async(function init$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _Configuration2['default'](this.credentials);
            this._service = new _Service2['default'](this._config);
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(this._service.init());

          case 4:
            console.log('Successfully initialized ' + this.constructor.name + ' for email: ' + this.credentials.email);
            return context$2$0.abrupt('return', this);

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'runConnectionTest',
    value: function runConnectionTest(connectionData) {
      var today, filterStartDate, filterEndDate, data;
      return _regeneratorRuntime.async(function runConnectionTest$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            this._config = new _Configuration2['default'](connectionData.credentials);

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
      var _config, _config$credentials, clientId, tenantId, certificate, certificateThumbprint, apiVersion, tokenRequestUrl, jwtHeader, accessTokenExpires, jwtPayload, encode, encodedJwtHeader, encodedJwtPayload, stringToSign, encodedSignedJwtInfo, tokenRequestFormData, tokenRequestOptions, tokenData, messageData;

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
            encode = function encode(header) {
              return new Buffer(JSON.stringify(header)).toString('base64');
            }, encodedJwtHeader = encode(jwtHeader), encodedJwtPayload = encode(jwtPayload), stringToSign = encodedJwtHeader + '.' + encodedJwtPayload, encodedSignedJwtInfo = _crypto2['default'].createSign('RSA-SHA256').update(stringToSign).sign(certificate, 'base64');
            tokenRequestFormData = {
              client_id: clientId,
              client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
              grant_type: 'client_credentials',
              resource: 'https://outlook.office365.com/',
              client_assertion: encodedJwtHeader + '.' + encodedJwtPayload + '.' + encodedSignedJwtInfo
            };
            tokenRequestOptions = {
              method: 'POST',
              port: 443,
              uri: tokenRequestUrl,
              formData: tokenRequestFormData
            };
            context$2$0.prev = 17;
            context$2$0.t0 = JSON;
            context$2$0.next = 21;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(tokenRequestOptions));

          case 21:
            context$2$0.t1 = context$2$0.sent;
            tokenData = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (!(tokenData && tokenData.access_token)) {
              context$2$0.next = 27;
              break;
            }

            return context$2$0.abrupt('return', this.accessToken = tokenData.access_token);

          case 27:
            throw new Error('Could not get access token.');

          case 28:
            context$2$0.next = 38;
            break;

          case 30:
            context$2$0.prev = 30;
            context$2$0.t2 = context$2$0['catch'](17);

            if (!(context$2$0.t2.name === 'StatusCodeError')) {
              context$2$0.next = 37;
              break;
            }

            messageData = JSON.parse(context$2$0.t2.message.replace(context$2$0.t2.statusCode + ' - ', '').replace(/\"/g, '"'));
            throw new Error(messageData);

          case 37:
            throw new Error(context$2$0.t2);

          case 38:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[17, 30]]);
    }
  }, {
    key: 'getUserData',
    value: function getUserData(options, userData) {
      var pageToGet = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      var email, filterStartDate, filterEndDate, additionalFields, $filter, apiType, _options$maxPages, maxPages, _options$recordsPerPage, recordsPerPage, accessToken, apiVersion, skip,
      // extract static property...
      baseFields, params, urlParams, requestOptions, parsedBody, _userData$data$value;

      return _regeneratorRuntime.async(function getUserData$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            email = options.email;
            filterStartDate = options.filterStartDate;
            filterEndDate = options.filterEndDate;
            additionalFields = options.additionalFields;
            $filter = options.$filter;
            apiType = options.apiType;
            _options$maxPages = options.maxPages;
            maxPages = _options$maxPages === undefined ? 20 : _options$maxPages;
            _options$recordsPerPage = options.recordsPerPage;
            recordsPerPage = _options$recordsPerPage === undefined ? 25 : _options$recordsPerPage;

            // accumulation of data
            userData = userData || { email: email, filterStartDate: filterStartDate, filterEndDate: filterEndDate };

            context$2$0.next = 13;
            return _regeneratorRuntime.awrap(this.getAccessToken());

          case 13:
            accessToken = context$2$0.sent;
            apiVersion = this._config.options.apiVersion;
            skip = (pageToGet - 1) * recordsPerPage + 1;
            baseFields = this.constructor.baseFields;
            params = {
              $filter: $filter,
              $top: recordsPerPage,
              $skip: skip,
              $select: baseFields.join(',') + additionalFields
            };
            urlParams = (0, _lodash2['default'])(params).map(function (value, key) {
              return key + '=' + value;
            }).join('&');
            requestOptions = {
              method: 'GET',
              uri: 'https://outlook.office365.com/api/v' + apiVersion + '/users(\'' + email + '\')/' + apiType + '?' + urlParams,
              headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json;odata.metadata=none'
              }
            };
            context$2$0.prev = 20;

            userData.success = true;
            context$2$0.t0 = JSON;
            context$2$0.next = 25;
            return _regeneratorRuntime.awrap((0, _requestPromise2['default'])(requestOptions));

          case 25:
            context$2$0.t1 = context$2$0.sent;
            parsedBody = context$2$0.t0.parse.call(context$2$0.t0, context$2$0.t1);

            if (parsedBody && pageToGet === 1) {
              userData.data = parsedBody;
            }

            if (parsedBody.value && pageToGet > 1) {
              (_userData$data$value = userData.data.value).push.apply(_userData$data$value, _toConsumableArray(parsedBody.value));
            }

            // if the returned results are the maximum number of records per page,
            // we are not done yet, so recurse...

            if (!(parsedBody && parsedBody.value.length === recordsPerPage && pageToGet <= maxPages)) {
              context$2$0.next = 33;
              break;
            }

            return context$2$0.abrupt('return', this.getUserData(options, userData, pageToGet + 1));

          case 33:
            return context$2$0.abrupt('return', userData);

          case 34:
            context$2$0.next = 40;
            break;

          case 36:
            context$2$0.prev = 36;
            context$2$0.t2 = context$2$0['catch'](20);

            _Object$assign(userData, {
              success: false,
              errorMessage: context$2$0.t2.name !== 'StatusCodeError' ? JSON.stringify(context$2$0.t2) : JSON.parse(context$2$0.t2.message.replace(context$2$0.t2.statusCode + ' - ', '').replace(/\"/g, '"')).message
            });
            return context$2$0.abrupt('return', true);

          case 40:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[20, 36]]);
    }
  }]);

  return Office365BaseAdapter;
})(_baseAdapter2['default']);

exports['default'] = Office365BaseAdapter;
module.exports = exports['default'];

//to see if it really worked, we need to pass in the first result

// expire token in one hour

// parameters to query email with...

// format parameters for url
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsQWRhcHRlcnMvb2ZmaWNlMzY1L2Jhc2UvQWRhcHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUF1QyxXQUFXOzs7O3NCQUNYLFFBQVE7Ozs7OEJBQ1IsaUJBQWlCOzs7O3NCQUNqQixRQUFROzs7O3NCQUNSLFFBQVE7Ozs7MkJBQ1Isb0JBQW9COzs7O3VCQUNwQixXQUFXOzs7OzZCQUNYLGlCQUFpQjs7Ozs7Ozs7SUFNbkMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7OztlQUFwQixvQkFBb0I7O1dBR2xDLGlCQUFHO0FBQ04sYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNyQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUzs7OztBQUNSLGdCQUFJLENBQUMsT0FBTyxHQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDaEUsZ0JBQUksQ0FBQyxRQUFRLEdBQUcseUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7NkNBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFOzs7QUFDMUIsbUJBQU8sQ0FBQyxHQUFHLCtCQUE2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksb0JBQWUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUcsQ0FBQztnREFDL0YsSUFBSTs7Ozs7OztLQUNaOzs7V0FHc0IsMkJBQUMsY0FBYztVQUc5QixLQUFLLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixJQUFJOzs7O0FBTFYsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsK0JBQStCLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFcEUsaUJBQUssR0FBYSxTQUFsQixLQUFLO3FCQUFtQiwwQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFL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anMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdXVpZCAgICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbm9kZS11dWlkJztcbmltcG9ydCBjcnlwdG8gICAgICAgICAgICAgICAgICAgICBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHJlcXVlc3QgICAgICAgICAgICAgICAgICAgIGZyb20gJ3JlcXVlc3QtcHJvbWlzZSc7XG5pbXBvcnQgbW9tZW50ICAgICAgICAgICAgICAgICAgICAgZnJvbSAnbW9tZW50JztcbmltcG9ydCBfICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEFkYXB0ZXIgICAgICAgICAgICAgICAgICAgIGZyb20gJy4uLy4uL2Jhc2UvQWRhcHRlcic7XG5pbXBvcnQgT2ZmaWNlMzY1QmFzZVNlcnZpY2UgICAgICAgZnJvbSAnLi9TZXJ2aWNlJztcbmltcG9ydCBPZmZpY2UzNjVCYXNlQ29uZmlndXJhdGlvbiBmcm9tICcuL0NvbmZpZ3VyYXRpb24nO1xuXG5cbi8qKlxuICogQ29tbW9uIHJlc2V0LCBydW5Db25uZWN0aW9uVGVzdCwgYW5kIGdldEFjY2Vzc1Rva2VuIG1ldGhvZHMuLi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2ZmaWNlMzY1QmFzZUFkYXB0ZXIgZXh0ZW5kcyBBZGFwdGVyIHtcblxuXG4gIHJlc2V0KCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jb25maWc7XG4gICAgZGVsZXRlIHRoaXMuX3NlcnZpY2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhc3luYyBpbml0KCkge1xuICAgIHRoaXMuX2NvbmZpZyAgPSBuZXcgT2ZmaWNlMzY1QmFzZUNvbmZpZ3VyYXRpb24odGhpcy5jcmVkZW50aWFscylcbiAgICB0aGlzLl9zZXJ2aWNlID0gbmV3IE9mZmljZTM2NUJhc2VTZXJ2aWNlKHRoaXMuX2NvbmZpZyk7XG4gICAgYXdhaXQgdGhpcy5fc2VydmljZS5pbml0KCk7XG4gICAgY29uc29sZS5sb2coYFN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZCAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZm9yIGVtYWlsOiAke3RoaXMuY3JlZGVudGlhbHMuZW1haWx9YCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG4gIGFzeW5jIHJ1bkNvbm5lY3Rpb25UZXN0KGNvbm5lY3Rpb25EYXRhKSB7XG4gICAgdGhpcy5fY29uZmlnID0gbmV3IE9mZmljZTM2NUJhc2VDb25maWd1cmF0aW9uKGNvbm5lY3Rpb25EYXRhLmNyZWRlbnRpYWxzKTtcblxuICAgIGNvbnN0IHRvZGF5ICAgICAgICAgICA9ICgpID0+IG1vbWVudCgpLnV0YygpLnN0YXJ0T2YoJ2RheScpLFxuICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSA9IHRvZGF5KCkuYWRkKC0xLCAnZGF5cycpLnRvRGF0ZSgpLFxuICAgICAgICAgIGZpbHRlckVuZERhdGUgICA9IHRvZGF5KCkudG9EYXRlKCksXG4gICAgICAgICAgZGF0YSAgICAgICAgICAgID0gYXdhaXQgdGhpcy5nZXRCYXRjaERhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbdGhpcy5fY29uZmlnLmNyZWRlbnRpYWxzLmVtYWlsXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAvL3RvIHNlZSBpZiBpdCByZWFsbHkgd29ya2VkLCB3ZSBuZWVkIHRvIHBhc3MgaW4gdGhlIGZpcnN0IHJlc3VsdFxuICAgIHJldHVybiBkYXRhLnN1Y2Nlc3MgJiYgZGF0YS5yZXN1bHRzWzBdID8gZGF0YS5yZXN1bHRzWzBdOiBkYXRhO1xuICB9XG5cblxuICBhc3luYyBnZXRBY2Nlc3NUb2tlbigpIHtcblxuICAgIGlmICh0aGlzLmFjY2Vzc1Rva2VuICYmIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzID4gbmV3IERhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWNjZXNzVG9rZW47XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgY3JlZGVudGlhbHMgOiB7XG4gICAgICAgIGNsaWVudElkLFxuICAgICAgICB0ZW5hbnRJZCxcbiAgICAgICAgY2VydGlmaWNhdGUsXG4gICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludFxuICAgICAgfSxcbiAgICAgIG9wdGlvbnMgOiB7XG4gICAgICAgIGFwaVZlcnNpb25cbiAgICAgIH1cbiAgICB9ID0gdGhpcy5fY29uZmlnO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0VXJsID0gYGh0dHBzOi8vbG9naW4ubWljcm9zb2Z0b25saW5lLmNvbS8ke3RlbmFudElkfS9vYXV0aDIvdG9rZW4/YXBpLXZlcnNpb249JHthcGlWZXJzaW9ufWA7XG5cbiAgICBjb25zdCBqd3RIZWFkZXIgPSB7XG4gICAgICAnYWxnJzogJ1JTMjU2JyxcbiAgICAgICd4NXQnOiBjZXJ0aWZpY2F0ZVRodW1icHJpbnRcbiAgICB9O1xuXG4gICAgLy8gZXhwaXJlIHRva2VuIGluIG9uZSBob3VyXG4gICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmVzID0gKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyAzNjAwMDApIC8gMTAwMDtcblxuICAgIC8vIGdyYWIgbmV3IGFjY2VzcyB0b2tlbiAxMCBzZWNvbmRzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXMgPSBuZXcgRGF0ZShhY2Nlc3NUb2tlbkV4cGlyZXMqMTAwMCAtIDEwMDAwKTtcblxuICAgIGNvbnN0IGp3dFBheWxvYWQgPSB7XG4gICAgICAnYXVkJzogdG9rZW5SZXF1ZXN0VXJsLFxuICAgICAgJ2V4cCc6IGFjY2Vzc1Rva2VuRXhwaXJlcyxcbiAgICAgICdpc3MnOiBjbGllbnRJZCxcbiAgICAgICdqdGknOiB1dWlkLnY0KCksXG4gICAgICAnbmJmJzogYWNjZXNzVG9rZW5FeHBpcmVzIC0gMiozNjAwLCAvLyBvbmUgaG91ciBiZWZvcmUgbm93XG4gICAgICAnc3ViJzogY2xpZW50SWRcbiAgICB9O1xuXG4gICAgY29uc3QgZW5jb2RlICAgICAgICAgICAgICAgPSBoZWFkZXIgPT4gbmV3IEJ1ZmZlcihKU09OLnN0cmluZ2lmeShoZWFkZXIpKS50b1N0cmluZygnYmFzZTY0JyksXG4gICAgICAgICAgZW5jb2RlZEp3dEhlYWRlciAgICAgPSBlbmNvZGUoand0SGVhZGVyKSxcbiAgICAgICAgICBlbmNvZGVkSnd0UGF5bG9hZCAgICA9IGVuY29kZShqd3RQYXlsb2FkKSxcbiAgICAgICAgICBzdHJpbmdUb1NpZ24gICAgICAgICA9IGVuY29kZWRKd3RIZWFkZXIgKyAnLicgKyBlbmNvZGVkSnd0UGF5bG9hZCxcbiAgICAgICAgICBlbmNvZGVkU2lnbmVkSnd0SW5mbyA9IGNyeXB0b1xuICAgICAgICAgICAgLmNyZWF0ZVNpZ24oJ1JTQS1TSEEyNTYnKVxuICAgICAgICAgICAgLnVwZGF0ZShzdHJpbmdUb1NpZ24pXG4gICAgICAgICAgICAuc2lnbihjZXJ0aWZpY2F0ZSwgJ2Jhc2U2NCcpO1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0Rm9ybURhdGEgPSB7XG4gICAgICBjbGllbnRfaWQ6IGNsaWVudElkLFxuICAgICAgY2xpZW50X2Fzc2VydGlvbl90eXBlOiAndXJuOmlldGY6cGFyYW1zOm9hdXRoOmNsaWVudC1hc3NlcnRpb24tdHlwZTpqd3QtYmVhcmVyJyxcbiAgICAgIGdyYW50X3R5cGU6ICdjbGllbnRfY3JlZGVudGlhbHMnLFxuICAgICAgcmVzb3VyY2U6ICdodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS8nLFxuICAgICAgY2xpZW50X2Fzc2VydGlvbjogZW5jb2RlZEp3dEhlYWRlciArICcuJyArIGVuY29kZWRKd3RQYXlsb2FkICsgJy4nICsgZW5jb2RlZFNpZ25lZEp3dEluZm9cbiAgICB9O1xuXG4gICAgY29uc3QgdG9rZW5SZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgcG9ydDogNDQzLFxuICAgICAgdXJpOiB0b2tlblJlcXVlc3RVcmwsXG4gICAgICBmb3JtRGF0YTogdG9rZW5SZXF1ZXN0Rm9ybURhdGEsXG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbkRhdGEgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3QodG9rZW5SZXF1ZXN0T3B0aW9ucykpO1xuICAgICAgaWYgKHRva2VuRGF0YSAmJiB0b2tlbkRhdGEuYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjY2Vzc1Rva2VuID0gdG9rZW5EYXRhLmFjY2Vzc190b2tlbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGdldCBhY2Nlc3MgdG9rZW4uJyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAodG9rZW5EYXRhKSB7XG4gICAgICBpZiAodG9rZW5EYXRhLm5hbWUgPT09ICdTdGF0dXNDb2RlRXJyb3InKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShcbiAgICAgICAgICB0b2tlbkRhdGFcbiAgICAgICAgICAgIC5tZXNzYWdlXG4gICAgICAgICAgICAucmVwbGFjZSh0b2tlbkRhdGEuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFwiL2csICdcIicpXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2VEYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0b2tlbkRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgYXN5bmMgZ2V0VXNlckRhdGEob3B0aW9ucywgdXNlckRhdGEsIHBhZ2VUb0dldD0xKSB7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbWFpbCxcbiAgICAgIGZpbHRlclN0YXJ0RGF0ZSxcbiAgICAgIGZpbHRlckVuZERhdGUsXG4gICAgICBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgJGZpbHRlcixcbiAgICAgIGFwaVR5cGUsXG4gICAgICBtYXhQYWdlcyA9IDIwLFxuICAgICAgcmVjb3Jkc1BlclBhZ2UgPSAyNVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgLy8gYWNjdW11bGF0aW9uIG9mIGRhdGFcbiAgICB1c2VyRGF0YSA9IHVzZXJEYXRhIHx8IHsgZW1haWwsIGZpbHRlclN0YXJ0RGF0ZSwgZmlsdGVyRW5kRGF0ZSB9O1xuXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gICAgICAgICAgPSBhd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKCksXG4gICAgICAgICAgeyBhcGlWZXJzaW9uIH0gICAgICAgPSB0aGlzLl9jb25maWcub3B0aW9ucyxcbiAgICAgICAgICBza2lwICAgICAgICAgICAgICAgICA9ICgocGFnZVRvR2V0IC0xKSAqIHJlY29yZHNQZXJQYWdlKSArIDEsXG4gICAgICAgICAgLy8gZXh0cmFjdCBzdGF0aWMgcHJvcGVydHkuLi5cbiAgICAgICAgICB7IGJhc2VGaWVsZHMgfSAgICAgICA9IHRoaXMuY29uc3RydWN0b3IsXG4gICAgICAgICAgLy8gcGFyYW1ldGVycyB0byBxdWVyeSBlbWFpbCB3aXRoLi4uXG4gICAgICAgICAgcGFyYW1zICAgICAgICAgICAgICAgPSB7XG4gICAgICAgICAgICAkZmlsdGVyLFxuICAgICAgICAgICAgJHRvcDogICAgIHJlY29yZHNQZXJQYWdlLFxuICAgICAgICAgICAgJHNraXA6ICAgIHNraXAsXG4gICAgICAgICAgICAkc2VsZWN0OiAgYmFzZUZpZWxkcy5qb2luKCcsJykgKyBhZGRpdGlvbmFsRmllbGRzLFxuICAgICAgICAgIH07XG5cbiAgICAvLyBmb3JtYXQgcGFyYW1ldGVycyBmb3IgdXJsXG4gICAgY29uc3QgdXJsUGFyYW1zID0gXyhwYXJhbXMpXG4gICAgICAubWFwKCh2YWx1ZSwga2V5KSA9PiBgJHtrZXl9PSR7dmFsdWV9YClcbiAgICAgIC5qb2luKCcmJyk7XG5cbiAgICBjb25zdCByZXF1ZXN0T3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmk6IGBodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbS9hcGkvdiR7YXBpVmVyc2lvbn0vdXNlcnMoJyR7ZW1haWx9JykvJHthcGlUeXBlfT8ke3VybFBhcmFtc31gLFxuICAgICAgaGVhZGVycyA6IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FjY2Vzc1Rva2VufWAsXG4gICAgICAgIEFjY2VwdDogICAgICAgICdhcHBsaWNhdGlvbi9qc29uO29kYXRhLm1ldGFkYXRhPW5vbmUnXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRyeSB7XG4gICAgICB1c2VyRGF0YS5zdWNjZXNzID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHBhcnNlZEJvZHkgPSBKU09OLnBhcnNlKGF3YWl0IHJlcXVlc3QocmVxdWVzdE9wdGlvbnMpKTtcblxuICAgICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFnZVRvR2V0ID09PSAxKSB7XG4gICAgICAgIHVzZXJEYXRhLmRhdGEgPSBwYXJzZWRCb2R5O1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyc2VkQm9keS52YWx1ZSAmJiBwYWdlVG9HZXQgPiAxKSB7XG4gICAgICAgIHVzZXJEYXRhLmRhdGEudmFsdWUucHVzaCguLi5wYXJzZWRCb2R5LnZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHJldHVybmVkIHJlc3VsdHMgYXJlIHRoZSBtYXhpbXVtIG51bWJlciBvZiByZWNvcmRzIHBlciBwYWdlLFxuICAgICAgLy8gd2UgYXJlIG5vdCBkb25lIHlldCwgc28gcmVjdXJzZS4uLlxuICAgICAgaWYgKHBhcnNlZEJvZHkgJiYgcGFyc2VkQm9keS52YWx1ZS5sZW5ndGggPT09IHJlY29yZHNQZXJQYWdlICYmIHBhZ2VUb0dldCA8PSBtYXhQYWdlcykge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YShvcHRpb25zLCB1c2VyRGF0YSwgcGFnZVRvR2V0ICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdXNlckRhdGE7XG4gICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24odXNlckRhdGEsIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yTWVzc2FnZTogZXJyLm5hbWUgIT09ICdTdGF0dXNDb2RlRXJyb3InID9cbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGVycikgICAgICAgICAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShlcnIuc3RhdHVzQ29kZSArICcgLSAnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tZXNzYWdlXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICB9XG5cbn1cbiJdfQ==
//# sourceMappingURL=../../../clAdapters/office365/base/Adapter.js.map